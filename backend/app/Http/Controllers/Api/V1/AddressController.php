<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $address = DB::transaction(function () use ($request, $data) {
            if ($data['is_default']) {
                $request->user()->addresses()->update(['is_default' => false]);
            }
            return Address::create($data);
        });

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

    /** Update an existing address (owner only). */
    public function update(Request $request, Address $address): JsonResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403, 'Forbidden.');

        $validated = $request->validate([
            'label'          => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:100'],
            'phone'          => ['required', 'string', 'max:20'],
            'address'        => ['required', 'string', 'max:500'],
            'division'       => ['nullable', 'string', 'max:100'],
            'district'       => ['nullable', 'string', 'max:100'],
        ]);

        $address->update($validated);

        return response()->json($address->fresh());
    }

    /**
     * Mark an address as the user's default.
     *
     * Atomic: unset all of the user's addresses first, then set this one. The
     * transaction prevents a race where two concurrent requests could leave
     * the user with two default addresses simultaneously.
     */
    public function setDefault(Request $request, Address $address): JsonResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403, 'Forbidden.');

        DB::transaction(function () use ($request, $address) {
            Address::where('user_id', $request->user()->id)
                ->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return response()->json($address->fresh());
    }
}
