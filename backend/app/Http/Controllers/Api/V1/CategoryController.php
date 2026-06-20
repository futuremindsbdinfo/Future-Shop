<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * List active top-level categories with their children.
     */
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with('children')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * Admin: list ALL categories (regardless of is_active), for admin forms.
     */
    public function adminIndex(): JsonResponse
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * Show a single category by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->with('children')
            ->firstOrFail();

        return response()->json(['data' => $category]);
    }

    /**
     * Admin: create a category.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);

        $category = Category::create($data);

        return response()->json(['data' => $category], 201);
    }

    /**
     * Admin: update a category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('name', $data)) {
            $data['slug'] = $this->uniqueSlug($data['name'], $category->id);
        }

        $category->update($data);

        return response()->json(['data' => $category->fresh()]);
    }

    /**
     * Admin: delete a category.
     *
     * Blocked (409) when the category still has sub-categories or products, so
     * we never orphan the tree or hit the products FK (restrictOnDelete).
     */
    public function destroy(Category $category): JsonResponse
    {
        $childCount = $category->children()->count();
        if ($childCount > 0) {
            $noun = $childCount === 1 ? 'sub-category' : 'sub-categories';

            return response()->json([
                'message' => "Cannot delete: this category has {$childCount} {$noun}. Remove or reassign them first.",
            ], 409);
        }

        $productCount = $category->products()->count();
        if ($productCount > 0) {
            return response()->json([
                'message' => "Cannot delete: {$productCount} product(s) in this category. Reassign or deactivate instead.",
            ], 409);
        }

        try {
            DB::transaction(function () use ($category) {
                $category->delete();
            });
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete category. Please try again.',
            ], 500);
        }

        return response()->json(['message' => 'Category deleted.']);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 1;

        while (Category::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = $base.'-'.(++$suffix);
        }

        return $slug;
    }
}
