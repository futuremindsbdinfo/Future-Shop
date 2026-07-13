<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    /**
     * Admins and vendors may update products.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() || $this->user()?->isVendor();
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
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            // External image URLs (https only). Combined with uploaded files and
            // capped to 5 total in the controller.
            'image_urls' => ['nullable', 'array', 'max:5'],
            'image_urls.*' => ['string', 'url', 'starts_with:https://', 'max:2048'],
            // Existing images to KEEP (by url); any others are removed and their
            // files deleted. NOT https-only — self-hosted local URLs are http.
            'kept_image_urls' => ['sometimes', 'nullable', 'array', 'max:5'],
            'kept_image_urls.*' => ['string', 'url', 'max:2048'],
            // Display-only extra details (not variants). Capped at 20 pairs.
            'attributes' => ['nullable', 'array', 'max:20'],
            'attributes.*.title' => ['required_with:attributes', 'string', 'max:60'],
            'attributes.*.value' => ['required_with:attributes', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->user()?->isVendor()) {
            $this->request->remove('vendor_id');
        }

        // Optional: unpack JSON stringified arrays from FormData
        if ($this->has('image_urls') && is_string($this->get('image_urls'))) {
            $this->merge(['image_urls' => json_decode($this->get('image_urls'), true)]);
        }
        if ($this->has('kept_image_urls') && is_string($this->get('kept_image_urls'))) {
            $this->merge(['kept_image_urls' => json_decode($this->get('kept_image_urls'), true)]);
        }
        if ($this->has('attributes') && is_string($this->get('attributes'))) {
            $this->merge(['attributes' => json_decode($this->get('attributes'), true)]);
        }

        $this->normalizeAttributes();
        $this->normalizeStringList('image_urls');
        $this->normalizeStringList('kept_image_urls');
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
     * Trim string entries of an array field, drop blanks / non-strings, and
     * collapse an empty result to null. Scheme/format rules run afterwards.
     */
    private function normalizeStringList(string $key): void
    {
        if (! $this->has($key)) {
            return;
        }

        $raw = $this->input($key);
        if (! is_array($raw)) {
            $this->merge([$key => null]);

            return;
        }

        $clean = [];
        foreach ($raw as $value) {
            if (! is_string($value)) {
                continue;
            }
            $value = trim($value);
            if ($value === '') {
                continue;
            }
            $clean[] = $value;
        }

        $this->merge([$key => $clean === [] ? null : $clean]);
    }
}
