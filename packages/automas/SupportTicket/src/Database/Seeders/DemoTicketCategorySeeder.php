<?php

namespace Automas\SupportTicket\Database\Seeders;

use Automas\SupportTicket\Models\TicketCategory;
use Illuminate\Database\Seeder;

class DemoTicketCategorySeeder extends Seeder
{
    public function run($userId): void
    {
        if (TicketCategory::where('created_by', $userId)->exists()) {
            return;
        }

        $categories = [
            ['name' => 'Technical Support', 'color' => '#3B82F6'],
            ['name' => 'Billing & Payment', 'color' => '#10B981'],
            ['name' => 'Feature Request', 'color' => '#F59E0B'],
            ['name' => 'Bug Report', 'color' => '#EF4444'],
            ['name' => 'Account Management', 'color' => '#06B6D4'],
            ['name' => 'Integration Support', 'color' => '#84CC16'],
            ['name' => 'Performance Issues', 'color' => '#F97316'],
            ['name' => 'Security Concerns', 'color' => '#DC2626'],
            ['name' => 'Training & Education', 'color' => '#7C3AED'],
            ['name' => 'General Inquiry', 'color' => '#6B7280']
        ];

        foreach ($categories as $category) {
            TicketCategory::create([
                'name' => $category['name'],
                'color' => $category['color'],
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}