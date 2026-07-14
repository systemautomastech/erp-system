<?php

namespace Automas\SupportTicket\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\SupportTicket\Models\QuickLink;

class DemoQuickLinkSeeder extends Seeder
{
    public function run($userId = 1): void
    {
        $defaultLinks = [
            ['title' => 'User Guides', 'icon' => 'BookOpen', 'link' => '#'],
            ['title' => 'Video Tutorials', 'icon' => 'Video', 'link' => '#'],
            ['title' => 'Tips & Tricks', 'icon' => 'Lightbulb', 'link' => '#'],
            ['title' => 'API Documentation', 'icon' => 'Code', 'link' => '#'],
            ['title' => 'Community Forums', 'icon' => 'MessageCircle', 'link' => '#'],
        ];

        foreach ($defaultLinks as $link) {
            QuickLink::firstOrCreate(
                [
                    'title' => $link['title'],
                    'created_by' => $userId
                ],
                [
                    'icon' => $link['icon'],
                    'link' => $link['link'],
                    'creator_id' => $userId,
                    'created_by' => $userId
                ]
            );
        }
    }
}
