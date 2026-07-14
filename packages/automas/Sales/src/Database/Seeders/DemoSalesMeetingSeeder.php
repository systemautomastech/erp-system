<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesMeeting;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesCase;
use App\Models\User;
use Faker\Factory as Faker;

class DemoSalesMeetingSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesMeeting::where('created_by', $userId)->exists()) {
            return;
        }

        $faker = Faker::create();
        
        $accounts = SalesAccount::where('created_by', $userId)->pluck('id')->toArray();
        $contacts = SalesContact::where('created_by', $userId)->pluck('id')->toArray();
        $opportunities = SalesOpportunity::where('created_by', $userId)->pluck('id')->toArray();
        $cases = SalesCase::where('created_by', $userId)->pluck('id')->toArray();
        $users = User::emp()->where('created_by', $userId)->pluck('id')->toArray();
        
        $statuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        $meetingTypes = ['online', 'in_person'];
        $parentTypes = ['account', 'contact', 'opportunity', 'case'];

        $meetingData = [
            [
                'name' => 'Project Kickoff Meeting',
                'description' => 'Initial project meeting to introduce team members, review project scope, establish communication protocols, and align on deliverables and timeline.'
            ],
            [
                'name' => 'Weekly Status Review',
                'description' => 'Regular progress review meeting to discuss completed tasks, upcoming milestones, identify blockers, and ensure project stays on track.'
            ],
            [
                'name' => 'Client Requirements Discussion',
                'description' => 'Detailed requirements gathering session to understand client needs, business objectives, and technical specifications for solution design.'
            ],
            [
                'name' => 'Product Demo Session',
                'description' => 'Interactive product demonstration showcasing key features, capabilities, and benefits to potential clients and stakeholders.'
            ],
            [
                'name' => 'Contract Negotiation',
                'description' => 'Formal negotiation meeting to discuss contract terms, pricing, service levels, and finalize agreement details with legal review.'
            ],
            [
                'name' => 'Technical Architecture Review',
                'description' => 'Technical deep-dive session to review system architecture, integration points, scalability considerations, and technology stack decisions.'
            ],
            [
                'name' => 'Budget Planning Meeting',
                'description' => 'Financial planning session to review project costs, resource allocation, budget constraints, and approve funding requirements.'
            ],
            [
                'name' => 'Quarterly Business Review',
                'description' => 'Strategic review meeting to assess business performance, analyze key metrics, discuss growth opportunities, and plan next quarter initiatives.'
            ],
            [
                'name' => 'Implementation Planning',
                'description' => 'Detailed planning session to define implementation phases, resource requirements, timeline, and risk mitigation strategies.'
            ],
            [
                'name' => 'Training Session',
                'description' => 'Educational meeting to provide user training, system orientation, best practices guidance, and hands-on learning opportunities.'
            ],
            [
                'name' => 'Support Case Review',
                'description' => 'Support team meeting to review open cases, discuss resolution strategies, escalation procedures, and improve service quality.'
            ],
            [
                'name' => 'Sales Pipeline Discussion',
                'description' => 'Sales team meeting to review pipeline status, opportunity progression, forecast accuracy, and strategic account planning.'
            ],
            [
                'name' => 'Market Analysis Presentation',
                'description' => 'Strategic presentation covering market trends, competitive landscape, customer insights, and business opportunity analysis.'
            ],
            [
                'name' => 'Strategic Planning Session',
                'description' => 'High-level planning meeting to define long-term strategy, set business objectives, allocate resources, and establish success metrics.'
            ],
            [
                'name' => 'Performance Review Meeting',
                'description' => 'Performance evaluation session to review individual and team achievements, identify improvement areas, and set development goals.'
            ],
            [
                'name' => 'Customer Feedback Session',
                'description' => 'Client feedback meeting to gather satisfaction insights, discuss service improvements, and strengthen customer relationships.'
            ],
            [
                'name' => 'Risk Assessment Discussion',
                'description' => 'Risk management meeting to identify potential threats, assess impact levels, develop mitigation plans, and establish monitoring procedures.'
            ],
            [
                'name' => 'Compliance Review',
                'description' => 'Regulatory compliance meeting to review audit requirements, ensure policy adherence, and address compliance gaps or concerns.'
            ],
            [
                'name' => 'Integration Planning',
                'description' => 'Technical planning session to design system integrations, define data flows, establish connectivity requirements, and test procedures.'
            ],
            [
                'name' => 'Go-Live Preparation',
                'description' => 'Pre-deployment meeting to finalize go-live checklist, confirm readiness criteria, coordinate launch activities, and establish support procedures.'
            ],
            [
                'name' => 'Vendor Selection Meeting',
                'description' => 'Procurement meeting to evaluate vendor proposals, compare capabilities and costs, and make supplier selection decisions.'
            ],
            [
                'name' => 'Security Assessment Review',
                'description' => 'Security evaluation meeting to review vulnerability assessments, discuss security measures, and implement protection strategies.'
            ],
            [
                'name' => 'Change Management Discussion',
                'description' => 'Organizational change meeting to plan change initiatives, address resistance, communicate benefits, and ensure smooth transitions.'
            ],
            [
                'name' => 'Quality Assurance Review',
                'description' => 'Quality control meeting to review testing results, discuss quality standards, identify improvement opportunities, and ensure deliverable quality.'
            ],
            [
                'name' => 'User Acceptance Testing',
                'description' => 'Testing coordination meeting to plan UAT activities, define acceptance criteria, schedule testing phases, and review test results.'
            ],
            [
                'name' => 'Post-Implementation Review',
                'description' => 'Project retrospective meeting to evaluate implementation success, identify lessons learned, and document best practices for future projects.'
            ],
            [
                'name' => 'Stakeholder Alignment Meeting',
                'description' => 'Stakeholder coordination session to ensure alignment on objectives, resolve conflicts, communicate updates, and maintain engagement.'
            ],
            [
                'name' => 'Resource Planning Session',
                'description' => 'Resource management meeting to assess capacity, allocate personnel, plan skill development, and optimize resource utilization.'
            ],
            [
                'name' => 'Technology Roadmap Review',
                'description' => 'Technology strategy meeting to review roadmap progress, evaluate emerging technologies, and plan future technology investments.'
            ],
            [
                'name' => 'Partnership Discussion',
                'description' => 'Strategic partnership meeting to explore collaboration opportunities, define partnership terms, and establish mutual benefit frameworks.'
            ]
        ];

        for ($i = 0; $i < 30; $i++) {
            $startDate = $faker->dateTimeBetween('-6 months', 'now');
            $endDate = (clone $startDate)->modify('+' . $faker->numberBetween(30, 180) . ' minutes');
            
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

            $selectedMeeting = $faker->randomElement($meetingData);

            SalesMeeting::create([
                'name' => $selectedMeeting['name'],
                'status' => $faker->randomElement($statuses),
                'meeting_type' => $faker->randomElement($meetingTypes),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'parent_type' => $parentType,
                'parent_id' => $parentId,
                'account_id' => $accountId,
                'assigned_user_id' => !empty($users) ? $faker->randomElement($users) : null,
                'description' => $selectedMeeting['description'],
                'attendees_users' => !empty($users) ? $faker->randomElements($users, $faker->numberBetween(1, min(4, count($users)))) : [$userId],
                'attendees_contacts' => !empty($accountContacts) ? $faker->randomElements($accountContacts, $faker->numberBetween(0, min(3, count($accountContacts)))) : [],
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}