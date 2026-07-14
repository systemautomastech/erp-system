<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunityStage;
use App\Models\User;

class DemoSalesOpportunitySeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesOpportunity::where('created_by', $userId)->exists()) {
            return;
        }

        $accounts = SalesAccount::where('created_by', $userId)->where('is_active', true)->get();
        $contacts = SalesContact::where('created_by', $userId)->where('is_active', true)->get();
        $stages = SalesOpportunityStage::where('created_by', $userId)->get();
        $users = User::emp()->where('created_by', $userId)->pluck('id')->toArray();
        $users[] = $userId;
        
        if ($accounts->isEmpty() || $contacts->isEmpty() || $stages->isEmpty()) {
            return;
        }

        $opportunities = [
            [
                'name' => 'Enterprise Software Implementation',
                'amount' => 125000.00,
                'expected_amount' => 150000.00,
                'lead_source' => 'Website',
                'probability' => 75,
                'next_step' => 'Schedule demo presentation',
                'description' => 'Complete enterprise software implementation including training and support for 500+ users.'
            ],
            [
                'name' => 'Cloud Migration Project',
                'amount' => 85000.00,
                'expected_amount' => 95000.00,
                'lead_source' => 'Referral',
                'probability' => 60,
                'next_step' => 'Technical assessment meeting',
                'description' => 'Migration of legacy systems to cloud infrastructure with 24/7 support.'
            ],
            [
                'name' => 'Digital Marketing Campaign',
                'amount' => 45000.00,
                'expected_amount' => 50000.00,
                'lead_source' => 'Cold Call',
                'probability' => 80,
                'next_step' => 'Send proposal',
                'description' => '6-month comprehensive digital marketing campaign including SEO, PPC, and social media.'
            ],
            [
                'name' => 'Manufacturing Equipment Upgrade',
                'amount' => 250000.00,
                'expected_amount' => 280000.00,
                'lead_source' => 'Trade Show',
                'probability' => 45,
                'next_step' => 'Site visit and assessment',
                'description' => 'Complete manufacturing line upgrade with automated systems and quality control.'
            ],
            [
                'name' => 'Healthcare IT Solutions',
                'amount' => 180000.00,
                'expected_amount' => 200000.00,
                'lead_source' => 'LinkedIn',
                'probability' => 70,
                'next_step' => 'Contract negotiation',
                'description' => 'Integrated healthcare management system with patient portal and analytics.'
            ],
            [
                'name' => 'Financial Services Platform',
                'amount' => 320000.00,
                'expected_amount' => 350000.00,
                'lead_source' => 'Partner',
                'probability' => 55,
                'next_step' => 'Compliance review',
                'description' => 'Custom financial services platform with compliance and reporting features.'
            ],
            [
                'name' => 'Retail POS System',
                'amount' => 75000.00,
                'probability' => 85,
                'description' => 'Multi-location point of sale system with inventory management and analytics.'
            ],
            [
                'name' => 'Construction Project Management',
                'amount' => 95000.00,
                'probability' => 40,
                'description' => 'Project management software for construction with scheduling and resource allocation.'
            ],
            [
                'name' => 'Green Energy Consulting',
                'amount' => 65000.00,
                'probability' => 90,
                'description' => 'Renewable energy assessment and implementation consulting for corporate facilities.'
            ],
            [
                'name' => 'E-commerce Platform Development',
                'amount' => 110000.00,
                'probability' => 65,
                'description' => 'Custom e-commerce platform with mobile app and payment gateway integration.'
            ],
            [
                'name' => 'Food Distribution System',
                'amount' => 140000.00,
                'probability' => 50,
                'description' => 'Automated food distribution and inventory management system for nationwide operations.'
            ],
            [
                'name' => 'Logistics Optimization',
                'amount' => 200000.00,
                'probability' => 60,
                'description' => 'Supply chain optimization with route planning and real-time tracking capabilities.'
            ],
            [
                'name' => 'Educational Technology Platform',
                'amount' => 90000.00,
                'probability' => 75,
                'description' => 'Learning management system with virtual classroom and assessment tools.'
            ],
            [
                'name' => 'Real Estate CRM',
                'amount' => 55000.00,
                'probability' => 80,
                'description' => 'Customer relationship management system tailored for real estate operations.'
            ],
            [
                'name' => 'Pharmaceutical Research Database',
                'amount' => 275000.00,
                'probability' => 35,
                'description' => 'Comprehensive research database with clinical trial management and regulatory compliance.'
            ],
            [
                'name' => 'Automotive Parts Inventory',
                'amount' => 120000.00,
                'probability' => 70,
                'description' => 'Automated inventory management system for automotive parts with supplier integration.'
            ],
            [
                'name' => 'Business Intelligence Solution',
                'amount' => 160000.00,
                'probability' => 55,
                'description' => 'Advanced analytics and reporting platform with predictive modeling capabilities.'
            ],
            [
                'name' => 'Media Production Workflow',
                'amount' => 85000.00,
                'probability' => 65,
                'description' => 'Digital asset management and production workflow system for media companies.'
            ],
            [
                'name' => 'Security System Integration',
                'amount' => 105000.00,
                'probability' => 85,
                'description' => 'Integrated security system with access control, surveillance, and monitoring.'
            ],
            [
                'name' => 'Textile Manufacturing ERP',
                'amount' => 190000.00,
                'probability' => 40,
                'description' => 'Enterprise resource planning system for textile manufacturing with quality control.'
            ],
            [
                'name' => 'Cloud Infrastructure Migration',
                'amount' => 225000.00,
                'probability' => 65,
                'description' => 'Complete migration to cloud infrastructure with disaster recovery and backup solutions.'
            ],
            [
                'name' => 'Aerospace Quality Management',
                'amount' => 310000.00,
                'probability' => 50,
                'description' => 'Quality management system for aerospace manufacturing with compliance tracking.'
            ],
            [
                'name' => 'Marine Logistics Platform',
                'amount' => 175000.00,
                'probability' => 70,
                'description' => 'Comprehensive logistics platform for marine transportation and cargo management.'
            ],
            [
                'name' => 'Biotech Research Management',
                'amount' => 280000.00,
                'probability' => 45,
                'description' => 'Research data management system with laboratory information management capabilities.'
            ],
            [
                'name' => 'Mining Operations Dashboard',
                'amount' => 145000.00,
                'probability' => 60,
                'description' => 'Real-time operations dashboard for mining with safety monitoring and reporting.'
            ],
            [
                'name' => 'Telecom Network Optimization',
                'amount' => 195000.00,
                'probability' => 75,
                'description' => 'Network optimization solution with performance monitoring and automated scaling.'
            ],
            [
                'name' => 'Sports Analytics Platform',
                'amount' => 80000.00,
                'probability' => 85,
                'description' => 'Advanced sports analytics platform with player performance tracking and insights.'
            ],
            [
                'name' => 'Chemical Process Control',
                'amount' => 260000.00,
                'probability' => 55,
                'description' => 'Automated process control system for chemical manufacturing with safety protocols.'
            ],
            [
                'name' => 'Renewable Energy Management',
                'amount' => 135000.00,
                'probability' => 80,
                'description' => 'Energy management system for renewable sources with grid integration capabilities.'
            ],
            [
                'name' => 'Insurance Claims Processing',
                'amount' => 115000.00,
                'probability' => 70,
                'description' => 'Automated claims processing system with fraud detection and customer portal.'
            ]
        ];

        foreach ($opportunities as $opportunityData) {
            $account = $accounts->random();
            $accountContacts = $contacts->where('account_id', $account->id);
            $contact = $accountContacts->isNotEmpty() ? $accountContacts->random() : $contacts->random();
            
            SalesOpportunity::create(array_merge($opportunityData, [
                'account_id' => $account->id,
                'contact_id' => $contact->id,
                'stage_id' => $stages->random()->id,
                'close_date' => now()->subMonths(rand(0, 6))->format('Y-m-d'),
                'assign_user_id' => !empty($users) ? $users[array_rand($users)] : null,
                'is_active' => true,
                'creator_id' => $userId,
                'created_by' => $userId,
            ]));
        }
    }
}