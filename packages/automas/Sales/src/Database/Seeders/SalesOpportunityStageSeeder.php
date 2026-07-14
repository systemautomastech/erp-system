<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesOpportunityStage;

class SalesOpportunityStageSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesOpportunityStage::where('created_by', $userId)->exists()) {
            return;
        }

        $stages = [
            ['name' => 'Prospecting', 'color' => '#3B82F6', 'order' => 1],
            ['name' => 'Qualification', 'color' => '#8B5CF6', 'order' => 2],
            ['name' => 'Proposal', 'color' => '#F59E0B', 'order' => 3],
            ['name' => 'Negotiation', 'color' => '#EF4444', 'order' => 4],
            ['name' => 'Closed Won', 'color' => '#10B981', 'order' => 5],
            ['name' => 'Closed Lost', 'color' => '#6B7280', 'order' => 6],
        ];

        foreach ($stages as $stage) {
            SalesOpportunityStage::create([
                'name' => $stage['name'],
                'color' => $stage['color'],
                'order' => $stage['order'],
                'is_active' => true,
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}