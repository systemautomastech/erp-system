<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesAccountIndustry;

class DemoAccountIndustrySeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesAccountIndustry::where('created_by', $userId)->exists()) {
            return;
        }

        $industries = [
            'Technology',
            'Healthcare',
            'Finance',
            'Manufacturing',
            'Retail',
            'Education',
            'Real Estate',
            'Consulting',
            'Automotive',
            'Agriculture',
            'Construction',
            'Entertainment',
            'Food & Beverage',
            'Government',
            'Insurance',
            'Legal',
            'Media',
            'Non-profit',
            'Pharmaceuticals',
            'Telecommunications',
            'Transportation',
            'Utilities',
            'Banking',
            'Energy',
            'Hospitality',
            'Logistics',
            'Mining',
            'Publishing',
            'Sports',
            'Travel',
        ];

        foreach ($industries as $industry) {
            SalesAccountIndustry::create([
                'name' => $industry,
                'is_active' => true,
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}
