<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use InvalidArgumentException;
use Throwable;

/**
 * Mapped CSV import for the wizard.
 *
 * Client uploads parsed rows (Papa.parse output) + a per-header mapping to
 * a canonical field. Each row is processed independently so a single bad
 * row never aborts the whole import; failures are collected and returned.
 *
 * Products land as 'draft' so the admin reviews before they go public.
 */
class AdminMappedImportController extends Controller
{
    /**
     * Whitelist of valid target fields a CSV column can map to.
     * Anything not in this list (or absent) is treated as 'ignore'.
     */
    private const ALLOWED_FIELDS = [
        'name', 'category', 'price', 'cost_price', 'sale_price',
        'stock_quantity', 'weight', 'sku', 'description', 'ignore',
    ];

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'vendor_id' => [
                'required',
                'integer',
                Rule::exists('vendors', 'id')->where('status', 'approved'),
            ],
            'mapping'   => ['required', 'array'],
            'mapping.*' => [Rule::in(self::ALLOWED_FIELDS)],
            'rows'      => ['required', 'array', 'min:1', 'max:2000'],
        ]);

        $vendorId = (int) $request->input('vendor_id');
        $mapping  = $request->input('mapping');
        $rows     = $request->input('rows');

        $successCount  = 0;
        $errors        = [];
        $categoryCache = [];

        foreach ($rows as $i => $rowData) {
            try {
                $this->processRow($rowData, $mapping, $vendorId, $categoryCache);
                $successCount++;
            } catch (Throwable $e) {
                $errors[] = [
                    'row'   => $i + 1,
                    'data'  => array_slice((array) $rowData, 0, 3, true),
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => $successCount,
            'errors'  => $errors,
            'total'   => count($rows),
        ]);
    }

    /**
     * @param  array<string, mixed>  $rowData
     * @param  array<string, string>  $mapping
     * @param  array<string, int>  $categoryCache  by-reference, populated as new categories are seen
     */
    private function processRow(array $rowData, array $mapping, int $vendorId, array &$categoryCache): void
    {
        $fields = ['description_parts' => []];

        foreach ($rowData as $header => $rawValue) {
            $field = $mapping[$header] ?? 'ignore';
            $value = trim((string) $rawValue);

            if ($field === 'ignore' || $value === '') {
                continue;
            }

            if ($field === 'description') {
                $fields['description_parts'][] = $value;
            } else {
                $fields[$field] = $value;
            }
        }

        // ── Required field validation ─────────────────────────────────
        if (empty($fields['name'])) {
            throw new InvalidArgumentException('Product name is required.');
        }
        if (empty($fields['price'])) {
            throw new InvalidArgumentException('Selling price is required.');
        }
        if (! is_numeric($fields['price']) || (float) $fields['price'] < 0) {
            throw new InvalidArgumentException('Selling price must be a positive number.');
        }
        if (empty($fields['category'])) {
            throw new InvalidArgumentException('Category is required.');
        }

        // ── Category: find or create by name ──────────────────────────
        $catName = trim($fields['category']);
        if (! isset($categoryCache[$catName])) {
            $category = Category::where('name', $catName)->first();
            if (! $category) {
                $slug = $this->uniqueSlug(Str::slug($catName) ?: 'category', 'categories');
                $category = Category::create([
                    'name'       => $catName,
                    'slug'       => $slug,
                    'phase'      => 'mvp',
                    'is_active'  => true,
                    'sort_order' => 0,
                    'parent_id'  => null,
                ]);
            }
            $categoryCache[$catName] = $category->id;
        }
        $categoryId = $categoryCache[$catName];

        // ── Slug + description ────────────────────────────────────────
        $slug = $this->uniqueSlug(Str::slug($fields['name']) ?: 'product', 'products');

        $description = ! empty($fields['description_parts'])
            ? implode(' | ', $fields['description_parts'])
            : ($fields['description'] ?? null);

        // ── Numeric coercions (empty → 0/null safely) ─────────────────
        $price     = round((float) $fields['price'], 2);
        $costPrice = isset($fields['cost_price'])
            ? round((float) $fields['cost_price'], 2)
            : 0.00;
        $salePrice = ! empty($fields['sale_price'])
            ? round((float) $fields['sale_price'], 2)
            : null;
        $stockQty = ! empty($fields['stock_quantity'])
            ? max(0, (int) $fields['stock_quantity'])
            : 0;
        $weight = ! empty($fields['weight'])
            ? round((float) $fields['weight'], 2)
            : null;

        Product::create([
            'vendor_id'      => $vendorId,
            'category_id'    => $categoryId,
            'name'           => $fields['name'],
            'slug'           => $slug,
            'description'    => $description,
            'price'          => $price,
            'sale_price'     => $salePrice,
            'cost_price'     => $costPrice,
            'sku'            => $fields['sku'] ?? null,
            'stock_quantity' => $stockQty,
            'weight'         => $weight,
            'is_featured'    => false,
            'status'         => 'draft',
        ]);
    }

    private function uniqueSlug(string $base, string $table): string
    {
        $slug = $base !== '' ? $base : 'product';
        $count = 1;
        while (DB::table($table)->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$count++;
        }

        return $slug;
    }
}
