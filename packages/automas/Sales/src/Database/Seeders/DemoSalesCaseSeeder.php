<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Automas\Sales\Models\SalesCase;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesCaseType;
use App\Models\User;

class DemoSalesCaseSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesCase::where('created_by', $userId)->exists()) {
            return;
        }

        $faker = Faker::create();

        $accounts = SalesAccount::where('created_by', $userId)->pluck('id')->toArray();
        $contacts = SalesContact::where('created_by', $userId)->pluck('id')->toArray();
        $caseTypes = SalesCaseType::where('created_by', $userId)->pluck('id')->toArray();
        $users = User::emp()->where('created_by', $userId)->pluck('id')->toArray();

        $statuses = ['new', 'assigned', 'pending', 'closed', 'rejected', 'duplicate'];
        $priorities = ['low', 'medium', 'high', 'urgent'];
        
        $caseData = [
            [
                'name' => 'System Login Issues',
                'description' => 'User unable to access system due to authentication failures. Investigating password validation and session management issues.'
            ],
            [
                'name' => 'Payment Processing Error',
                'description' => 'Transaction failures during payment processing. Payment gateway returning error codes and transactions not completing successfully.'
            ],
            [
                'name' => 'Data Export Request',
                'description' => 'Client requesting bulk data export functionality. Need to implement secure data extraction with proper formatting and delivery method.'
            ],
            [
                'name' => 'Account Access Problem',
                'description' => 'User account locked or suspended. Reviewing account status and implementing account recovery procedures.'
            ],
            [
                'name' => 'Feature Enhancement Request',
                'description' => 'Client requesting new functionality to improve workflow efficiency. Analyzing requirements and feasibility for implementation.'
            ],
            [
                'name' => 'Integration Support Needed',
                'description' => 'Third-party system integration experiencing connectivity issues. Troubleshooting API connections and data synchronization problems.'
            ],
            [
                'name' => 'Performance Issues',
                'description' => 'System experiencing slow response times and performance degradation. Investigating server resources and database optimization needs.'
            ],
            [
                'name' => 'Bug Report - Dashboard',
                'description' => 'Dashboard displaying incorrect data or layout issues. Investigating frontend rendering problems and data calculation errors.'
            ],
            [
                'name' => 'Training Request',
                'description' => 'User requesting additional training on system features. Scheduling training sessions and preparing documentation materials.'
            ],
            [
                'name' => 'License Upgrade Inquiry',
                'description' => 'Client inquiring about upgrading license tier for additional features. Reviewing current usage and upgrade options available.'
            ],
            [
                'name' => 'API Documentation Request',
                'description' => 'Developer requesting comprehensive API documentation. Preparing technical documentation and code examples for integration.'
            ],
            [
                'name' => 'Security Concern',
                'description' => 'Potential security vulnerability reported. Conducting security assessment and implementing necessary patches or updates.'
            ],
            [
                'name' => 'Billing Discrepancy',
                'description' => 'Invoice amount or billing cycle discrepancy reported. Reviewing billing records and usage calculations for accuracy.'
            ],
            [
                'name' => 'User Permission Issues',
                'description' => 'User unable to access certain features due to permission restrictions. Reviewing role assignments and access control settings.'
            ],
            [
                'name' => 'Mobile App Problems',
                'description' => 'Mobile application crashing or not functioning properly. Investigating device compatibility and app performance issues.'
            ],
            [
                'name' => 'Report Generation Error',
                'description' => 'Reports failing to generate or displaying incorrect data. Troubleshooting report queries and data source connections.'
            ],
            [
                'name' => 'Configuration Assistance',
                'description' => 'User needs help configuring system settings for optimal performance. Providing guidance on best practices and setup procedures.'
            ],
            [
                'name' => 'Data Migration Support',
                'description' => 'Assistance needed for migrating data from legacy system. Planning migration strategy and ensuring data integrity during transfer.'
            ],
            [
                'name' => 'Third-party Integration',
                'description' => 'Setting up integration with external service provider. Configuring API connections and testing data flow between systems.'
            ],
            [
                'name' => 'Customization Request',
                'description' => 'Client requesting custom modifications to meet specific business requirements. Analyzing scope and developing customization plan.'
            ],
            [
                'name' => 'Password Reset Issue',
                'description' => 'User unable to reset password through standard process. Investigating password reset functionality and email delivery issues.'
            ],
            [
                'name' => 'Email Notification Problems',
                'description' => 'System notifications not being delivered or delayed. Checking email server configuration and delivery queue status.'
            ],
            [
                'name' => 'Database Connection Error',
                'description' => 'Application losing connection to database intermittently. Investigating network stability and database server performance.'
            ],
            [
                'name' => 'File Upload Failure',
                'description' => 'Users unable to upload files or uploads failing midway. Checking file size limits, server storage, and upload functionality.'
            ],
            [
                'name' => 'Backup and Recovery',
                'description' => 'Data backup process failing or recovery needed from previous backup. Ensuring data protection and recovery procedures are working.'
            ],
            [
                'name' => 'System Maintenance Request',
                'description' => 'Scheduled maintenance required for system updates and optimization. Planning maintenance window and communicating with users.'
            ],
            [
                'name' => 'Network Connectivity Issue',
                'description' => 'Intermittent network connectivity affecting system access. Investigating network infrastructure and connection stability.'
            ],
            [
                'name' => 'Software Update Problem',
                'description' => 'Issues encountered during software update process. Troubleshooting update failures and ensuring system compatibility.'
            ],
            [
                'name' => 'User Interface Bug',
                'description' => 'Interface elements not displaying correctly or behaving unexpectedly. Investigating frontend code and browser compatibility issues.'
            ],
            [
                'name' => 'Compliance Audit Support',
                'description' => 'Assistance needed for compliance audit preparation. Gathering required documentation and ensuring regulatory compliance standards.'
            ]
        ];

        // Static file mapping for specific cases
        $caseFileMap = [
            'Billing Discrepancy' => 'sales/cases/Billing Discrepancy.png',
            'Bug Report - Dashboard' => 'sales/cases/Bug Report - Dashboard.png',
            'Customization Request' => 'sales/cases/Customization Request.png',
            'Email Notification Problems' => 'sales/cases/Email Notification Problems.png',
            'File Upload Failure' => 'sales/cases/File Upload Failure.png',
            'Network Connectivity Issue' => 'sales/cases/Network Connectivity Issue.png',
            'Password Reset Issue' => 'sales/cases/Password Reset Issue.png',
            'Payment Processing Error' => 'sales/cases/Payment Processing Error.png',
            'Report Generation Error' => 'sales/cases/Report Generation Error.png',
            'System Login Issues' => 'sales/cases/System Login Issues.png',
            'User Permission Issues' => 'sales/cases/User Permission Issues.png',
        ];

        for ($i = 0; $i < 30; $i++) {
            // Pick random account first
            $accountId = !empty($accounts) ? $faker->randomElement($accounts) : null;
            
            // Get contacts for this account to maintain relationship integrity
            $accountContacts = [];
            if ($accountId) {
                $accountContacts = SalesContact::where('account_id', $accountId)
                    ->where('created_by', $userId)
                    ->pluck('id')
                    ->toArray();
            }
            
            // Use account-specific contact or random contact as fallback
            $contactId = !empty($accountContacts) ? $faker->randomElement($accountContacts) : 
                        (!empty($contacts) ? $faker->randomElement($contacts) : null);

            $selectedCase = $faker->randomElement($caseData);
            
            // Get attachment path if case has matching file
            $attachment = $caseFileMap[$selectedCase['name']] ?? null;

            $caseNumber = SalesCase::generateCaseNumber($userId);
            SalesCase::create([
                'case_number' => $caseNumber,
                'name' => $selectedCase['name'],
                'status' => $faker->randomElement($statuses),
                'priority' => $faker->randomElement($priorities),
                'description' => $selectedCase['description'],
                'account_id' => $accountId,
                'contact_id' => $contactId,
                'attachment' => $attachment,
                'case_type_id' => !empty($caseTypes) ? $faker->randomElement($caseTypes) : null,
                'assign_user_id' => !empty($users) ? $faker->randomElement($users) : $userId,
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}