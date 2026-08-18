<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => 'required|string|max:255',
            'invoice_date' => 'required|date',
            'customer_mode' => 'nullable|in:existing,new',
            'customer_id' => 'required_unless:customer_mode,new|nullable|integer|exists:users,id',
            'customer_name' => 'required_if:customer_mode,new|nullable|string|max:255',
            'customer_email' => 'required_if:customer_mode,new|nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_type' => 'nullable|string|max:50',
            'customer_address' => 'nullable|string',
            'type' => 'required|in:product,service',
            'warehouse_id' => 'required_if:type,product|nullable|integer|exists:warehouses,id',
            'payment_terms' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|min:1',
            'items.*.section' => 'nullable|string|max:50',
            'items.*.product_type' => 'nullable|string|max:50',
            'items.*.quantity' => 'nullable|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'items.*.tax_percentage' => 'nullable|numeric|min:0|max:100',
            'items.*.taxes' => 'nullable|array',
            'items.*.taxes.*.tax_name' => 'required_with:items.*.taxes|string',
            'items.*.taxes.*.tax_rate' => 'required_with:items.*.taxes|numeric|min:0',

            'tariffs' => 'nullable|array',
            'tariffs.*.particulars' => 'nullable|string',
            'tariffs.*.tariff_per_min' => 'nullable|numeric|min:0',
            'tariffs.*.brand' => 'nullable|string',
            'tariffs.*.qty' => 'nullable|numeric|min:0',
            'tariffs.*.pulse_per_min' => 'nullable|string',
            'tariffs.*.sort_order' => 'nullable|integer',

            'proposal_content' => 'nullable|array',
            'proposal_content.*.content' => 'required|string',
            'proposal_content.*.order' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.exists' => __('Selected customer does not exist.'),
            'items.required' => __('At least one item is required.'),
            'items.*.product_id.min' => __('Please select a product for each item.'),
            'items.*.quantity.min' => __('Quantity must be at least 1.'),
            'items.*.unit_price.min' => __('Unit price must be 0 or greater.'),
            'proposal_content.array' => __('Proposal content must be a valid array.'),
            'proposal_content.*.string' => __('Each proposal content must be valid text.'),
        ];
    }
}
