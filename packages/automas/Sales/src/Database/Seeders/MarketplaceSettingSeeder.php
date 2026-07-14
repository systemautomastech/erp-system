<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\LandingPage\Models\MarketplaceSetting;
use Illuminate\Support\Facades\File;

class MarketplaceSettingSeeder extends Seeder
{
    public function run()
    {
        // Get all available screenshots from marketplace directory
        $marketplaceDir = __DIR__ . '/../../marketplace';
        $screenshots = [];
        
        if (File::exists($marketplaceDir)) {
            $files = File::files($marketplaceDir);
            foreach ($files as $file) {
                if (in_array($file->getExtension(), ['png', 'jpg', 'jpeg', 'gif', 'webp'])) {
                    $screenshots[] = '/packages/automas/Sales/src/marketplace/' . $file->getFilename();
                }
            }
        }
        
        sort($screenshots);
        
        MarketplaceSetting::firstOrCreate(['module' => 'Sales'], [
            'module' => 'Sales',
            'title' => 'Sales Management System',
            'subtitle' => 'Comprehensive customer relationship management platform designed to streamline your sales operations',
            'config_sections' => [
                'sections' => [
                    'hero' => [
                        'variant' => 'hero1',
                        'title' => 'Sales Management System for Automas ERP',
                        'subtitle' => 'Comprehensive customer relationship management platform designed to streamline your sales operations. Manage customer accounts, track sales opportunities, generate quotes and orders, handle sales invoices, and monitor your sales performance through detailed analytics and reports.',
                        'primary_button_text' => 'Install Sales Module',
                        'primary_button_link' => '#install',
                        'secondary_button_text' => 'View Features',
                        'secondary_button_link' => '#features',
                        'image' => '/packages/automas/Sales/src/marketplace/hero.png'
                    ],
                    'modules' => [
                        'variant' => 'modules1',
                        'title' => 'Sales Management System',
                        'subtitle' => 'Essential Features of Sales Management with Comprehensive Dashboard, Account Management, and Advanced Analytics'
                    ],
                    'dedication' => [
                        'variant' => 'dedication1',
                        'title' => 'Complete Sales Management Solution',
                        'description' => 'Build rich, connected profiles through a centralized account and contact system with comprehensive opportunity tracking, quote generation, and sales order processing.',
                        'subSections' => [
                            [
                                'title' => 'Accounts & Contacts Management',
                                'description' => 'Build rich, connected profiles through a centralized account and contact system. Accounts include comprehensive information like billing/shipping addresses, industries, account types, and assigned users. Contacts are independently managed but linked to accounts, ensuring relationship clarity.',
                                'keyPoints' => ['Detailed billing and shipping profiles for each account', 'Contact records with full linkage to parent accounts', 'User assignment and activity streams in accounts & contacts', 'Search/Filtering functionality for data management'],
                                'screenshot' => '/packages/automas/Sales/src/marketplace/image1.png'
                            ],
                            [
                                'title' => 'Opportunity & Quote Workflow',
                                'description' => 'Manage your entire sales pipeline using a flexible opportunity tracking system connected directly to quotes. Each opportunity includes customizable stages, value tracking, probability assessment, and timeline management. Quotes are directly generated from opportunities and inherit all account data.',
                                'keyPoints' => ['Stage-based opportunity pipeline with value and probability tracking', 'Seamless quote creation from linked opportunities', 'One-click quote duplication and sales order conversion', 'Comprehensive item management with pricing, discounts, and taxes'],
                                'screenshot' => '/packages/automas/Sales/src/marketplace/image2.png'
                            ],
                            [
                                'title' => 'Sales Orders & Invoice Management',
                                'description' => 'Efficiently manage your sales orders and invoices with fully connected workflows. Sales Orders inherit information from quotes and opportunities, allowing detailed product-level control. Sales Invoices are created directly from orders with controlled editing after conversion to preserve accuracy.',
                                'keyPoints' => ['Sales order-to-invoice flow with controlled editing permissions', 'Itemized pricing with tax, discount, and total calculations', 'Conversion workflows between quotes, orders, and Sales invoices', 'Print and sharing capabilities for all documents'],
                                'screenshot' => '/packages/automas/Sales/src/marketplace/image3.png'
                            ],
                            [
                                'title' => 'Case, Document & Communication Management',
                                'description' => 'Organize and resolve support or service issues through structured case handling with integrated communication tools. Each case supports priority levels, file attachments, and user assignments. Schedule and manage calls and meetings with detailed participant lists and parent record linking. A document management system with hierarchical folders helps centralize all related files by type and category.',
                                'keyPoints' => ['Case management with priority and status handling', 'Meeting and call scheduling with multi-participant support', 'Hierarchical document folders for organized file storage', 'Parent record linking for context tracking'],
                                'screenshot' => '/packages/automas/Sales/src/marketplace/image4.png'
                            ],
                            [
                                'title' => 'Advanced Analytics & Reports',
                                'description' => 'Comprehensive reporting system offers real-time insights using donut charts and filterable data tables for Quotes, Sales Orders, and Sales Invoices. Dashboard provides overview cards with progress indicators and radial column charts for trend analysis.',
                                'keyPoints' => ['Dashboard with 6 key metric cards and overview progress indicators', 'Donut chart analytics by date range, account, and status', 'Quote, Sales Order, and Sales Invoice analytics with filtering', 'Radial column chart for trend visualization'],
                                'screenshot' => '/packages/automas/Sales/src/marketplace/image5.png'
                            ]
                        ]
                    ],
                    'screenshots' => [
                        'variant' => 'screenshots1',
                        'title' => 'Sales Management System in Action',
                        'subtitle' => 'See how our comprehensive platform streamlines your entire sales operation',
                        'images' => $screenshots
                    ],
                    'why_choose' => [
                        'variant' => 'whychoose1',
                        'title' => 'Why Choose Sales Management System?',
                        'subtitle' => 'Transform your sales operations with comprehensive customer relationship management',
                        'benefits' => [
                            [
                                'title' => 'Comprehensive Dashboard',
                                'description' => 'Monitor all sales activities with a unified dashboard featuring key metrics and progress indicators.',
                                'icon' => 'BarChart3',
                                'color' => 'blue'
                            ],
                            [
                                'title' => 'Account Management',
                                'description' => 'Centralized account system with billing/shipping addresses, industries, and user assignments.',
                                'icon' => 'Building2',
                                'color' => 'green'
                            ],
                            [
                                'title' => 'Contact Organization',
                                'description' => 'Manage contacts independently while maintaining clear linkage to parent accounts.',
                                'icon' => 'Users',
                                'color' => 'purple'
                            ],
                            [
                                'title' => 'Opportunity Tracking',
                                'description' => 'Track sales opportunities with customizable stages, value tracking, and probability assessment.',
                                'icon' => 'Target',
                                'color' => 'red'
                            ],
                            [
                                'title' => 'Quote Generation',
                                'description' => 'Generate quotes directly from opportunities with one-click duplication and conversion capabilities.',
                                'icon' => 'FileText',
                                'color' => 'yellow'
                            ],
                            [
                                'title' => 'Sales Order Processing',
                                'description' => 'Process sales orders with controlled editing permissions and automated calculations.',
                                'icon' => 'ShoppingCart',
                                'color' => 'indigo'
                            ],
                            [
                                'title' => 'Sales Invoice Management',
                                'description' => 'Create and manage sales invoices with itemized pricing and tax calculations.',
                                'icon' => 'Receipt',
                                'color' => 'pink'
                            ],
                            [
                                'title' => 'Case Handling',
                                'description' => 'Organize support issues with priority levels, file attachments, and user assignments.',
                                'icon' => 'Briefcase',
                                'color' => 'orange'
                            ],
                            [
                                'title' => 'Meeting & Call Scheduling',
                                'description' => 'Schedule meetings and calls with multi-participant support and parent record linking.',
                                'icon' => 'Calendar',
                                'color' => 'teal'
                            ],
                            [
                                'title' => 'Document Management',
                                'description' => 'Hierarchical document folders with type categorization and access control.',
                                'icon' => 'FolderOpen',
                                'color' => 'cyan'
                            ],
                            [
                                'title' => 'Advanced Analytics & Reports',
                                'description' => 'Real-time insights with donut charts, filterable data tables, and trend visualization.',
                                'icon' => 'TrendingUp',
                                'color' => 'emerald'
                            ],
                            [
                                'title' => 'System Setup Configuration',
                                'description' => 'Configure all dropdown values and customize system settings for your business needs.',
                                'icon' => 'Settings',
                                'color' => 'slate'
                            ]
                        ]
                    ]
                ],
                'section_visibility' => [
                    'header' => true,
                    'hero' => true,
                    'modules' => true,
                    'dedication' => true,
                    'screenshots' => true,
                    'why_choose' => true,
                    'cta' => true,
                    'footer' => true
                ],
                'section_order' => ['header', 'hero', 'modules', 'dedication', 'screenshots', 'why_choose', 'cta', 'footer']
            ]
        ]);
    }
}