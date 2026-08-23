<?php

namespace App\Services;

use App\Models\User;

class CustomerService
{
    /**
     * Get active client customers with optional custom selected fields
     */
    public function getCustomers(array $columns = ['*'])
    {
        return User::where('type', 'client')
            ->where('created_by', creatorId())
            ->get($columns);
    }

    /**
     * Get customers with dynamically passed columns (supports: 'id', 'name', 'email' OR ['id', 'name'])
     */
    public function getCustomersWithSelect(...$columns)
    {
        // If nothing is passed, default to basic columns
        if (empty($columns)) {
            $columns = ['id', 'name', 'email'];
        }

        // If an array was passed as the first argument, flatten it
        if (is_array($columns[0])) {
            $columns = $columns[0];
        }

        return $this->getCustomers($columns);
    }

    /**
     * Get compact customer list for dropdown / selection (Backward compatible alias)
     */
    public function getCompactCustomers()
    {
        return $this->getCustomersWithSelect('id', 'name', 'email');
    }
}
