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
            $customers = Customer::where('created_by', creatorId())->get()->map(function ($customer) {
                return [
                    'id' => $customer->user_id,
                    'name' => $customer->company_name ?? '',
                    'email' => $customer->contact_person_email ?? '',
                    'mobile_no' => $customer->contact_person_mobile ?? '',
                    'billing_address' => $customer->billing_address ?? '',
                    'shipping_address' => $customer->shipping_address ?? '',
                ];
            });
            return $customers;
        }

        return User::where('type', 'client')
            ->where('created_by', creatorId())
            ->get();
    }
}
