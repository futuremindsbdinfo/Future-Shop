<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /** List the authenticated user's saved addresses. */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->addresses()->latest()->get(),
        ]);
    }

    /** Add a new address for the authenticated user. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:1000'],
            'division' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        $data['user_id'] = $request->user()->id;
        $data['is_default'] = $request->boolean('is_default');

        if ($data['is_default']) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = Address::create($data);

        return response()->json(['data' => $address], 201);
    }

    /** Delete one of the authenticated user's addresses. */
    public function destroy(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Address not found.'], 404);
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }
}
