<?php

namespace Automas\SupportTicket\Database\Seeders;

use Automas\SupportTicket\Models\SupportTicketSetting;
use Illuminate\Database\Seeder;

class DemoSupportTicketSettingsSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SupportTicketSetting::where('created_by', $userId)->exists()) {
            return;
        }

        $settings = [
            // Brand Settings
            'titleText' => 'Support Center',
            'footerText' => 'Support System. All rights reserved.',

            // Title Sections
            'title_sections' => json_encode([
                'main_title' => 'How can we help you?',
                'main_description' => 'Get support, find answers, and connect with our team',
                'create_ticket_title' => 'Create Support Ticket',
                'create_ticket_description' => 'Submit a new support request and get help from our team',
                'search_ticket_title' => 'Search Tickets',
                'search_ticket_description' => 'Find and track your existing support tickets',
                'knowledge_base_title' => 'Knowledge Base',
                'knowledge_base_description' => 'Browse our comprehensive help documentation',
                'faq_title' => 'Frequently Asked Questions',
                'faq_description' => 'Quick answers to common questions'
            ]),

            // CTA Sections
            'cta_sections' => json_encode([
                'primary_cta' => [
                    'title' => 'Need More Help?',
                    'description' => 'Browse our comprehensive knowledge base for detailed guides and tutorials',
                    'button_text' => 'Browse Knowledge Base',
                    'button_link' => '#knowledge-base'
                ],
                'secondary_cta' => [
                    'title' => 'Still Have Questions?',
                    'description' => 'Check out our FAQ section for quick answers to common questions',
                    'button_text' => 'View FAQ',
                    'button_link' => '#faq'
                ]
            ]),

            // Support Information
            'support_information' => json_encode([
                'response_time' => 'We typically respond to all support tickets within 24-48 hours during business days. Critical issues are prioritized and may receive faster responses.',
                'opening_hours' => '09:00',
                'closing_hours' => '18:00',
                'phone_support' => '+911234567890',
                'email_support' => 'support@example.com',
                'business_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'timezone' => 'UTC'
            ]),

            // Contact Information
            'contact_information' => json_encode([
                'address' => '123 Business Street, Suite 100, City, State 12345',
                'phone' => '+991234567890',
                'email' => 'contact@example.com',
                'map_embed_url' => '',
                'image' => ''
            ])
        ];

        foreach ($settings as $key => $value) {
            SupportTicketSetting::create([
                'key' => $key,
                'value' => $value,
                'created_by' => $userId,
            ]);
        }
    }
}
