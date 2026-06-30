<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\QA;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QAController extends Controller
{
    public function index($productId)
    {
        $product = Product::findOrFail($productId);
        $qas = $product->qas()->with('user:id,name')->where('is_published', true)->latest()->get();
        return response()->json(['data' => $qas]);
    }

    public function store(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'question' => 'required|string',
            'name' => 'nullable|string|max:255',
        ]);

        $user = Auth::guard('sanctum')->user();
        
        $qa = new QA();
        $qa->product_id = $product->id;
        $qa->user_id = $user ? $user->id : null;
        $qa->name = $user ? $user->name : $request->name;
        $qa->question = $request->question;
        $qa->is_published = true;
        
        $qa->save();

        return response()->json(['message' => 'Question submitted successfully', 'data' => $qa], 201);
    }
}
