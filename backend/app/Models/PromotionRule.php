<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromotionRule extends Model
{
    protected $fillable = [
        'name', 'trigger_product_id', 'trigger_quantity',
        'free_product_id', 'free_quantity', 'is_active',
    ];

    protected $casts = [
        'trigger_quantity' => 'integer',
        'free_quantity'    => 'integer',
        'is_active'        => 'boolean',
    ];

    public function triggerProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'trigger_product_id');
    }

    public function freeProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'free_product_id');
    }
}
