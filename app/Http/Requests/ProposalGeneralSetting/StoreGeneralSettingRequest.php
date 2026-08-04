<?php

namespace App\Http\Requests\ProposalGeneralSetting;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGeneralSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'proposal_number_prefix' => ['required', 'string', 'max:20'],
            'next_starting_number' => ['required', 'integer', 'min:1'],
            'validity_period_days' => ['required', 'integer', 'min:1', 'max:365'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'proposal_number_prefix.required' => 'The proposal number prefix is required.',
            'proposal_number_prefix.max' => 'The proposal number prefix may not be greater than 20 characters.',

            'next_starting_number.required' => 'The next starting number is required.',
            'next_starting_number.integer' => 'The next starting number must be a valid integer.',
            'next_starting_number.min' => 'The next starting number must be at least 1.',

            'validity_period_days.required' => 'The default validity period is required.',
            'validity_period_days.integer' => 'The default validity period must be a valid number.',
            'validity_period_days.min' => 'The default validity period must be at least 1 day.',
            'validity_period_days.max' => 'The default validity period may not exceed 365 days.',
        ];
    }
}
