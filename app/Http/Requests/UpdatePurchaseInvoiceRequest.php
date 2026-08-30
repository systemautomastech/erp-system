<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'vendor_mode' => 'nullable|in:existing,new',
            'vendor_id' => 'required_unless:vendor_mode,new|nullable|integer|exists:users,id',
            'vendor_name' => 'required_if:vendor_mode,new|nullable|string|max:255',
            'vendor_email' => 'required_if:vendor_mode,new|nullable|email|max:255',
            'vendor_phone' => 'required_if:vendor_mode,new|nullable|string|max:50',
            'vendor_address' => 'required_if:vendor_mode,new|nullable|string',
            'warehouse_id' => 'required|exists:warehouses,id',
            'payment_terms' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|min:1',
            'items.*.description' => 'nullable|string',
            'items.*.product_type' => 'nullable|string|max:50',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'items.*.tax_percentage' => 'nullable|numeric|min:0|max:100'
        ];
    }

    public function messages(): array
    {
        return [
            'vendor_id.required_unless' => __('Please select a vendor.'),
            'vendor_id.exists' => __('Selected vendor does not exist.'),
            'vendor_name.required_if' => __('Vendor name is required for new vendors.'),
            'vendor_email.required_if' => __('Vendor email is required for new vendors.'),
            'vendor_phone.required_if' => __('Vendor phone is required for new vendors.'),
            'vendor_address.required_if' => __('Vendor address is required for new vendors.'),
            'items.required' => __('At least one item is required.'),
            'items.*.product_id.min' => __('Please select a product for each item.'),
            'items.*.quantity.min' => __('Quantity must be at least 1.'),
            'items.*.unit_price.min' => __('Unit price must be 0 or greater.')
        ];
    }
}
