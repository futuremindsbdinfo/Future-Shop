<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductController extends Controller
{
    /**
     * Max images per product (uploaded files + external URLs combined).
     */
    private const MAX_IMAGES = 5;

    public function __construct(private readonly ImageUploadService $images)
    {
    }

    /**
     * Public catalog: published products with filters, paginated 15/page.
     *
     * Filters: ?category=<slug> &vendor=<slug> &min_price= &max_price= &search= &is_featured=true
     * Pagination: ?per_page= (default 15, max 50)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 15), 50);
        $perPage = max($perPage, 1);

        $products = Product::query()
            ->where('status', 'published')
            ->with(['category:id,name,slug', 'brand:id,name,slug'])
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category', fn ($c) => $c->where('slug', $request->string('category'))
            ))
            ->when($request->filled('vendor'), fn ($q) => $q->whereHas(
                'vendor', fn ($v) => $v->where('slug', $request->string('vendor'))
            ))
            ->when($request->filled('min_price'), fn ($q) => $q->where('price', '>=', $request->float('min_price')))
            ->when($request->filled('max_price'), fn ($q) => $q->where('price', '<=', $request->float('max_price')))
            ->when($request->boolean('is_featured'), fn ($q) => $q->where('is_featured', true))
            ->when($request->filled('search'), function ($q) use ($request) {
                $keywords = array_filter(explode(' ', $request->string('search')));
                $q->where(function ($query) use ($keywords) {
                    foreach ($keywords as $word) {
                        $query->where('name', 'like', '%' . $word . '%');
                    }
                });
            })
            ->when(
                $request->filled('brand_id') && ctype_digit((string) $request->input('brand_id')),
                fn ($q) => $q->where('brand_id', (int) $request->input('brand_id'))
            )
            // created_at has second-level precision (timestamps precision 0), so
            // bulk/CSV-imported rows tie; add id as a stable tiebreaker so the
            // order does not reshuffle after a delete (arbitrary heap order).
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($products);
    }

    /**
     * Admin: list ALL products (any status), with optional filters.
     * ?category=<slug> &status=<draft|published|out_of_stock> &per_page= &search=
     */
    public function adminIndex(Request $request): JsonResponse
    {
        // Allow up to 5000 for bulk export; default 15 for normal listing.
        $perPage = max(min((int) $request->get('per_page', 15), 5000), 1);

        $products = Product::query()
            ->with(['vendor:id,shop_name,slug', 'category:id,name,slug', 'brand:id,name,slug'])
            ->when($request->user()->isVendor(), fn ($q) => $q->where('vendor_id', $request->user()->vendor->id))
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category', fn ($c) => $c->where('slug', $request->string('category'))
            ))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when(
                $request->filled('brand_id') && ctype_digit((string) $request->input('brand_id')),
                fn ($q) => $q->where('brand_id', (int) $request->input('brand_id'))
            )
            ->when($request->filled('search'), function ($q) use ($request) {
                $keywords = array_filter(explode(' ', $request->string('search')));
                $q->where(function ($query) use ($keywords) {
                    foreach ($keywords as $word) {
                        $query->where('name', 'like', '%' . $word . '%');
                    }
                });
            })
            // created_at has second-level precision (timestamps precision 0), so
            // bulk/CSV-imported rows tie; add id as a stable tiebreaker so the
            // order does not reshuffle after a delete (arbitrary heap order).
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($products);
    }

    /**
     * Admin: show a single product by id (any status), for the edit form.
     */
    public function adminShow(Request $request, Product $product): JsonResponse
    {
        if ($request->user()->isVendor()) {
            abort_unless($product->vendor_id === $request->user()->vendor->id, 403, 'Forbidden. This product belongs to another vendor.');
        }

        return response()->json([
            'data' => $product->load(['vendor:id,shop_name,slug', 'category:id,name,slug', 'brand:id,name,slug']),
        ]);
    }

    /**
     * Public: show a single published product by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->where('status', 'published')
            ->with(['category:id,name,slug', 'brand:id,name,slug'])
            ->firstOrFail();

        return response()->json(['data' => $product]);
    }

    /**
     * Admin: create a product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);

        $uploaded = $request->hasFile('images')
            ? $this->images->storeMany($request->file('images'))
            : [];
        $urls = $this->mapUrlImages($request->validated('image_urls') ?? []);
        $merged = array_merge($uploaded, $urls);
        if ($merged !== []) {
            $data['images'] = array_slice($merged, 0, self::MAX_IMAGES);
        }
        unset($data['image_urls']);

        $product = Product::create($data);

        return response()->json([
            'data' => $product->load(['vendor:id,shop_name,slug', 'category:id,name,slug', 'brand:id,name,slug']),
        ], 201);
    }

    /**
     * Admin: update a product.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        if ($request->user()->isVendor()) {
            abort_unless($product->vendor_id === $request->user()->vendor->id, 403, 'Forbidden. You cannot update another vendor\'s product.');
        }

        $data = $request->validated();

        if ($request->filled('name')) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $existing = $product->images ?? [];

        // Keep-list (edit form): drop existing images not in the kept set and
        // delete their underlying files. The deleted path always comes from the
        // product's OWN stored metadata — kept_image_urls is only used for set
        // membership, never as a filesystem path. Absent = leave existing as-is
        // (backward-compatible append-only behaviour).
        if ($request->has('kept_image_urls')) {
            $keptSet = array_flip($request->validated('kept_image_urls') ?? []);
            foreach ($existing as $img) {
                if (! isset($keptSet[$img['url']])) {
                    $this->images->delete($img);
                }
            }
            $existing = array_values(array_filter(
                $existing,
                fn (array $img) => isset($keptSet[$img['url']]),
            ));
        }

        // Append newly uploaded files and/or external URLs, capped at MAX_IMAGES.
        $uploaded = $request->hasFile('images')
            ? $this->images->storeMany($request->file('images'))
            : [];
        $urls = $this->mapUrlImages($request->validated('image_urls') ?? []);

        if ($request->has('kept_image_urls') || $uploaded !== [] || $urls !== []) {
            $data['images'] = array_slice(array_merge($existing, $uploaded, $urls), 0, self::MAX_IMAGES);
        }
        unset($data['image_urls'], $data['kept_image_urls']);

        $product->update($data);

        return response()->json([
            'data' => $product->fresh(['vendor:id,shop_name,slug', 'category:id,name,slug', 'brand:id,name,slug']),
        ]);
    }

    /**
     * Admin: toggle a product's published/draft status.
     */
    public function toggleStatus(Request $request, Product $product): JsonResponse
    {
        if ($request->user()->isVendor()) {
            abort_unless($product->vendor_id === $request->user()->vendor->id, 403, 'Forbidden.');
        }

        if ($product->status === 'out_of_stock') {
            return response()->json([
                'message' => 'স্টক আপডেট করে publish করুন'
            ], 422);
        }

        $newStatus = $product->status === 'published' ? 'draft' : 'published';
        $product->update(['status' => $newStatus]);

        return response()->json([
            'data' => $product->fresh(),
        ]);
    }

    /**
     * Admin: soft delete a product.
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        if ($request->user()->isVendor()) {
            abort_unless($product->vendor_id === $request->user()->vendor->id, 403, 'Forbidden.');
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    /**
     * Admin: bulk action on products.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:products,id'],
            'action' => ['required', 'string', 'in:delete,activate,deactivate'],
        ]);

        $ids = $data['ids'];
        $action = $data['action'];
        $vendorId = $request->user()->isVendor() ? $request->user()->vendor->id : null;

        DB::transaction(function () use ($ids, $action, $vendorId) {
            if ($action === 'delete') {
                Product::whereIn('id', $ids)
                    ->when($vendorId, fn($q) => $q->where('vendor_id', $vendorId))
                    ->delete();
            } elseif ($action === 'activate') {
                Product::whereIn('id', $ids)
                    ->where('status', 'draft')
                    ->when($vendorId, fn($q) => $q->where('vendor_id', $vendorId))
                    ->update(['status' => 'published']);
            } elseif ($action === 'deactivate') {
                Product::whereIn('id', $ids)
                    ->where('status', 'published')
                    ->when($vendorId, fn($q) => $q->where('vendor_id', $vendorId))
                    ->update(['status' => 'draft']);
            }
        });

        return response()->json(['message' => 'Bulk action completed.']);
    }

    /**
     * Admin: download a CSV template with just the headers.
     */
    public function importTemplate(): StreamedResponse
    {
        $headers = ['name', 'price', 'cost_price', 'stock_qty', 'category_slug', 'description', 'sale_price'];

        return response()->streamDownload(function () use ($headers) {
            $fh = fopen('php://output', 'w');
            fputcsv($fh, $headers);
            // Include one example row to show the expected shape.
            fputcsv($fh, ['Sample Product', '500', '350', '20', 'grocery-drinks', 'Optional description', '']);
            fclose($fh);
        }, 'products-import-template.csv', [
            'Content-Type' => 'text/csv',
            'Cache-Control' => 'no-store',
        ]);
    }

    /**
     * Admin: bulk-create products from a CSV upload.
     *
     * Required CSV columns: name, price, cost_price, stock_qty, category_slug
     * Optional:             description, sale_price
     *
     * Invalid rows are skipped and reported; valid rows are created.
     * Requires a vendor — uses ?vendor_id=<id> (must be an existing vendor),
     * or the first approved vendor as a sensible default.
     */
    public function import(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
            'vendor_id' => ['sometimes', 'integer', 'exists:vendors,id'],
        ]);

        $vendorId = (int) ($data['vendor_id'] ?? 0);
        if ($vendorId === 0) {
            $vendor = Vendor::where('status', 'approved')->orderBy('id')->first();
            if (! $vendor) {
                return response()->json([
                    'imported' => 0,
                    'skipped' => 0,
                    'errors' => [['row' => 0, 'message' => 'No approved vendor exists. Create a vendor first or pass vendor_id.']],
                ], 422);
            }
            $vendorId = $vendor->id;
        }

        $path = $request->file('file')->getRealPath();
        $fh = fopen($path, 'r');
        if (! $fh) {
            return response()->json(['message' => 'Could not read file.'], 422);
        }

        // Read & normalise header row.
        $rawHeader = fgetcsv($fh);
        if (! $rawHeader) {
            fclose($fh);
            return response()->json(['message' => 'CSV is empty.'], 422);
        }
        $header = array_map(fn ($h) => strtolower(trim((string) $h)), $rawHeader);

        $required = ['name', 'price', 'cost_price', 'stock_qty', 'category_slug'];
        $missing = array_diff($required, $header);
        if (! empty($missing)) {
            fclose($fh);
            return response()->json([
                'message' => 'Missing required columns: '.implode(', ', $missing),
            ], 422);
        }

        // Cache categories by slug for fast lookup.
        $categories = Category::pluck('id', 'slug');

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $rowNum = 1; // header is row 1; data starts at 2

        while (($row = fgetcsv($fh)) !== false) {
            $rowNum++;
            if (count(array_filter($row, fn ($v) => $v !== null && $v !== '')) === 0) {
                continue; // skip blank lines silently
            }

            // Build associative row from header.
            $assoc = [];
            foreach ($header as $i => $col) {
                $assoc[$col] = $row[$i] ?? '';
            }

            $categorySlug = trim((string) ($assoc['category_slug'] ?? ''));
            $categoryId = $categories[$categorySlug] ?? null;

            $payload = [
                'vendor_id' => $vendorId,
                'category_id' => $categoryId,
                'name' => trim((string) ($assoc['name'] ?? '')),
                'description' => trim((string) ($assoc['description'] ?? '')) ?: null,
                'price' => $assoc['price'] ?? null,
                'sale_price' => trim((string) ($assoc['sale_price'] ?? '')) === '' ? null : $assoc['sale_price'],
                'cost_price' => $assoc['cost_price'] ?? null,
                'stock_quantity' => $assoc['stock_qty'] ?? null,
                'status' => 'draft',
            ];

            $v = Validator::make($payload, [
                'vendor_id' => ['required', 'integer'],
                'category_id' => ['required', 'integer'],
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'price' => ['required', 'numeric', 'min:0'],
                'sale_price' => ['nullable', 'numeric', 'min:0', 'lte:price'],
                'cost_price' => ['nullable', 'numeric', 'min:0'],
                'stock_quantity' => ['required', 'integer', 'min:0'],
                'status' => ['required'],
            ]);

            if ($v->fails()) {
                $skipped++;
                $errors[] = [
                    'row' => $rowNum,
                    'name' => $payload['name'],
                    'errors' => $v->errors()->all(),
                ];
                continue;
            }

            $validated = $v->validated();
            $validated['slug'] = $this->uniqueSlug($validated['name']);

            try {
                Product::create($validated);
                $imported++;
            } catch (\Throwable $e) {
                $skipped++;
                $errors[] = [
                    'row' => $rowNum,
                    'name' => $payload['name'],
                    'errors' => [$e->getMessage()],
                ];
            }
        }

        fclose($fh);

        return response()->json([
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ], $imported > 0 ? Response::HTTP_CREATED : Response::HTTP_OK);
    }

    /**
     * Build a slug that is unique across the products table.
     */
    /**
     * Map admin-supplied https image URLs to external image entries. The URL is
     * stored as a reference only — never downloaded — mirroring the shape of
     * ImageUploadService output so the frontend can treat them uniformly.
     *
     * @param  array<int, string>  $urls
     * @return array<int, array{path: null, url: string, disk: string}>
     */
    private function mapUrlImages(array $urls): array
    {
        return array_map(
            fn (string $url) => ['path' => null, 'url' => $url, 'disk' => 'external'],
            array_values($urls),
        );
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 1;

        while (Product::withTrashed()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = $base.'-'.(++$suffix);
        }

        return $slug;
    }
}
