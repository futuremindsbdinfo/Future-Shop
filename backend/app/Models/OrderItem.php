<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Scopes\VendorScope;

class OrderItem extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::addGlobalScope(new VendorScope);
    }

    /**
     * @var list<string>
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'vendor_id',
        'product_name',
        'price',
        'quantity',
        'subtotal',
        'commission',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'quantity' => 'integer',
            'subtotal' => 'decimal:2',
            'commission' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
