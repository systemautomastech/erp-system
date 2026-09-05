<?php

namespace App\Services;

use App\Models\User;
use Automas\Account\Models\Customer;

class CustomerService
{
    /**
     * Get active client customers with optional custom selected fields.
     */
    public function getCustomers()
    {
        if (module_is_active('Account')) {
            $customers = Customer::with('user')->where('created_by', creatorId())->get()->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->user?->name ?? '',
                    'email' => $customer->email ?? $customer->user?->email ?? '',
                    'mobile_no' => $customer->mobile_no ?? $customer->user?->mobile_no ?? '',
                    'billing_name' => $customer->billing_name ?? '',
                    'billing_address' => $customer->billing_address ?? '',
                    'billing_email' => $customer->billing_email ?? '',
                    'shipping_name' => $customer->shipping_name ?? '',
                    'shipping_address' => $customer->shipping_address ?? '',
                    'shipping_email' => $customer->shipping_email ?? '',
                ];
            });
            return $customers;
        }

        return User::where('type', 'client')
            ->where('created_by', creatorId())
            ->get();
    }
}
