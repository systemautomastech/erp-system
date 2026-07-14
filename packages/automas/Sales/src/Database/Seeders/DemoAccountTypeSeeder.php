<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesAccountType;

class DemoAccountTypeSeeder extends Seeder
{
    public function run($userId): void
    {

        if (SalesAccountType::where('created_by', $userId)->exists()) {
            return;
        }

        $accountTypes = [
            'Customer',
            'Prospect',
            'Partner',
            'Competitor',
            'Vendor',
            'Supplier',
            'Distributor',
            'Reseller',
            'Client',
            'Lead',
            'Investor',
            'Consultant',
            'Contractor',
            'Affiliate',
            'Referral',
            'Strategic Partner',
            'Technology Partner',
            'Channel Partner',
            'Integration Partner',
            'Solution Provider',
            'Service Provider',
            'OEM Partner',
            'Value Added Reseller',
            'System Integrator',
            'Enterprise Customer',
            'SMB Customer',
            'Government',
            'Non-profit',
            'Educational',
            'Healthcare Provider',
        ];

        foreach ($accountTypes as $type) {
            SalesAccountType::create([
                'name' => $type,
                'is_active' => true,
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}
