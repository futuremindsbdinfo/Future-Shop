<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'description', 'discount_percentage',
        'usage_limit', 'used_count', 'is_first_purchase_only',
        'is_active', 'wallet_credit_enabled', 'expires_at',
    ];

    protected $casts = [
        'discount_percentage'    => 'integer',
        'usage_limit'            => 'integer',
        'used_count'             => 'integer',
        'is_first_purchase_only' => 'boolean',
        'is_active'              => 'boolean',
        'wallet_credit_enabled'  => 'boolean',
        'expires_at'             => 'datetime',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }
}
