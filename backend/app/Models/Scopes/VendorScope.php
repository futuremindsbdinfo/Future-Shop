<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class VendorScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Only apply if there's an authenticated user and their role is vendor
        if (Auth::hasUser() && Auth::user()->role === 'vendor') {
            $vendorId = Auth::user()->vendor->id ?? 0;
            // Assuming the model has a 'vendor_id' column
            $builder->where($model->getTable() . '.vendor_id', $vendorId);
        }
    }
}
