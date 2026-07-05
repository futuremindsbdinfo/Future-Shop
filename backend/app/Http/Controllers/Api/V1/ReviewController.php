<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index($productId)
    {
        $product = Product::findOrFail($productId);
        $reviews = $product->reviews()->with('user:id,name')->where('is_published', true)->latest()->get();
        return response()->json(['data' => $reviews]);
    }

    public function store(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'name' => 'nullable|string|max:255',
        ]);

        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Verify that the user has purchased and received this product
        $hasPurchased = Order::where('user_id', $user->id)
            ->where('order_status', 'delivered')
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->exists();

        if (!$hasPurchased) {
            return response()->json(['message' => 'You can only review products that you have purchased and received.'], 403);
        }
        
        $review = new Review();
        $review->product_id = $product->id;
        $review->user_id = $user->id;
        $review->name = $user->name;
        $review->rating = $request->rating;
        $review->title = $request->title;
        $review->content = $request->content;
        $review->is_published = false; // Admin must approve the review to prevent spam
        
        $review->save();

        return response()->json(['message' => 'Review submitted successfully and is pending approval', 'data' => $review], 201);
    }

    public function adminIndex(Request $request)
    {
        $status = $request->query('status', 'pending');
        $isPublished = $status === 'published';

        $reviews = Review::with(['product:id,name', 'user:id,name'])
            ->where('is_published', $isPublished)
            ->latest()
            ->paginate(15);

        return response()->json($reviews);
    }

    public function approve(Review $review)
    {
        $review->is_published = true;
        $review->save();

        return response()->json(['message' => 'Review approved successfully', 'data' => $review]);
    }

    public function reject(Review $review)
    {
        $review->delete();

        return response()->json(['message' => 'Review rejected successfully']);
    }
}
