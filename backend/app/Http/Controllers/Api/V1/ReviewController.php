<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
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
        
        $review = new Review();
        $review->product_id = $product->id;
        $review->user_id = $user ? $user->id : null;
        $review->name = $user ? $user->name : $request->name;
        $review->rating = $request->rating;
        $review->title = $request->title;
        $review->content = $request->content;
        $review->is_published = true;
        
        $review->save();

        return response()->json(['message' => 'Review submitted successfully', 'data' => $review], 201);
    }
}
