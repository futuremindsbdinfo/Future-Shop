<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BrandController extends Controller
{
    public function __construct(private readonly ImageUploadService $imageService) {}

    // ── PUBLIC ────────────────────────────────────────────────────────────

    public function publicIndex(): JsonResponse
    {
        $brands = Brand::where('is_active', true)
            ->withCount(['products' => fn ($q) => $q->where('status', 'published')])
            ->orderBy('name')
            ->paginate(20);

        return response()->json($brands);
    }

    public function publicShow(Brand $brand, Request $request): JsonResponse
    {
        abort_if(! $brand->is_active, 404);

        $products = Product::where('brand_id', $brand->id)
            ->where('status', 'published')
            ->with(['category:id,name,slug'])
            ->paginate(12);

        return response()->json([
            'brand'    => $brand,
            'products' => $products,
        ]);
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────

    public function index(): JsonResponse
    {
        $brands = Brand::withCount('products')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($brands);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/', 'unique:brands,slug'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active'   => ['boolean'],
            'logo'        => ['nullable', 'file', 'max:5120'],
        ]);

        $slug = $this->uniqueSlug(
            isset($validated['slug']) ? $validated['slug'] : Str::slug($validated['name'])
        );

        $logoData = null;
        if ($request->hasFile('logo')) {
            $logoData = $this->imageService->store($request->file('logo'), 'brands', 'logo');
        }

        $brand = Brand::create([
            'name'        => $validated['name'],
            'slug'        => $slug,
            'description' => $validated['description'] ?? null,
            'is_active'   => $validated['is_active'] ?? true,
            'logo'        => $logoData,
        ]);

        return response()->json($brand, 201);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/',
                              Rule::unique('brands', 'slug')->ignore($brand->id)],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active'   => ['boolean'],
            'logo'        => ['nullable', 'file', 'max:5120'],
        ]);

        $data = array_filter([
            'name'        => $validated['name'] ?? null,
            'description' => array_key_exists('description', $validated) ? $validated['description'] : null,
            'is_active'   => $validated['is_active'] ?? null,
            'slug'        => (isset($validated['slug']) && $validated['slug'] !== null) ? $validated['slug'] : null,
        ], fn ($v) => $v !== null);

        if ($request->hasFile('logo')) {
            if ($brand->logo && isset($brand->logo['path'], $brand->logo['disk'])) {
                Storage::disk($brand->logo['disk'])->delete($brand->logo['path']);
            }
            $data['logo'] = $this->imageService->store($request->file('logo'), 'brands', 'logo');
        }

        $brand->update($data);

        return response()->json($brand->fresh());
    }

    public function destroy(Brand $brand): JsonResponse
    {
        if ($brand->logo && isset($brand->logo['path'], $brand->logo['disk'])) {
            Storage::disk($brand->logo['disk'])->delete($brand->logo['path']);
        }

        $brand->delete();

        return response()->json(['message' => 'Brand deleted. Product brand_id set to null.']);
    }

    private function uniqueSlug(string $base): string
    {
        $slug  = $base;
        $count = 1;
        while (Brand::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$count++;
        }

        return $slug;
    }
}
