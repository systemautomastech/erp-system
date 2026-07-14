<?php

namespace Automas\Sales\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalesDocumentTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required'
        ];
    }
}