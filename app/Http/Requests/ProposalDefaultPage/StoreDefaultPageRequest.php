<?php

namespace App\Http\Requests\ProposalDefaultPage;

use Illuminate\Foundation\Http\FormRequest;

use Illuminate\Validation\Rule;

class StoreDefaultPageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (!$this->has('creator_id') && auth()->check()) {
            $this->merge([
                'creator_id' => auth()->id(),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_active' => 'sometimes|boolean',
            'order' => [
                'sometimes',
                'integer',
                'min:1',
                Rule::unique('proposal_default_pages', 'order')->where(fn ($query) => $query->where('creator_id', auth()->id())),
            ],
            'creator_id' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'title.required' => __('The page title field is required.'),
            'title.string' => __('The page title must be a valid string.'),
            'title.max' => __('The page title may not be greater than 255 characters.'),
            'content.required' => __('The page content field is required.'),
            'content.string' => __('The page content must be a valid string.'),
            'is_active.boolean' => __('The active status must be active or inactive.'),
            'order.integer' => __('The order must be an integer.'),
            'order.min' => __('The order must be at least 1.'),
            'order.unique' => __('Duplicate sort order, please use a different order.'),
        ];
    }
}
