<?php

namespace Automas\Sales\Database\Seeders;

use Automas\Sales\Models\SalesDocumentType;
use Illuminate\Database\Seeder;

class DemoSalesDocumentTypeSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesDocumentType::where('created_by', $userId)->exists()) {
            return;
        }

        $documentTypes = [
            'Proposal',
            'Contract',
            'Quote',
            'Purchase Order',
            'Sales Agreement',
            'Non-Disclosure Agreement',
            'Service Agreement',
            'Terms of Service',
            'Privacy Policy',
            'Product Specification',
            'Technical Documentation',
            'User Manual',
            'Installation Guide',
            'Warranty Certificate',
            'Compliance Certificate',
            'Quality Assurance Report',
            'Project Proposal',
            'Business Plan',
            'Marketing Material',
            'Brochure',
            'Presentation',
            'Training Manual',
            'Policy Document',
            'Procedure Document',
            'Invoice',
            'Receipt',
            'Statement of Work',
            'Change Request',
            'Risk Assessment'
        ];

        foreach ($documentTypes as $type) {
            SalesDocumentType::create([
                'name' => $type,
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}