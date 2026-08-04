<?php

namespace Automas\Lead\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UploadLeadImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create-leads') ?? false;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                File::types(['csv', 'txt'])
                    ->min('1kb')
                    ->max('100mb'),
                'extensions:csv,txt',
            ],

            'mode' => [
                'required',
                'in:preview,direct',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => __('Please select a CSV file.'),
            'file.extensions' => __('Only CSV files are allowed.'),
            'file.max' => __('The CSV file may not be larger than 100 MB.'),
            'mode.required' => __('Please select an import mode.'),
            'mode.in' => __('The selected import mode is invalid.'),
        ];
    }
}