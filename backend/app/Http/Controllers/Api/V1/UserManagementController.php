<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserManagementController extends Controller
{
    private const ALLOWED_ROLES = ['customer', 'vendor', 'delivery', 'admin'];

    /**
     * Admin: list all users with optional role/search filters.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'role' => ['sometimes', Rule::in(self::ALLOWED_ROLES)],
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $perPage = (int) $request->get('per_page', 15);
        $perPage = max(min($perPage, 50), 1);

        $users = User::query()
            ->withCount('orders')
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->string('role')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(function ($w) use ($term) {
                    $w->where('name', 'ilike', $term)
                        ->orWhere('phone', 'ilike', $term)
                        ->orWhere('email', 'ilike', $term);
                });
            })
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($users);
    }

    /**
     * Admin: toggle a user's active flag. Cannot deactivate self.
     */
    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            throw ValidationException::withMessages([
                'user' => ['You cannot change your own status.'],
            ]);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json([
            'data' => $user->fresh(),
        ]);
    }

    /**
     * Admin: change a user's role. Cannot change own role.
     */
    public function changeRole(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'role' => ['required', Rule::in(self::ALLOWED_ROLES)],
        ]);

        if ($user->id === $request->user()->id) {
            throw ValidationException::withMessages([
                'role' => ['You cannot change your own role.'],
            ]);
        }

        $user->update(['role' => $data['role']]);

        return response()->json([
            'data' => $user->fresh(),
        ]);
    }

    /**
     * Admin: list customers with order totals.
     */
    public function customers(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $perPage = max(min((int) $request->get('per_page', 15), 50), 1);

        // Customers + counts/sums via Eloquent (no raw SQL). total_spent uses only paid orders.
        $customers = User::query()
            ->where('role', 'customer')
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(function ($w) use ($term) {
                    $w->where('name', 'ilike', $term)->orWhere('phone', 'ilike', $term);
                });
            })
            ->withCount('orders as total_orders')
            ->withSum(['orders as total_spent' => fn ($q) => $q->where('payment_status', 'paid')], 'total')
            ->withMax('orders as last_order_date', 'created_at')
            ->orderByDesc('total_spent')
            ->paginate($perPage)
            ->withQueryString();

        $customers->getCollection()->transform(function (User $u) {
            $u->setAttribute('total_spent', round((float) ($u->total_spent ?? 0), 2));
            return $u;
        });

        return response()->json($customers);
    }

    /**
     * Admin: customer detail + last 10 orders + totals.
     */
    public function customerShow(User $user): JsonResponse
    {
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Not a customer.'], 404);
        }

        $orders = Order::where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get(['id', 'order_number', 'total', 'payment_status', 'order_status', 'created_at']);

        $stats = [
            'total_orders' => Order::where('user_id', $user->id)->count(),
            'total_spent' => round((float) Order::where('user_id', $user->id)
                ->where('payment_status', 'paid')
                ->sum('total'), 2),
            'last_order_date' => Order::where('user_id', $user->id)->max('created_at'),
        ];

        return response()->json([
            'data' => [
                'user' => $user,
                'stats' => $stats,
                'orders' => $orders,
            ],
        ]);
    }
}
