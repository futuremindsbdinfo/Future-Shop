<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVendorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'shop_name' => ['sometimes', 'string', 'max:255'],
            'proprietor_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'division' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'sr_name' => ['nullable', 'string', 'max:255'],
            'sr_mobile' => ['nullable', 'string', 'max:20'],
            'delivery_zone_id' => ['nullable', 'integer', Rule::exists('delivery_zones', 'id')],
            'commission_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'status' => ['sometimes', Rule::in(['pending', 'approved', 'suspended'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
