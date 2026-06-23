<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    protected $fillable = ['name', 'slug', 'logo', 'description', 'is_active'];

    protected $casts = [
        'logo'      => 'array',
        'is_active' => 'boolean',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Vendors that sell this brand (many-to-many via the brand_vendor pivot).
     */
    public function vendors(): BelongsToMany
    {
        return $this->belongsToMany(Vendor::class);
    }
}
