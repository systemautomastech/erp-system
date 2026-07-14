<?php

namespace Automas\Sales\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalesCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'status' => 'required|string|in:new,assigned,pending,closed,rejected,duplicate',
            'priority' => 'required|string|in:low,medium,high,urgent',
            'account_id' => 'nullable|exists:sales_accounts,id',
            'contact_id' => 'nullable|exists:sales_contacts,id',
            'case_type_id' => 'nullable|exists:sales_case_types,id',
            'assign_user_id' => 'nullable|exists:users,id',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx',
            'description' => 'nullable|string',
        ];
    }
}