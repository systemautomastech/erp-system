<?php

namespace Automas\SupportTicket\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\SupportTicket\Models\SupportTicketCustomPage;

class DemoCustomPageSeeder extends Seeder
{
    public function run($userId)
    {
        if (SupportTicketCustomPage::where('created_by', $userId)->exists()) {
            return;
        }

        $pages = [
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'description' => 'Your data privacy and security are our priority.',
                'contents' => '<div class="privacy-policy"><h2>Information We Collect</h2><p>We collect information you provide when submitting support tickets, including your name, email address, and issue details.</p><h2>How We Use Your Information</h2><p>We use this information to provide technical support, resolve issues, and improve our services.</p><h2>Information Sharing</h2><p>We do not sell, trade, or share your personal information with third parties without your consent, except as required by law.</p></div>',
                'is_editable' => false,
                'enable_page_footer' => 'on',
            ],
            [
                'title' => 'Terms & Conditions',
                'slug' => 'terms-conditions',
                'description' => 'Terms and conditions for using our support ticket system.',
                'contents' => '<div class="terms-conditions"><h2>Support Guidelines</h2><p>By submitting a support ticket, you agree to provide accurate information and follow our support guidelines.</p><h2>Response Time</h2><p>We aim to respond to all tickets within 24-48 hours during business days. Critical issues will be prioritized.</p><h2>Confidentiality</h2><p>All information provided in support tickets will be kept confidential and used only for support purposes.</p></div>',
                'is_editable' => false,
                'enable_page_footer' => 'on',
            ],
        ];

        foreach ($pages as $page) {
            SupportTicketCustomPage::create([
                'title' => $page['title'],
                'slug' => $page['slug'],
                'description' => $page['description'],
                'contents' => $page['contents'],
                'is_editable' => $page['is_editable'],
                'enable_page_footer' => $page['enable_page_footer'],
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}
