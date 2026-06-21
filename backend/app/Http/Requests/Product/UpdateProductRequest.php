<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    /**
     * Only admins may update products (route is also gated by role:admin).
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'vendor_id' => ['sometimes', 'integer', Rule::exists('vendors', 'id')],
            'category_id' => ['sometimes', 'integer', Rule::exists('categories', 'id')],
            'brand_id' => ['nullable', 'integer', Rule::exists('brands', 'id')],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0', 'max:99999999.99'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lte:price'],
            'cost_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'is_featured' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(['draft', 'published', 'out_of_stock'])],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['file', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            // Display-only extra details (not variants). Capped at 20 pairs.
            'attributes' => ['nullable', 'array', 'max:20'],
            'attributes.*.title' => ['required_with:attributes', 'string', 'max:60'],
            'attributes.*.value' => ['required_with:attributes', 'string', 'max:255'],
        ];
    }

    /**
     * Normalise free-form attributes before validation: keep only {title, value}
     * (drop any extra keys), trim both, discard rows where either is blank, and
     * collapse an all-empty set to null so nothing junk is persisted.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('attributes')) {
            return;
        }

        $raw = $this->input('attributes');
        if (! is_array($raw)) {
            $this->merge(['attributes' => null]);

            return;
        }

        $clean = [];
        foreach ($raw as $row) {
            if (! is_array($row)) {
                continue;
            }
            $title = trim((string) ($row['title'] ?? ''));
            $value = trim((string) ($row['value'] ?? ''));
            if ($title === '' || $value === '') {
                continue;
            }
            $clean[] = ['title' => $title, 'value' => $value];
        }

        $this->merge(['attributes' => $clean === [] ? null : $clean]);
    }
}
