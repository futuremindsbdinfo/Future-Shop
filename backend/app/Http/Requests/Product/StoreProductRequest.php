<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    /**
     * Only admins may create products (route is also gated by role:admin).
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
        return [
            'vendor_id' => ['required', 'integer', Rule::exists('vendors', 'id')],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'brand_id' => ['nullable', 'integer', Rule::exists('brands', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lte:price'],
            'cost_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'is_featured' => ['sometimes', 'boolean'],
            'status' => ['required', Rule::in(['draft', 'published', 'out_of_stock'])],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // 5120 KB = 5 MB
            // External image URLs (https only). Combined with uploaded files and
            // capped to 5 total in the controller.
            'image_urls' => ['nullable', 'array', 'max:5'],
            'image_urls.*' => ['string', 'url', 'starts_with:https://', 'max:2048'],
            // Display-only extra details (not variants). Capped at 20 pairs.
            'attributes' => ['nullable', 'array', 'max:20'],
            'attributes.*.title' => ['required_with:attributes', 'string', 'max:60'],
            'attributes.*.value' => ['required_with:attributes', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeAttributes();
        $this->normalizeImageUrls();
    }

    /**
     * Keep only {title, value} (drop extra keys), trim both, discard rows where
     * either is blank, and collapse an all-empty set to null.
     */
    private function normalizeAttributes(): void
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

    /**
     * Trim URL strings, drop blanks / non-strings, collapse an empty set to null.
     * Scheme/format (https-only) is enforced by the validation rules.
     */
    private function normalizeImageUrls(): void
    {
        if (! $this->has('image_urls')) {
            return;
        }

        $raw = $this->input('image_urls');
        if (! is_array($raw)) {
            $this->merge(['image_urls' => null]);

            return;
        }

        $clean = [];
        foreach ($raw as $url) {
            if (! is_string($url)) {
                continue;
            }
            $url = trim($url);
            if ($url === '') {
                continue;
            }
            $clean[] = $url;
        }

        $this->merge(['image_urls' => $clean === [] ? null : $clean]);
    }
}
