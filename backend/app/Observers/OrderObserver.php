<?php

namespace App\Observers;

use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\WalletTransaction;
use App\Services\WalletService;
use Illuminate\Support\Facades\DB;

/**
 * Fires when an Order is updated. The `wasChanged('order_status')` guard
 * ensures we only act on actual status transitions — so re-saving an
 * already-delivered order (or any unrelated field update) never re-credits
 * a wallet. Combined with the wallet_transactions.reference UNIQUE index,
 * this gives dual-layer idempotency.
 */
class OrderObserver
{
    public function __construct(private WalletService $walletService)
    {
    }

    public function updated(Order $order): void
    {
        if (! $order->wasChanged('order_status')) {
            return;
        }

        if ($order->order_status === 'delivered') {
            $this->handleDelivered($order);
        } elseif ($order->order_status === 'cancelled') {
            $this->handleCancelled($order);
        }
    }

    private function handleDelivered(Order $order): void
    {
        $order->updateQuietly(['delivered_at' => now()]);

        // Single source of truth for "what happens when an order becomes delivered":
        // COD payment confirmation, referral credit, coupon cashback.
        // updateQuietly + Transaction unique-reference guard prevents observer loops
        // and double-execution if the order is re-flipped to delivered later.
        if ($order->payment_method === 'cod' && $order->payment_status !== 'paid') {
            $codRef = 'CODCOLLECT-'.$order->order_number;
            if (Transaction::where('reference', $codRef)->doesntExist()) {
                $order->updateQuietly(['payment_status' => 'paid']);

                Transaction::create([
                    'order_id'         => $order->id,
                    'vendor_id'        => null,
                    'reference'        => $codRef,
                    'payment_method'   => 'cod',
                    'type'             => 'payment',
                    'amount'           => $order->total,
                    'status'           => 'completed',
                    'gateway_response' => null,
                ]);
            }
        }

        $this->awardReferralCredit($order);
        $this->awardCouponWalletCredit($order);
    }

    private function handleCancelled(Order $order): void
    {
        // At-most-once guard: if this order's stock was already restored, a
        // repeat transition (cancelled → other → cancelled) must NOT restock
        // again — that would silently inflate inventory (oversell risk). The
        // wallet refund is reference-idempotent on its own, but COD orders have
        // wallet_used = 0, so this flag is the only guard for the stock part.
        if ($order->stock_restored_at) {
            return;
        }

        DB::transaction(function () use ($order) {
            $order->loadMissing('items.product');

            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock_quantity', $item->quantity);
                }
            }

            if (bccomp((string) $order->wallet_used, '0.00', 2) > 0) {
                $refundRef = 'REFUND-ORD-'.$order->order_number;
                $this->walletService->credit(
                    $order->user_id,
                    (string) $order->wallet_used,
                    'Refund for cancelled order #'.$order->order_number,
                    $refundRef
                );
            }

            if ($order->coupon_id) {
                $usage = CouponUsage::where('order_id', $order->id)->first();
                if ($usage) {
                    $coupon = $usage->coupon;
                    $usage->delete();
                    if ($coupon) {
                        $coupon->decrement('used_count');
                    }
                }
            }

            Transaction::where('order_id', $order->id)
                ->where('status', 'pending')
                ->update(['status' => 'failed']);

            // Mark the restock done INSIDE the transaction so the flag and the
            // stock increments commit (or roll back) together. updateQuietly —
            // no observer re-trigger, same as delivered_at in handleDelivered.
            $order->updateQuietly(['stock_restored_at' => now()]);
        });
    }

    /**
     * Credit the referrer + referred user 10% of the order total when the
     * referred user's FIRST order is delivered.
     */
    private function awardReferralCredit(Order $order): void
    {
        $user = $order->user()->with('referredBy')->first();
        if (! $user || ! $user->referred_by_id) {
            return;
        }

        // Only the user's FIRST delivered order triggers the bonus.
        $firstDeliveredOrderId = Order::where('user_id', $user->id)
            ->where('order_status', 'delivered')
            ->orderBy('id')
            ->value('id');

        if ($firstDeliveredOrderId !== $order->id) {
            return;
        }

        $referralRef = 'REFERRAL-ORD-'.$order->id;

        // Idempotency: if either side was already credited, bail.
        if (WalletTransaction::where('reference', $referralRef.'-referred')->exists()) {
            return;
        }

        // 10% of order total.
        $creditAmount = bcmul((string) $order->total, '0.10', 2);

        DB::transaction(function () use ($user, $creditAmount, $referralRef) {
            $this->walletService->credit(
                $user->id,
                $creditAmount,
                'Referral reward — your first order was delivered',
                $referralRef.'-referred'
            );

            $this->walletService->credit(
                $user->referred_by_id,
                $creditAmount,
                "Referral commission — a friend's first order was delivered",
                $referralRef.'-referrer'
            );
        });
    }

    /**
     * When a coupon was applied to this order, credit its discount value
     * to the customer's wallet on delivery (cashback model).
     */
    private function awardCouponWalletCredit(Order $order): void
    {
        $usage = CouponUsage::where('order_id', $order->id)
            ->where('wallet_credited', false)
            ->with('coupon')
            ->first();

        if (! $usage || ! $usage->coupon || ! $usage->coupon->wallet_credit_enabled) {
            return;
        }

        DB::transaction(function () use ($order, $usage) {
            $this->walletService->credit(
                $order->user_id,
                (string) $usage->discount_amount,
                'Coupon cashback — order #'.$order->order_number.' delivered',
                'COUPON-ORD-'.$order->id
            );

            $usage->update([
                'wallet_credited' => true,
                'credited_at'     => now(),
            ]);

            $usage->coupon()->increment('used_count');
        });
    }
}
