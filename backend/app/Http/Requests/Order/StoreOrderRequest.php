<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Note: NO price/total fields are accepted from the client — the server
     * recomputes everything from the database.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['required', 'string', 'max:20'],
            'shipping_address' => ['required', 'string', 'max:1000'],
            'shipping_division' => ['nullable', 'string', 'max:100'],
            'shipping_district' => ['nullable', 'string', 'max:100'],
            'delivery_zone_id' => ['required', 'integer', Rule::exists('delivery_zones', 'id')->where('is_active', true)],
            'payment_method' => ['required', Rule::in(['cod', 'bkash', 'nagad', 'rocket', 'card'])],
            'notes' => ['nullable', 'string', 'max:1000'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'use_wallet' => ['nullable', 'boolean'],
        ];
    }
}
