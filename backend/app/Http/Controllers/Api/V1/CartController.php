<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart)
    {
    }

    /**
     * Show the current cart, priced from the DB. Optional ?delivery_zone_id=
     * adds the zone's delivery charge to the total.
     */
    public function index(Request $request): JsonResponse
    {
        $owner = $this->owner($request);
        $zoneId = $request->integer('delivery_zone_id') ?: null;

        return response()->json($this->cart->summary($owner, $zoneId));
    }

    public function add(AddToCartRequest $request): JsonResponse
    {
        $owner = $this->owner($request);
        $data = $request->validated();

        return response()->json(
            $this->cart->add($owner, (int) $data['product_id'], (int) $data['quantity'])
        );
    }

    public function update(UpdateCartItemRequest $request, int $product): JsonResponse
    {
        $owner = $this->owner($request);

        return response()->json(
            $this->cart->updateQuantity($owner, $product, (int) $request->validated()['quantity'])
        );
    }

    public function remove(Request $request, int $product): JsonResponse
    {
        $owner = $this->owner($request);

        return response()->json($this->cart->remove($owner, $product));
    }

    public function clear(Request $request): JsonResponse
    {
        $this->cart->clear($this->owner($request));

        return response()->json(['message' => 'Cart cleared.']);
    }

    /**
     * Merge a guest cart into the authenticated user's cart (call right after login).
     */
    public function merge(Request $request): JsonResponse
    {
        $data = $request->validate([
            'guest_token' => ['required', 'string', 'max:100'],
        ]);

        $user = $request->user(); // guaranteed by auth:sanctum on this route

        return response()->json(
            $this->cart->merge('guest:'.$data['guest_token'], 'user:'.$user->id)
        );
    }

    /**
     * Resolve the cart owner key: authenticated user takes precedence,
     * otherwise a guest identified by the X-Cart-Token header.
     */
    private function owner(Request $request): string
    {
        if ($user = ($request->user() ?? auth('sanctum')->user())) {
            return 'user:'.$user->id;
        }

        $token = $request->header('X-Cart-Token');

        if (! $token) {
            throw ValidationException::withMessages([
                'cart' => ['Provide an X-Cart-Token header for guest carts, or authenticate.'],
            ]);
        }

        return 'guest:'.$token;
    }
}
