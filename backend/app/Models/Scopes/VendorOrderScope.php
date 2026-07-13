<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class VendorOrderScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Only apply if there's an authenticated user and their role is vendor
        if (Auth::hasUser() && Auth::user()->role === 'vendor') {
            $vendorId = Auth::user()->vendor->id ?? 0;
            // Orders don't have vendor_id, they have items that belong to vendors.
            // A vendor should only see orders that contain at least one of their items.
            $builder->whereHas('items', function ($query) use ($vendorId) {
                // We must use withoutGlobalScope here if VendorScope is applied to OrderItem
                // but since the subquery is just generating a WHERE EXISTS, it will be fine
                // even if VendorScope applies. However, explicitly specifying vendor_id is safer.
                $query->where('order_items.vendor_id', $vendorId);
            });
        }
    }
}
