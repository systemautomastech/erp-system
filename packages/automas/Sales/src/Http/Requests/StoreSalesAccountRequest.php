<?php

namespace Automas\Sales\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Automas\Sales\Models\SalesDocument;
use Illuminate\Validation\Rule;

class StoreSalesAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('sales_accounts')
                    ->where('created_by', creatorId())
            ],
            'phone' => 'required|string|max:20',
            'website' => 'nullable|string|max:255',
            'billing_address.address' => 'nullable|string',
            'billing_address.city' => 'nullable|string|max:255',
            'billing_address.state' => 'nullable|string|max:255',
            'billing_address.country' => 'nullable|string|max:255',
            'billing_address.postal_code' => 'nullable|string|max:20',
            'shipping_address.address' => 'nullable|string',
            'shipping_address.city' => 'nullable|string|max:255',
            'shipping_address.state' => 'nullable|string|max:255',
            'shipping_address.country' => 'nullable|string|max:255',
            'shipping_address.postal_code' => 'nullable|string|max:20',
            'same_as_billing' => 'boolean',
            'assign_user_id' => 'nullable|exists:users,id',
            'type_id' => 'nullable|exists:sales_account_types,id',
            'industry_id' => 'nullable|exists:sales_account_industries,id',
            'sales_document_id' => ['nullable', 'string', function ($attribute, $value, $fail) {
                if ($value !== null && $value !== 'none' && !SalesDocument::where('id', $value)->exists()) {
                    $fail('The selected document id is invalid.');
                }
            }],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }

    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);
        
        // Transform nested address objects to flat structure for database
        if (isset($data['billing_address']) && is_array($data['billing_address'])) {
            $billingAddress = $data['billing_address'];
            $data['billing_address'] = $billingAddress['address'] ?? '';
            $data['billing_city'] = $billingAddress['city'] ?? '';
            $data['billing_state'] = $billingAddress['state'] ?? '';
            $data['billing_country'] = $billingAddress['country'] ?? '';
            $data['billing_postal_code'] = $billingAddress['postal_code'] ?? '';
        }
        
        if (isset($data['shipping_address']) && is_array($data['shipping_address'])) {
            $shippingAddress = $data['shipping_address'];
            $data['shipping_address'] = $shippingAddress['address'] ?? '';
            $data['shipping_city'] = $shippingAddress['city'] ?? '';
            $data['shipping_state'] = $shippingAddress['state'] ?? '';
            $data['shipping_country'] = $shippingAddress['country'] ?? '';
            $data['shipping_postal_code'] = $shippingAddress['postal_code'] ?? '';
        }
        
        // Convert 'none' to null for sales_document_id
        if (isset($data['sales_document_id']) && $data['sales_document_id'] === 'none') {
            $data['sales_document_id'] = null;
        }
        
        return $data;
    }
}