<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVendorRequest extends FormRequest
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
            // A new user account is auto-created from these fields and linked to
            // the vendor; no existing user id is supplied.
            'shop_name' => ['required', 'string', 'max:255'],
            'proprietor_name' => ['nullable', 'string', 'max:255'],
            // Phone is the user identifier — must be unique across users.
            'phone' => ['required', 'string', 'max:20', Rule::unique('users', 'phone')],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'division' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'sr_name' => ['nullable', 'string', 'max:255'],
            'sr_mobile' => ['nullable', 'string', 'max:20'],
            'delivery_zone_id' => ['nullable', 'integer', Rule::exists('delivery_zones', 'id')],
            'commission_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'status' => ['required', Rule::in(['pending', 'approved', 'suspended'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
