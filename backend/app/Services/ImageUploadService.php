<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ImageUploadService
{
    /**
     * Max upload size in bytes (5 MB).
     */
    private const MAX_BYTES = 5 * 1024 * 1024;

    /**
     * Max output width in pixels.
     */
    private const MAX_WIDTH = 1200;

    /**
     * Allowed real MIME types (validated via magic bytes) → output extension.
     */
    private const ALLOWED = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function __construct(private readonly ImageManager $manager = new ImageManager(new Driver()))
    {
    }

    /**
     * Validate, resize and store an uploaded image.
     *
     * @return array{path: string, url: string, disk: string}
     *
     * @throws ValidationException
     */
    public function store(UploadedFile $file, string $directory = 'products', ?string $field = 'image'): array
    {
        $this->guardSize($file, $field);
        $mime = $this->guardMimeByMagicBytes($file, $field);

        $extension = self::ALLOWED[$mime];

        // Resize down to the max width (never upscale), preserving aspect ratio.
        $image = $this->manager->read($file->getRealPath());
        $image->scaleDown(width: self::MAX_WIDTH);
        $binary = (string) $image->encodeByExtension($extension, quality: 85);

        $disk = config('filesystems.image_disk', env('IMAGE_DISK', 'public'));
        $path = trim($directory, '/').'/'.Str::uuid()->toString().'.'.$extension;

        Storage::disk($disk)->put($path, $binary, 'public');

        return [
            'path' => $path,
            'url' => Storage::disk($disk)->url($path),
            'disk' => $disk,
        ];
    }

    /**
     * Store many images and return their metadata.
     *
     * @param  array<int, UploadedFile>  $files
     * @return array<int, array{path: string, url: string, disk: string}>
     */
    public function storeMany(array $files, string $directory = 'products'): array
    {
        return array_map(fn (UploadedFile $file) => $this->store($file, $directory), $files);
    }

    /**
     * Delete a stored image's underlying file. No-op for external URL refs (no
     * local file) and for anything outside the products/ prefix — a path-
     * traversal guard so we never touch files this service did not create.
     *
     * @param  array{path?: string|null, url?: string|null, disk?: string|null}  $image
     */
    public function delete(array $image): void
    {
        $path = $image['path'] ?? null;
        $disk = $image['disk'] ?? null;

        // External references and malformed/empty paths have no local file.
        if ($disk === 'external' || ! is_string($path) || $path === '') {
            return;
        }

        // Path-traversal guard: only ever delete inside the products/ directory.
        if (str_contains($path, '..') || ! str_starts_with($path, 'products/')) {
            return;
        }

        $targetDisk = is_string($disk) && $disk !== ''
            ? $disk
            : config('filesystems.image_disk', env('IMAGE_DISK', 'public'));

        Storage::disk($targetDisk)->delete($path);
    }

    private function guardSize(UploadedFile $file, ?string $field): void
    {
        if ($file->getSize() > self::MAX_BYTES) {
            throw ValidationException::withMessages([
                $field => ['The image may not be larger than 5MB.'],
            ]);
        }
    }

    /**
     * Inspect the file's real content (magic bytes) rather than trusting the
     * client-supplied extension or Content-Type header.
     */
    private function guardMimeByMagicBytes(UploadedFile $file, ?string $field): string
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file->getRealPath());
        finfo_close($finfo);

        if (! isset(self::ALLOWED[$mime])) {
            throw ValidationException::withMessages([
                $field => ['The file must be a valid JPEG, PNG or WebP image.'],
            ]);
        }

        return $mime;
    }
}
