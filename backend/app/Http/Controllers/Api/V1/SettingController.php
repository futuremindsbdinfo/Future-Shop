<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\RevalidateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function __construct(private readonly RevalidateService $revalidate)
    {
    }

    /**
     * Allowed setting keys (site config) with default values used when the
     * admin hasn't saved a value yet. Defaults are used by both the admin
     * settings form and the public storefront fetch.
     *
     * @var array<string, string|null>
     */
    private const DEFAULTS = [
        'site_name' => 'Future Shop',
        'site_tagline' => 'বাজারে নয়, বাজার আসবে আপনার ঘরে।',
        'contact_phone' => null,
        'contact_email' => null,
        'contact_address' => null,
    ];

    /** Admin: get all settings as a key→value object. */
    public function index(): JsonResponse
    {
        $stored = Setting::pluck('value', 'key')->toArray();

        $data = [];
        foreach (self::DEFAULTS as $key => $default) {
            $value = $stored[$key] ?? null;
            // Empty stored values fall back to the default so the public
            // storefront always has a meaningful tagline / site_name.
            $data[$key] = ($value === null || $value === '') ? $default : $value;
        }

        return response()->json(['data' => $data]);
    }

    /** Admin: upsert provided settings. */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'site_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'site_tagline' => ['sometimes', 'nullable', 'string', 'max:255'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'contact_address' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // Clear the frontend's cached settings immediately.
        $this->revalidate->tags(['settings']);

        return response()->json(['message' => 'Settings saved.']);
    }
}
