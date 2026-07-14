<?php

namespace Automas\Sales\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSalesContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'account_id' => 'nullable|exists:sales_accounts,id',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('sales_contacts')
                    ->where('created_by', creatorId())
            ],
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:255',
            'assign_user_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'job_title' => 'nullable|string|max:255',
            'lead_source' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'social_media_urls' => 'nullable|string',
            'preferred_contact_method' => 'nullable|string|max:255',
        ];
    }
}