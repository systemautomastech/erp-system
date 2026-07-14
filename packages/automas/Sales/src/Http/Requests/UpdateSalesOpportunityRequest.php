<?php

namespace Automas\Sales\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalesOpportunityRequest extends FormRequest
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
            'contact_id' => 'nullable|exists:sales_contacts,id',
            'stage_id' => 'nullable|exists:sales_opportunity_stages,id',
            'amount' => 'required|numeric|min:0',
            'expected_amount' => 'nullable|numeric|min:0',
            'lead_source' => 'nullable|string|max:255',
            'probability' => 'required|array',
            'probability.*' => 'numeric|min:0|max:100',
            'close_date' => 'required|date',
            'next_followup_date' => 'nullable|date',
            'next_step' => 'nullable|string|max:255',
            'lost_reason' => 'nullable|string',
            'assign_user_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}