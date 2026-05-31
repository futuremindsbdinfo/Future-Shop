<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Product;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
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
            ->with(['vendor:id,shop_name,slug', 'category:id,name,slug'])
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category', fn ($c) => $c->where('slug', $request->string('category'))
            ))
            ->when($request->filled('vendor'), fn ($q) => $q->whereHas(
                'vendor', fn ($v) => $v->where('slug', $request->string('vendor'))
            ))
            ->when($request->filled('min_price'), fn ($q) => $q->where('price', '>=', $request->float('min_price')))
            ->when($request->filled('max_price'), fn ($q) => $q->where('price', '<=', $request->float('max_price')))
            ->when($request->boolean('is_featured'), fn ($q) => $q->where('is_featured', true))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'ilike', '%'.$request->string('search').'%'))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($products);
    }

    /**
     * Admin: list ALL products (any status), with optional filters.
     * ?category=<slug> &status=<draft|published|out_of_stock> &per_page=
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $perPage = max(min((int) $request->get('per_page', 15), 50), 1);

        $products = Product::query()
            ->with(['vendor:id,shop_name,slug', 'category:id,name,slug'])
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category', fn ($c) => $c->where('slug', $request->string('category'))
            ))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($products);
    }

    /**
     * Admin: show a single product by id (any status), for the edit form.
     */
    public function adminShow(Product $product): JsonResponse
    {
        return response()->json([
            'data' => $product->load(['vendor:id,shop_name,slug', 'category:id,name,slug']),
        ]);
    }

    /**
     * Public: show a single published product by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->where('status', 'published')
            ->with(['vendor:id,shop_name,slug', 'category:id,name,slug'])
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

        if ($request->hasFile('images')) {
            $data['images'] = $this->images->storeMany($request->file('images'));
        }

        $product = Product::create($data);

        return response()->json([
            'data' => $product->load(['vendor:id,shop_name,slug', 'category:id,name,slug']),
        ], 201);
    }

    /**
     * Admin: update a product.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        if ($request->filled('name')) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        if ($request->hasFile('images')) {
            // Append newly uploaded images to the existing set.
            $existing = $product->images ?? [];
            $data['images'] = array_merge($existing, $this->images->storeMany($request->file('images')));
        }

        $product->update($data);

        return response()->json([
            'data' => $product->fresh(['vendor:id,shop_name,slug', 'category:id,name,slug']),
        ]);
    }

    /**
     * Admin: soft delete a product.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    /**
     * Build a slug that is unique across the products table.
     */
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
