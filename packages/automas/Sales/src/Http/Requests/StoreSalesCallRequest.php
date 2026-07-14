<?php

namespace Automas\Sales\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesCallRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'status' => 'required|string|in:scheduled,in_progress,completed,cancelled',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'direction' => 'required|string|in:inbound,outbound',
            'parent_type' => 'nullable|string|in:account,contact,opportunity,case',
            'parent_id' => 'nullable|integer',
            'account_id' => 'nullable|exists:sales_accounts,id',
            'assigned_user_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
            'attendees_users' => 'nullable|array',
            'attendees_users.*' => 'exists:users,id',
            'attendees_contacts' => 'nullable|array',
            'attendees_contacts.*' => 'exists:sales_contacts,id',
        ];
    }
}