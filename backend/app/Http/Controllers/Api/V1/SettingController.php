<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Allowed setting keys (site config).
     *
     * @var list<string>
     */
    private const KEYS = [
        'site_name',
        'site_tagline',
        'contact_phone',
        'contact_email',
        'contact_address',
    ];

    /** Admin: get all settings as a key→value object. */
    public function index(): JsonResponse
    {
        $stored = Setting::pluck('value', 'key')->toArray();

        $data = [];
        foreach (self::KEYS as $key) {
            $data[$key] = $stored[$key] ?? null;
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

        return response()->json(['message' => 'Settings saved.']);
    }
}
