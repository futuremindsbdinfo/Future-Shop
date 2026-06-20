<?php

namespace App\Http\Requests\Category;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Only admins may update categories (route is also gated by role:admin).
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id'),
                $this->notSelfOrDescendant(),
            ],
            'icon' => ['nullable', 'string', 'max:16'],
            'phase' => ['sometimes', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    /**
     * Reject a parent_id that would create a cycle: the chosen parent must not
     * be the category itself nor any of its descendants. We walk UP the chosen
     * parent's ancestor chain — if we meet this category's id, it's a cycle.
     */
    private function notSelfOrDescendant(): \Closure
    {
        return function (string $attribute, $value, \Closure $fail): void {
            if ($value === null) {
                return;
            }

            $category = $this->route('category');
            if (! $category instanceof Category) {
                return;
            }

            $cursor = (int) $value;
            $guard = 0;

            while ($cursor !== 0) {
                if ($cursor === (int) $category->id) {
                    $fail('A category cannot be its own parent or a descendant of itself.');

                    return;
                }

                $cursor = (int) (Category::whereKey($cursor)->value('parent_id') ?? 0);

                if (++$guard > 100) {
                    return; // safety valve against malformed / looping data
                }
            }
        };
    }
}
