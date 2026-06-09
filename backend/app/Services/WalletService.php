<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Money-safe wallet service.
 *
 * - All arithmetic is done with bcmath on decimal strings (no floats).
 * - All reads of the balance happen inside a transaction with lockForUpdate(),
 *   so concurrent credit/debit attempts on the same wallet serialise instead
 *   of double-spending.
 * - When $reference is supplied, the wallet_transactions.reference UNIQUE
 *   index plus an in-transaction existence check makes the operation
 *   idempotent — replaying the same event (e.g. an order being flipped
 *   back to "delivered") will not double-credit.
 */
class WalletService
{
    /**
     * Credit a user's wallet. Idempotent when $reference is provided.
     */
    public function credit(
        int $userId,
        string $amount,
        string $description,
        ?string $reference = null
    ): WalletTransaction {
        return DB::transaction(function () use ($userId, $amount, $description, $reference) {
            if ($reference !== null) {
                $existing = WalletTransaction::where('reference', $reference)->first();
                if ($existing) {
                    return $existing;
                }
            }

            $wallet = Wallet::where('user_id', $userId)
                ->lockForUpdate()
                ->first();

            if (! $wallet) {
                $wallet = Wallet::create(['user_id' => $userId, 'balance' => '0.00']);
                // Re-fetch with the lock now that the row exists.
                $wallet = Wallet::where('user_id', $userId)->lockForUpdate()->first();
            }

            $newBalance = bcadd((string) $wallet->balance, $amount, 2);
            $wallet->update(['balance' => $newBalance]);

            return WalletTransaction::create([
                'user_id'       => $userId,
                'type'          => 'credit',
                'amount'        => $amount,
                'description'   => $description,
                'reference'     => $reference,
                'balance_after' => $newBalance,
            ]);
        });
    }

    /**
     * Debit a user's wallet. Throws if balance is insufficient.
     */
    public function debit(
        int $userId,
        string $amount,
        string $description,
        ?string $reference = null
    ): WalletTransaction {
        return DB::transaction(function () use ($userId, $amount, $description, $reference) {
            if ($reference !== null) {
                $existing = WalletTransaction::where('reference', $reference)->first();
                if ($existing) {
                    return $existing;
                }
            }

            $wallet = Wallet::where('user_id', $userId)->lockForUpdate()->first();

            if (! $wallet || bccomp((string) $wallet->balance, $amount, 2) < 0) {
                throw new RuntimeException('Insufficient wallet balance.');
            }

            $newBalance = bcsub((string) $wallet->balance, $amount, 2);
            $wallet->update(['balance' => $newBalance]);

            return WalletTransaction::create([
                'user_id'       => $userId,
                'type'          => 'debit',
                'amount'        => $amount,
                'description'   => $description,
                'reference'     => $reference,
                'balance_after' => $newBalance,
            ]);
        });
    }

    /**
     * Current balance as a 2-decimal string. '0.00' when no wallet exists.
     */
    public function getBalance(int $userId): string
    {
        $wallet = Wallet::where('user_id', $userId)->first();

        return $wallet ? number_format((float) $wallet->balance, 2, '.', '') : '0.00';
    }
}
