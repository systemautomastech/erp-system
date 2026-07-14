<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesDocument;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesDocumentFolder;
use Automas\Sales\Models\SalesDocumentType;
use Automas\Sales\Models\SalesOpportunity;
use App\Models\User;
use Faker\Factory as Faker;

class DemoSalesDocumentSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesDocument::where('created_by', $userId)->exists()) {
            return;
        }

        $faker = Faker::create();

        $accounts = SalesAccount::where('created_by', $userId)->pluck('id')->toArray();
        $folders = SalesDocumentFolder::where('created_by', $userId)->pluck('id')->toArray();
        $types = SalesDocumentType::where('created_by', $userId)->pluck('id')->toArray();
        $opportunities = SalesOpportunity::where('created_by', $userId)->pluck('id')->toArray();
        $users = User::emp()->where('created_by', $userId)->pluck('id')->toArray();

        $statuses = ['active', 'draft', 'expired', 'cancelled'];

        $documentData = [
            [
                'name' => 'Project Proposal Document',
                'description' => 'Comprehensive project proposal outlining objectives, scope, deliverables, timeline, and resource requirements for client approval.'
            ],
            [
                'name' => 'Technical Specification',
                'description' => 'Detailed technical requirements and specifications for system architecture, functionality, and integration capabilities.'
            ],
            [
                'name' => 'Contract Agreement',
                'description' => 'Legal contract document defining terms, conditions, responsibilities, and obligations for both parties in the business relationship.'
            ],
            [
                'name' => 'Service Level Agreement',
                'description' => 'Formal agreement specifying service standards, performance metrics, availability requirements, and support commitments.'
            ],
            [
                'name' => 'Implementation Plan',
                'description' => 'Step-by-step implementation roadmap including phases, milestones, dependencies, and resource allocation for project execution.'
            ],
            [
                'name' => 'User Manual Guide',
                'description' => 'Comprehensive user documentation providing instructions, tutorials, and best practices for system operation and features.'
            ],
            [
                'name' => 'Training Materials',
                'description' => 'Educational content including presentations, exercises, and reference materials for user training and skill development.'
            ],
            [
                'name' => 'System Requirements',
                'description' => 'Technical and functional requirements document specifying hardware, software, and infrastructure needs for system deployment.'
            ],
            [
                'name' => 'Budget Breakdown',
                'description' => 'Detailed financial analysis including cost estimates, resource allocation, and budget distribution across project components.'
            ],
            [
                'name' => 'Timeline Schedule',
                'description' => 'Project timeline with key milestones, deliverable dates, critical path analysis, and resource scheduling information.'
            ],
            [
                'name' => 'Risk Assessment Report',
                'description' => 'Comprehensive risk analysis identifying potential threats, impact assessment, and mitigation strategies for project success.'
            ],
            [
                'name' => 'Compliance Documentation',
                'description' => 'Regulatory compliance documentation ensuring adherence to industry standards, legal requirements, and audit procedures.'
            ],
            [
                'name' => 'Integration Specifications',
                'description' => 'Technical documentation for system integration including API specifications, data mapping, and connectivity requirements.'
            ],
            [
                'name' => 'Testing Procedures',
                'description' => 'Quality assurance testing protocols including test cases, acceptance criteria, and validation procedures for system verification.'
            ],
            [
                'name' => 'Deployment Checklist',
                'description' => 'Pre-deployment verification checklist ensuring all requirements are met before system go-live and production release.'
            ],
            [
                'name' => 'Security Guidelines',
                'description' => 'Security policies and procedures document outlining access controls, data protection, and cybersecurity best practices.'
            ],
            [
                'name' => 'Performance Metrics',
                'description' => 'Key performance indicators and measurement criteria for monitoring system performance and business outcomes.'
            ],
            [
                'name' => 'Maintenance Plan',
                'description' => 'Ongoing maintenance strategy including scheduled updates, monitoring procedures, and support protocols for system upkeep.'
            ],
            [
                'name' => 'Support Documentation',
                'description' => 'Technical support procedures including troubleshooting guides, escalation processes, and customer service protocols.'
            ],
            [
                'name' => 'Quality Assurance Plan',
                'description' => 'Quality management framework defining standards, review processes, and continuous improvement methodologies.'
            ],
            [
                'name' => 'Business Case Document',
                'description' => 'Strategic business justification including ROI analysis, benefits realization, and investment rationale for project approval.'
            ],
            [
                'name' => 'Architecture Design',
                'description' => 'System architecture blueprint showing component relationships, data flow, and technical infrastructure design patterns.'
            ],
            [
                'name' => 'Data Migration Plan',
                'description' => 'Data transfer strategy including mapping procedures, validation rules, and migration timeline for legacy system transition.'
            ],
            [
                'name' => 'Backup and Recovery Plan',
                'description' => 'Disaster recovery procedures including backup schedules, restoration processes, and business continuity protocols.'
            ],
            [
                'name' => 'Change Management Guide',
                'description' => 'Organizational change management strategy including communication plans, training programs, and adoption methodologies.'
            ],
            [
                'name' => 'Vendor Evaluation Report',
                'description' => 'Comprehensive vendor assessment including capability analysis, cost comparison, and recommendation for supplier selection.'
            ],
            [
                'name' => 'Cost-Benefit Analysis',
                'description' => 'Financial evaluation comparing project costs against expected benefits, ROI calculations, and payback period analysis.'
            ],
            [
                'name' => 'Project Charter',
                'description' => 'Project authorization document defining scope, objectives, stakeholders, and high-level requirements for project initiation.'
            ],
            [
                'name' => 'Stakeholder Analysis',
                'description' => 'Stakeholder identification and engagement strategy including influence mapping, communication preferences, and management approach.'
            ],
            [
                'name' => 'Communication Plan',
                'description' => 'Project communication strategy defining channels, frequency, audiences, and messaging protocols for effective information sharing.'
            ]
        ];

        // Static file mapping for specific documents
        $documentFileMap = [
            'Project Proposal Document' => 'sales/documents/Project Proposal Document.png',
            'Technical Specification' => 'sales/documents/Technical Specification.png',
            'Contract Agreement' => 'sales/documents/Contract Agreement.png',
            'Service Level Agreement' => 'sales/documents/Service Level Agreement.png',
            'Implementation Plan' => 'sales/documents/Implementation Plan.png',
            'User Manual Guide' => 'sales/documents/User Manual Guide.jpg',
            'Training Materials' => 'sales/documents/Training Materials.png',
            'System Requirements' => 'sales/documents/System Requirements.png',
            'Budget Breakdown' => 'sales/documents/Budget Breakdown.png',
            'Timeline Schedule' => 'sales/documents/Timeline Schedule.png',
        ];

        for ($i = 0; $i < 25; $i++) {
            // Pick random account first
            $accountId = !empty($accounts) ? $faker->randomElement($accounts) : null;

            // Get opportunities for this account to maintain relationship integrity
            $accountOpportunities = [];
            if ($accountId) {
                $accountOpportunities = SalesOpportunity::where('account_id', $accountId)
                    ->where('created_by', $userId)
                    ->pluck('id')
                    ->toArray();
            }

            // Use account-specific opportunity or random opportunity as fallback
            $opportunityId = !empty($accountOpportunities) ? $faker->randomElement($accountOpportunities) : (!empty($opportunities) ? $faker->optional(0.6)->randomElement($opportunities) : null);

            $selectedDocument = $faker->randomElement($documentData);

            // Get attachment path if document has matching file
            $attachment = $documentFileMap[$selectedDocument['name']] ?? null;

            SalesDocument::create([
                'name' => $selectedDocument['name'],
                'account_id' => $accountId,
                'folder_id' => !empty($folders) ? $faker->randomElement($folders) : null,
                'type_id' => !empty($types) ? $faker->randomElement($types) : null,
                'opportunity_id' => $opportunityId,
                'status' => $faker->randomElement($statuses),
                'publish_date' => $faker->optional(0.7)->dateTimeBetween('-6 months', 'now'),
                'expiration_date' => $faker->optional(0.5)->dateTimeBetween('now', '+6 months'),
                'assign_user_id' => !empty($users) ? $faker->randomElement($users) : $userId,
                'description' => $selectedDocument['description'],
                'attachment' => $attachment,
                'is_active' => $faker->boolean(85),
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}
