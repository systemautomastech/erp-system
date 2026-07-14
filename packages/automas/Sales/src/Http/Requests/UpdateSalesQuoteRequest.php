<?php

namespace Automas\Sales\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalesQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'opportunity_id' => 'nullable|exists:sales_opportunities,id',
            'account_id' => 'nullable|exists:sales_accounts,id',
            'customer_id' => 'required|exists:users,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'status' => 'required|string|max:255',
            'date_quoted' => 'required|date',
            'expiry_date' => 'nullable|date|after:date_quoted',
            'billing_address' => 'nullable|string',
            'shipping_address' => 'nullable|string',
            'billing_city' => 'nullable|string|max:255',
            'billing_state' => 'nullable|string|max:255',
            'shipping_city' => 'nullable|string|max:255',
            'shipping_state' => 'nullable|string|max:255',
            'billing_country' => 'nullable|string|max:255',
            'billing_postal_code' => 'nullable|string|max:20',
            'shipping_country' => 'nullable|string|max:255',
            'shipping_postal_code' => 'nullable|string|max:20',
            'billing_contact_id' => 'nullable|exists:sales_contacts,id',
            'shipping_contact_id' => 'nullable|exists:sales_contacts,id',
            'shipping_provider_id' => 'nullable|exists:sales_shipping_providers,id',
            'assign_user_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'items.*.tax_percentage' => 'nullable|numeric|min:0',
            'items.*.taxes' => 'nullable|array',
        ];
    }
}
