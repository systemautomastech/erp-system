<?php

namespace Automas\Sales\Database\Seeders;

use Automas\Sales\Models\SalesCaseType;
use Illuminate\Database\Seeder;

class DemoCaseTypeSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesCaseType::where('created_by', $userId)->exists()) {
            return;
        }

        $caseTypes = [
            'Technical Support',
            'Billing Inquiry',
            'Product Issue',
            'Service Request',
            'Complaint',
            'Feature Request',
            'Bug Report',
            'Account Issue',
            'Payment Problem',
            'Refund Request',
            'Installation Support',
            'Training Request',
            'General Inquiry',
            'Sales Question',
            'Contract Issue',
            'Delivery Problem',
            'Quality Issue',
            'Warranty Claim',
            'Upgrade Request',
            'Cancellation Request',
            'Data Recovery',
            'Security Issue',
            'Integration Support',
            'Consultation Request',
            'Emergency Support',
            'License Issue',
            'Performance Issue',
            'Configuration Support',
            'Migration Support',
            'Compliance Issue'
        ];

        foreach ($caseTypes as $type) {
            SalesCaseType::create([
                'type' => $type,
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}