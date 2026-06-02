<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function __construct(private readonly ImageUploadService $images)
    {
    }

    /** Admin: list all banners. */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Banner::orderBy('sort_order')->orderByDesc('id')->get(),
        ]);
    }

    /** Admin: create a banner (with image upload). */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'image' => ['required', 'file', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'link_url' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer'],
        ]);

        $uploaded = $this->images->store($request->file('image'), 'banners');

        $banner = Banner::create([
            'title' => $data['title'],
            'image' => $uploaded['url'],
            'image_path' => $uploaded['path'],
            'link_url' => $data['link_url'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json(['data' => $banner], 201);
    }

    /** Admin: delete a banner. */
    public function destroy(Banner $banner): JsonResponse
    {
        $banner->delete();

        return response()->json(['message' => 'Banner deleted.']);
    }
}
