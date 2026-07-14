<?php

namespace Automas\Sales\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalesDocumentRequest extends FormRequest
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
            'folder_id' => 'nullable|exists:sales_document_folders,id',
            'type_id' => 'nullable|exists:sales_document_types,id',
            'opportunity_id' => 'nullable|exists:sales_opportunities,id',
            'status' => 'required|string|in:active,draft,expired,cancelled',
            'publish_date' => 'nullable|date',
            'expiration_date' => 'nullable|date|after:publish_date',
            'attachment' => 'nullable|file|max:10240',
            'assign_user_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}