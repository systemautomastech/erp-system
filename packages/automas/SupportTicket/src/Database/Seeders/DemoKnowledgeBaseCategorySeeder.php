<?php

namespace Automas\SupportTicket\Database\Seeders;

use Automas\SupportTicket\Models\KnowledgeBaseCategory;
use Illuminate\Database\Seeder;

class DemoKnowledgeBaseCategorySeeder extends Seeder
{
    public function run($userId): void
    {
        if (KnowledgeBaseCategory::where('created_by', $userId)->exists()) {
            return;
        }

        $categories = [
            'Getting Started Guide',
            'Billing & Subscription Management',
            'Feature Documentation',
            'Troubleshooting & Bug Fixes',
            'Account Setup & Configuration',
            'Third-Party Integrations',
            'Performance Optimization',
            'Security Best Practices',
            'User Training Resources',
            'FAQ & Common Questions'
        ];

        foreach ($categories as $categoryName) {
            KnowledgeBaseCategory::create([
                'title' => $categoryName,
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}