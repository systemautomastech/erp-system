<?php

namespace Automas\Sales\Database\Seeders;

use Automas\Sales\Models\SalesDocumentFolder;
use Illuminate\Database\Seeder;

class DemoSalesDocumentFolderSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesDocumentFolder::where('created_by', $userId)->exists()) {
            return;
        }

        // Create main folders first
        $mainFolders = [
            ['name' => 'Contracts', 'description' => 'All contract documents and agreements'],
            ['name' => 'Proposals', 'description' => 'Sales proposals and quotations'],
            ['name' => 'Legal Documents', 'description' => 'Legal agreements and compliance documents'],
            ['name' => 'Marketing Materials', 'description' => 'Brochures, presentations and marketing content'],
            ['name' => 'Technical Documentation', 'description' => 'Product specifications and technical guides'],
            ['name' => 'Policies', 'description' => 'Company policies and procedures'],
            ['name' => 'Financial Reports', 'description' => 'Financial statements and reports'],
            ['name' => 'Training Materials', 'description' => 'Employee training and educational content'],
            ['name' => 'Project Documents', 'description' => 'Project plans and documentation'],
            ['name' => 'Customer Files', 'description' => 'Customer-specific documents and records']
        ];

        $createdFolders = [];
        foreach ($mainFolders as $folder) {
            $createdFolder = SalesDocumentFolder::create([
                'name' => $folder['name'],
                'parent' => null,
                'description' => $folder['description'],
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
            $createdFolders[] = $createdFolder;
        }

        // Create subfolders
        $subFolders = [
            ['name' => 'Service Contracts', 'parent' => 'Contracts', 'description' => 'Service agreement contracts'],
            ['name' => 'Sales Contracts', 'parent' => 'Contracts', 'description' => 'Sales agreement contracts'],
            ['name' => 'Partnership Agreements', 'parent' => 'Contracts', 'description' => 'Business partnership contracts'],
            ['name' => 'Client Proposals', 'parent' => 'Proposals', 'description' => 'Proposals sent to clients'],
            ['name' => 'Internal Proposals', 'parent' => 'Proposals', 'description' => 'Internal project proposals'],
            ['name' => 'RFP Responses', 'parent' => 'Proposals', 'description' => 'Request for proposal responses'],
            ['name' => 'NDAs', 'parent' => 'Legal Documents', 'description' => 'Non-disclosure agreements'],
            ['name' => 'Compliance', 'parent' => 'Legal Documents', 'description' => 'Compliance certificates and reports'],
            ['name' => 'Intellectual Property', 'parent' => 'Legal Documents', 'description' => 'Patents and IP documents'],
            ['name' => 'Product Brochures', 'parent' => 'Marketing Materials', 'description' => 'Product marketing brochures'],
            ['name' => 'Presentations', 'parent' => 'Marketing Materials', 'description' => 'Sales and marketing presentations'],
            ['name' => 'Case Studies', 'parent' => 'Marketing Materials', 'description' => 'Customer success case studies'],
            ['name' => 'User Manuals', 'parent' => 'Technical Documentation', 'description' => 'Product user manuals'],
            ['name' => 'Installation Guides', 'parent' => 'Technical Documentation', 'description' => 'Product installation guides'],
            ['name' => 'API Documentation', 'parent' => 'Technical Documentation', 'description' => 'API reference documentation'],
            ['name' => 'HR Policies', 'parent' => 'Policies', 'description' => 'Human resources policies'],
            ['name' => 'Sales Policies', 'parent' => 'Policies', 'description' => 'Sales department policies'],
            ['name' => 'Security Policies', 'parent' => 'Policies', 'description' => 'Information security policies'],
            ['name' => 'Annual Reports', 'parent' => 'Financial Reports', 'description' => 'Yearly financial reports'],
            ['name' => 'Budget Documents', 'parent' => 'Financial Reports', 'description' => 'Budget planning documents']
        ];

        foreach ($subFolders as $subFolder) {
            $parentFolder = collect($createdFolders)->firstWhere('name', $subFolder['parent']);
            SalesDocumentFolder::create([
                'name' => $subFolder['name'],
                'parent' => $parentFolder?->id,
                'description' => $subFolder['description'],
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}