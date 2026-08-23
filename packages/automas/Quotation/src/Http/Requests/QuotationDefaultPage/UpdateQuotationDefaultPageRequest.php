<?php

namespace Automas\Quotation\Http\Requests\QuotationDefaultPage;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuotationDefaultPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $creatorId = auth()->check() ? creatorId() : null;
        $pageId = $this->route('default_page') ? ($this->route('default_page')->id ?? $this->route('default_page')) : $this->id;

        return [
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('quotation_default_pages', 'title')
                    ->where(fn($query) => $query->where('creator_id', $creatorId))
                    ->ignore($pageId),
            ],
            'content' => 'nullable|string',
            'background_image' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'sort_order' => [
                'sometimes',
                'integer',
                'min:1',
                Rule::unique('quotation_default_pages', 'sort_order')
                    ->where(fn($query) => $query->where('creator_id', $creatorId))
                    ->ignore($pageId),
            ],
            'creator_id' => 'nullable|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => __('The page title field is required.'),
            'title.string' => __('The page title must be a valid string.'),
            'title.max' => __('The page title may not be greater than 255 characters.'),
            'title.unique' => __('A page with this title already exists.'),
            'content.string' => __('The page content must be a valid string.'),
            'is_active.boolean' => __('The active status must be active or inactive.'),
            'sort_order.integer' => __('The sort order must be an integer.'),
            'sort_order.min' => __('The sort order must be at least 1.'),
            'sort_order.unique' => __('Duplicate sort order, please use a different order.'),
            'creator_id.exists' => __('The selected creator is invalid.'),
        ];
    }
}
