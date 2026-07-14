<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesCall;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesCase;
use App\Models\User;
use Faker\Factory as Faker;

class DemoSalesCallSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesCall::where('created_by', $userId)->exists()) {
            return;
        }

        $faker = Faker::create();
        
        $accounts = SalesAccount::where('created_by', $userId)->pluck('id')->toArray();
        $contacts = SalesContact::where('created_by', $userId)->pluck('id')->toArray();
        $opportunities = SalesOpportunity::where('created_by', $userId)->pluck('id')->toArray();
        $cases = SalesCase::where('created_by', $userId)->pluck('id')->toArray();
        $users = User::emp()->where('created_by', $userId)->pluck('id')->toArray();
        
        $statuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        $directions = ['inbound', 'outbound'];
        $parentTypes = ['account', 'contact', 'opportunity', 'case'];
        
        $callData = [
            [
                'name' => 'Initial Discovery Call',
                'description' => 'Discussed client needs, current challenges, and potential solutions. Identified key decision makers and budget parameters.'
            ],
            [
                'name' => 'Product Demo Presentation',
                'description' => 'Demonstrated core product features and capabilities. Addressed technical questions and customization requirements.'
            ],
            [
                'name' => 'Follow-up Discussion',
                'description' => 'Reviewed previous meeting outcomes and next steps. Clarified outstanding questions and timeline expectations.'
            ],
            [
                'name' => 'Contract Negotiation',
                'description' => 'Negotiated terms, pricing, and service level agreements. Discussed implementation timeline and support structure.'
            ],
            [
                'name' => 'Technical Requirements Review',
                'description' => 'Analyzed technical specifications and integration requirements. Confirmed system compatibility and data migration needs.'
            ],
            [
                'name' => 'Pricing Discussion',
                'description' => 'Presented pricing options and package details. Discussed volume discounts and payment terms.'
            ],
            [
                'name' => 'Implementation Planning',
                'description' => 'Outlined implementation phases, milestones, and resource requirements. Assigned project team members and responsibilities.'
            ],
            [
                'name' => 'Support Issue Resolution',
                'description' => 'Addressed technical support ticket and provided resolution steps. Documented issue for future reference.'
            ],
            [
                'name' => 'Renewal Discussion',
                'description' => 'Reviewed contract performance and discussed renewal terms. Explored additional services and expansion opportunities.'
            ],
            [
                'name' => 'Feature Request Review',
                'description' => 'Evaluated new feature requests and development feasibility. Prioritized enhancements based on business impact.'
            ],
            [
                'name' => 'Onboarding Call',
                'description' => 'Welcomed new client and introduced key team members. Outlined onboarding process and initial setup requirements.'
            ],
            [
                'name' => 'Training Session',
                'description' => 'Conducted user training on system features and best practices. Provided documentation and support resources.'
            ],
            [
                'name' => 'Quarterly Check-in',
                'description' => 'Reviewed quarterly performance metrics and client satisfaction. Discussed upcoming initiatives and strategic goals.'
            ],
            [
                'name' => 'Escalation Resolution',
                'description' => 'Addressed escalated concerns with senior management involvement. Developed action plan for issue resolution.'
            ],
            [
                'name' => 'Partnership Discussion',
                'description' => 'Explored strategic partnership opportunities and mutual benefits. Discussed collaboration framework and next steps.'
            ],
            [
                'name' => 'Integration Planning',
                'description' => 'Planned system integration approach and technical requirements. Coordinated with IT teams and third-party vendors.'
            ],
            [
                'name' => 'Feedback Collection',
                'description' => 'Gathered client feedback on service quality and areas for improvement. Documented suggestions for product enhancement.'
            ],
            [
                'name' => 'Strategic Planning',
                'description' => 'Discussed long-term strategic objectives and growth plans. Aligned service offerings with business goals.'
            ],
            [
                'name' => 'Budget Approval',
                'description' => 'Presented budget proposal and justified investment returns. Addressed financial concerns and approval process.'
            ],
            [
                'name' => 'Go-Live Preparation',
                'description' => 'Finalized go-live checklist and deployment schedule. Confirmed readiness and contingency plans.'
            ],
            [
                'name' => 'Security Assessment Call',
                'description' => 'Reviewed security protocols and compliance requirements. Addressed data protection and access control measures.'
            ],
            [
                'name' => 'Performance Review Meeting',
                'description' => 'Analyzed system performance metrics and optimization opportunities. Discussed capacity planning and upgrades.'
            ],
            [
                'name' => 'Compliance Discussion',
                'description' => 'Reviewed regulatory compliance requirements and audit preparations. Ensured adherence to industry standards.'
            ],
            [
                'name' => 'Risk Assessment Call',
                'description' => 'Identified potential risks and mitigation strategies. Developed risk management framework and monitoring procedures.'
            ],
            [
                'name' => 'Project Status Update',
                'description' => 'Provided project progress update and milestone achievements. Addressed any delays or resource constraints.'
            ],
            [
                'name' => 'Vendor Evaluation Call',
                'description' => 'Evaluated vendor capabilities and service offerings. Compared proposals and selection criteria.'
            ],
            [
                'name' => 'Customer Success Review',
                'description' => 'Reviewed customer success metrics and satisfaction scores. Identified opportunities for value enhancement.'
            ],
            [
                'name' => 'Technical Support Call',
                'description' => 'Provided technical assistance and troubleshooting guidance. Resolved system issues and performance problems.'
            ],
            [
                'name' => 'Sales Pipeline Review',
                'description' => 'Analyzed sales pipeline status and opportunity progression. Discussed forecasting and resource allocation.'
            ],
            [
                'name' => 'Account Planning Session',
                'description' => 'Developed account strategy and growth opportunities. Identified key stakeholders and engagement plans.'
            ]
        ];

        for ($i = 0; $i < 35; $i++) {
            $startDate = $faker->dateTimeBetween('-6 months', 'now');
            $endDate = (clone $startDate)->modify('+' . $faker->numberBetween(15, 90) . ' minutes');
            
            $parentType = $faker->randomElement($parentTypes);
            $parentId = null;
            $accountId = null;
            
            // Assign parent and account based on type with proper relationships
            if ($parentType === 'account' && !empty($accounts)) {
                $parentId = $faker->randomElement($accounts);
                $accountId = $parentId; // Same account
            } elseif ($parentType === 'contact' && !empty($contacts)) {
                $contact = SalesContact::find($faker->randomElement($contacts));
                if ($contact) {
                    $parentId = $contact->id;
                    $accountId = $contact->account_id; // Use contact's account
                }
            } elseif ($parentType === 'opportunity' && !empty($opportunities)) {
                $opportunity = SalesOpportunity::find($faker->randomElement($opportunities));
                if ($opportunity) {
                    $parentId = $opportunity->id;
                    $accountId = $opportunity->account_id; // Use opportunity's account
                }
            } elseif ($parentType === 'case' && !empty($cases)) {
                $case = SalesCase::find($faker->randomElement($cases));
                if ($case) {
                    $parentId = $case->id;
                    $accountId = $case->account_id; // Use case's account
                }
            }
            
            // If no account from parent relationship, pick random account
            if (!$accountId && !empty($accounts)) {
                $accountId = $faker->randomElement($accounts);
            }
            
            // Get contacts for the selected account for attendees
            $accountContacts = [];
            if ($accountId) {
                $accountContacts = SalesContact::where('account_id', $accountId)
                    ->where('created_by', $userId)
                    ->pluck('id')
                    ->toArray();
            }

            $selectedCall = $faker->randomElement($callData);
            
            SalesCall::create([
                'name' => $selectedCall['name'],
                'status' => $faker->randomElement($statuses),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'direction' => $faker->randomElement($directions),
                'parent_type' => $parentType,
                'parent_id' => $parentId,
                'account_id' => $accountId,
                'assigned_user_id' => !empty($users) ? $faker->randomElement($users) : $userId,
                'description' => $selectedCall['description'],
                'attendees_users' => !empty($users) ? $faker->randomElements($users, $faker->numberBetween(1, min(3, count($users)))) : [$userId],
                'attendees_contacts' => !empty($accountContacts) ? $faker->randomElements($accountContacts, $faker->numberBetween(0, min(2, count($accountContacts)))) : [],
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}