<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WishlistController extends Controller
{
    /** GET /account/wishlists — paginated wishlist with product details. */
    public function index(Request $request): JsonResponse
    {
        $items = Wishlist::where('user_id', $request->user()->id)
            ->with([
                'product' => fn ($q) => $q
                    ->select('id', 'name', 'slug', 'price', 'sale_price',
                             'images', 'status', 'stock_quantity', 'brand_id', 'category_id')
                    ->with(['brand:id,name,slug', 'category:id,name,slug']),
            ])
            ->latest()
            ->paginate(12);

        return response()->json($items);
    }

    /**
     * POST /account/wishlists — add a product to the wishlist.
     *
     * Idempotent: backed by the (user_id, product_id) unique index plus
     * firstOrCreate. Repeat calls return 200, not 201.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')],
        ]);

        $item = Wishlist::firstOrCreate([
            'user_id'    => $request->user()->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json(
            ['message' => $item->wasRecentlyCreated ? 'Added to wishlist.' : 'Already in wishlist.'],
            $item->wasRecentlyCreated ? 201 : 200
        );
    }

    /** DELETE /account/wishlists/{wishlist} — remove from wishlist (owner only). */
    public function destroy(Request $request, Wishlist $wishlist): JsonResponse
    {
        abort_unless($wishlist->user_id === $request->user()->id, 403, 'Forbidden.');

        $wishlist->delete();

        return response()->json(['message' => 'Removed from wishlist.']);
    }
}
