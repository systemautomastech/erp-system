<?php

namespace Automas\Lead\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|max:100',
            'price' => 'required|numeric|min:0',            
            'phone' => 'nullable|string|regex:/^\+?\d{10,16}$/',
            'clients'   => 'required|array|min:1',
            'clients.*' => 'integer|exists:users,id',
        ];
    }
}