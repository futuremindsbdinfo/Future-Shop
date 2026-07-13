<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Scopes\VendorOrderScope;

class Order extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::addGlobalScope(new VendorOrderScope);
    }

    /**
     * @var list<string>
     */
    protected $fillable = [
        'order_number',
        'user_id',
        'delivery_user_id',
        'delivery_zone_id',
        'promo_code_id',
        'coupon_id',
        'subtotal',
        'delivery_charge',
        'discount',
        'wallet_used',
        'total',
        'payment_method',
        'payment_status',
        'payment_code',
        'online_transaction_id',
        'order_status',
        'shipping_name',
        'shipping_phone',
        'shipping_address',
        'shipping_division',
        'shipping_district',
        'delivery_address',
        'notes',
        'delivered_at',
        'stock_restored_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'delivery_charge' => 'decimal:2',
            'discount' => 'decimal:2',
            'wallet_used' => 'decimal:2',
            'total' => 'decimal:2',
            'delivery_address' => 'array',
            'delivered_at' => 'datetime',
            'stock_restored_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deliveryUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delivery_user_id');
    }

    public function deliveryZone(): BelongsTo
    {
        return $this->belongsTo(DeliveryZone::class);
    }

    /**
     * Legacy promo code (separate from Batch D coupon system).
     */
    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }

    /**
     * Batch D coupon applied to this order (separate FK column from promo_code_id).
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class, 'coupon_id');
    }

    public function couponUsage(): HasOne
    {
        return $this->hasOne(CouponUsage::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
