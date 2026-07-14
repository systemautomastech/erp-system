<?php

namespace Automas\SupportTicket\Database\Seeders;

use Automas\SupportTicket\Models\KnowledgeBase;
use Automas\SupportTicket\Models\KnowledgeBaseCategory;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DemoKnowledgeBaseSeeder extends Seeder
{
    public function run($userId): void
    {
        if (KnowledgeBase::where('created_by', $userId)->exists()) {
            return;
        }

        $categories = KnowledgeBaseCategory::where('created_by', $userId)->pluck('id')->toArray();
        
        $articles = [
            [
                'title' => 'Creating Your First Support Ticket',
                'description' => '<h2>Welcome to Support Ticket System</h2><p>This comprehensive guide will walk you through creating your first support ticket. Learn how to provide detailed information, select appropriate categories, and track your ticket status effectively.</p><h3>Step 1: Access Ticket Creation</h3><p>Navigate to the support portal and click "Create New Ticket" to begin the process.</p><h3>Step 2: Fill Required Information</h3><p>Complete all mandatory fields including subject, description, and category selection for faster resolution.</p>',
                'created_at' => Carbon::now()->subMonths(6)->subDays(3)
            ],
            [
                'title' => 'Understanding Ticket Categories and Priority Levels',
                'description' => '<h2>Ticket Classification System</h2><p>Learn about different ticket categories including Technical Support, Billing, Feature Requests, and Bug Reports. Understanding priority levels helps ensure your issues receive appropriate attention and response times.</p><h3>Category Types</h3><p>Each category has specific workflows and assigned support specialists for efficient handling.</p><h3>Priority Guidelines</h3><p>Critical issues affecting system functionality receive immediate attention, while general inquiries follow standard response times.</p>',
                'created_at' => Carbon::now()->subMonths(5)->subDays(28)
            ],
            [
                'title' => 'Managing Subscription Plans and Billing Cycles',
                'description' => '<h2>Subscription Management Dashboard</h2><p>Access your billing dashboard to manage subscription plans, view payment history, and update billing information. Learn about upgrade options, prorated billing, and cancellation policies for complete control over your account.</p><h3>Plan Upgrades</h3><p>Upgrade your subscription anytime with immediate access to new features and increased limits.</p><h3>Payment Methods</h3><p>Securely manage multiple payment methods including credit cards, PayPal, and bank transfers for enterprise accounts.</p>',
                'created_at' => Carbon::now()->subMonths(5)->subDays(20)
            ],
            [
                'title' => 'Invoice Management and Payment Processing',
                'description' => '<h2>Invoice and Payment System</h2><p>Comprehensive guide to viewing invoices, understanding billing details, and managing payment processing. Learn about automatic billing, payment failures, and dispute resolution procedures for seamless financial management.</p><h3>Invoice Access</h3><p>All invoices are available in PDF format with detailed breakdowns of charges and applicable taxes.</p><h3>Payment Troubleshooting</h3><p>Resolve common payment issues including declined cards, expired payment methods, and billing address mismatches.</p>',
                'created_at' => Carbon::now()->subMonths(5)->subDays(12)
            ],
            [
                'title' => 'Submitting Feature Requests and Enhancement Ideas',
                'description' => '<h2>Feature Request Process</h2><p>Learn how to submit detailed feature requests that help our product team understand your needs. Include use cases, business impact, and technical requirements to increase the likelihood of implementation in future releases.</p><h3>Request Guidelines</h3><p>Provide clear descriptions, mockups if available, and explain how the feature would benefit your workflow.</p><h3>Tracking Progress</h3><p>Monitor the status of your feature requests through our product roadmap and receive updates on development progress.</p>',
                'created_at' => Carbon::now()->subMonths(5)->subDays(5)
            ]
        ];

        foreach ($articles as $articleData) {
            $randomCategoryId = $categories[array_rand($categories)] ?? null;
            
            KnowledgeBase::create([
                'title' => $articleData['title'],
                'category_id' => $randomCategoryId,
                'description' => $articleData['description'],
                'creator_id' => $userId,
                'created_by' => $userId,
                'created_at' => $articleData['created_at'],
            ]);
        }
    }
}