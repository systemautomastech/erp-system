<?php

namespace Automas\Lead\Http\Controllers;

use App\Models\User;
use Automas\Lead\Models\ClientDeal;
use Automas\Lead\Models\Deal;
use Automas\Lead\Models\DealCall;
use Automas\Lead\Models\DealStage;
use Automas\Lead\Models\DealTask;
use Automas\Lead\Models\Lead;
use Automas\Lead\Models\LeadCall;
use Automas\Lead\Models\LeadTask;
use Automas\Lead\Models\Pipeline;
use Automas\Lead\Models\UserDeal;
use Automas\Lead\Models\UserLead;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->can('manage-crm-dashboard')) {
            $user = Auth::user();

            if ($user->type == 'client') {
                return $this->clientDashboard($request);
            }

            if ($user->type != 'company') {
                return $this->userDashboard($request);
            }

            $deal = Deal::where('created_by', creatorId());
            $lead = Lead::where('created_by', creatorId());

            // Deal stats
            $todayDeals = (clone $deal)->whereDate('created_at', now()->toDateString())->count();
            $yesterdayDeals = (clone $deal)->whereDate('created_at', now()->subDay()->toDateString())->count();
            $monthlyDeals = (clone $deal)->whereMonth('created_at', now()->month)->count();
            $totalDeals = (clone $deal)->count();

            // Leads stats
            $leads = Lead::where('created_by', creatorId())->with('calls');
            $todayLeads = (clone $leads)->whereDate('created_at', now()->toDateString())->count();
            $yesterdayLeads = (clone $leads)->whereDate('created_at', now()->subDay()->toDateString())->count();
            $monthlyLeads = (clone $leads)->whereMonth('created_at', now()->month)->count();
            $totalLeads = (clone $leads)->count();

            // Call stats
            $dealCalls = DealCall::whereHas('deal', function ($q) {
                $q->where('created_by', creatorId());
            });
            $leadCalls = LeadCall::whereHas('lead', function ($q) {
                $q->where('created_by', creatorId());
            });

            $todayCalls = (clone $dealCalls)->whereDate('created_at', today())->count() + (clone $leadCalls)->whereDate('created_at', today())->count();
            $yesterdayCalls = (clone $dealCalls)->whereDate('created_at', today()->subDay())->count() + (clone $leadCalls)->whereDate('created_at', today()->subDay())->count();
            $monthlyCalls = (clone $dealCalls)->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count() + (clone $leadCalls)->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();
            $totalCalls = (clone $dealCalls)->count() + (clone $leadCalls)->count();

            // Recent deals
            $recentDeals = $deal
                ->with('stage')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            // Recent leads
            $recentLeads = $lead
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'subject', 'created_at']);

            // Calendar events from deal tasks and lead tasks
            $calendarEvents = [];

            if ($user->type == 'company') {
                // Deal tasks
                $deals = $deal->with('tasks')->get();
                foreach ($deals as $dealItem) {
                    foreach ($dealItem->tasks as $task) {
                        $calendarEvents[] = [
                            'id' => 'deal_' . $task->id,
                            'title' => $task->name,
                            'startDate' => $task->date->format('Y-m-d'),
                            'endDate' => $task->date->format('Y-m-d'),
                            'time' => $task->time ? $task->time->format('H:i') : '09:00',
                            'status' => $task->status ? 'completed' : 'pending',
                            'name' => $dealItem->name,
                            'color' => $task->status ? '#10b981' : '#f59e0b',
                            'type' => 'Deal Task',
                        ];
                    }
                }

                // Lead tasks
                $leads = $lead->with('tasks')->get();
                foreach ($leads as $leadItem) {
                    foreach ($leadItem->tasks as $task) {
                        $calendarEvents[] = [
                            'id' => 'lead_' . $task->id,
                            'title' => $task->name,
                            'startDate' => $task->date->format('Y-m-d'),
                            'endDate' => $task->date->format('Y-m-d'),
                            'time' => $task->time ? $task->time->format('H:i') : '09:00',
                            'status' => $task->status ? 'completed' : 'pending',
                            'name' => $leadItem->name,
                            'color' => $task->status ? '#10b981' : '#3b82f6',
                            'type' => 'Lead Task',
                        ];
                    }
                }
            } elseif ($user->type == 'client') {
                $clientDeals = ClientDeal::where('client_id', $user->id)->with('deal.tasks')->get();
                foreach ($clientDeals as $clientDeal) {
                    foreach ($clientDeal->deal->tasks as $task) {
                        $calendarEvents[] = [
                            'id' => 'deal_' . $task->id,
                            'title' => $task->name,
                            'startDate' => $task->date->format('Y-m-d'),
                            'endDate' => $task->date->format('Y-m-d'),
                            'time' => $task->time ? $task->time->format('H:i') : '09:00',
                            'status' => $task->status ? 'completed' : 'pending',
                            'name' => $clientDeal->deal->name,
                            'color' => $task->status ? '#10b981' : '#f59e0b',
                            'type' => 'Deal Task',
                        ];
                    }
                }
            } else {
                // User deal tasks
                $userDeals = UserDeal::where('user_id', $user->id)->with('deal.tasks')->get();
                foreach ($userDeals as $userDeal) {
                    foreach ($userDeal->deal->tasks as $task) {
                        $calendarEvents[] = [
                            'id' => 'deal_' . $task->id,
                            'title' => $task->name,
                            'startDate' => $task->date->format('Y-m-d'),
                            'endDate' => $task->date->format('Y-m-d'),
                            'time' => $task->time ? $task->time->format('H:i') : '09:00',
                            'status' => $task->status ? 'completed' : 'pending',
                            'name' => $userDeal->deal->name,
                            'color' => $task->status ? '#10b981' : '#f59e0b',
                            'type' => 'Deal Task',
                        ];
                    }
                }

                // User lead tasks
                $userLeads = UserLead::where('user_id', $user->id)->with('lead.tasks')->get();
                foreach ($userLeads as $userLead) {
                    foreach ($userLead->lead->tasks as $task) {
                        $calendarEvents[] = [
                            'id' => 'lead_' . $task->id,
                            'title' => $task->name,
                            'startDate' => $task->date->format('Y-m-d'),
                            'endDate' => $task->date->format('Y-m-d'),
                            'time' => $task->time ? $task->time->format('H:i') : '09:00',
                            'status' => $task->status ? 'completed' : 'pending',
                            'name' => $userLead->lead->name,
                            'color' => $task->status ? '#10b981' : '#3b82f6',
                            'type' => 'Lead Task',
                        ];
                    }
                }
            }

            // Deal and Lead calls pie chart data
            $dealCallsChart = [];

            $totalDealCalls = DealCall::where('user_id', creatorId())->count();
            $totalLeadCalls = LeadCall::where('user_id', creatorId())->count();

            if ($totalDealCalls > 0) {
                $dealCallsChart[] = [
                    'name' => 'Deal Calls',
                    'value' => $totalDealCalls,
                ];
            }

            if ($totalLeadCalls > 0) {
                $dealCallsChart[] = [
                    'name' => 'Lead Calls',
                    'value' => $totalLeadCalls,
                ];
            }

            // Deals by stage chart data
            $pipelineId = $request->get('pipeline_id');
            $dealStageChart = [];
            $dealStages = DealStage::where('created_by', creatorId())
                ->when($pipelineId, fn($q) => $q->where('pipeline_id', $pipelineId))
                ->orderBy('order', 'ASC')
                ->get();

            foreach ($dealStages as $stage) {
                $dealCount = $deal
                    ->where('stage_id', $stage->id)
                    ->count();

                $dealStageChart[] = [
                    'name' => $stage->name,
                    'deals' => $dealCount,
                ];
            }

            $pipelines = Pipeline::where('created_by', creatorId())->get(['id', 'name']);

            return Inertia::render('Lead/Dashboard/CompanyDashboard', [
                'stats' => [
                    'todayDeals' => $todayDeals,
                    'yesterdayDeals' => $yesterdayDeals,
                    'monthDeals' => $monthlyDeals,
                    'totalDeals' => $totalDeals,

                    'todayLeads' => $todayLeads,
                    'yesterdayLeads' => $yesterdayLeads,
                    'monthLeads' => $monthlyLeads,
                    'totalLeads' => $totalLeads,

                    'todayCalls' => $todayCalls,
                    'yesterdayCalls' => $yesterdayCalls,
                    'monthCalls' => $monthlyCalls,
                    'totalCalls' => $totalCalls,
                ],

                'recentDeals' => $recentDeals,
                'recentLeads' => $recentLeads,
                'calendarEvents' => $calendarEvents,
                'dealCallsChart' => $dealCallsChart,
                'dealStageChart' => $dealStageChart,
                'pipelines' => $pipelines,
                'message' => __('Lead Dashboard - Manage your leads and deals efficiently.'),
            ]);
        }

        return back()->with('error', __('Permission denied'));
    }

    private function clientDashboard(Request $request)
    {
        $user = Auth::user();

        // Get assigned deals for client
        $assignedDealIds = ClientDeal::where('client_id', $user->id)->pluck('deal_id');
        $deals = Deal::whereIn('id', $assignedDealIds);

        // Get all stats from deals
        $totalDeals = $deals->count();
        $activeDealCount = $deals->where('status', 'Active')->count();
        $wonDealCount = $deals->where('status', 'Won')->count();
        $lossDealCount = $deals->where('status', 'Loss')->count();
        $totalDealValue = $deals->sum('price');

        // Recent deals assigned to client
        $recentDeals = $deals->with('stage')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Deal status chart
        $dealStatusChart = [
            ['name' => 'Active', 'value' => $activeDealCount],
            ['name' => 'Won', 'value' => $wonDealCount],
            ['name' => 'Loss', 'value' => $lossDealCount],
        ];

        // Calendar events from assigned deal tasks and lead tasks
        $calendarEvents = [];
        $clientDeals = ClientDeal::where('client_id', $user->id)->with('deal.tasks')->get();
        foreach ($clientDeals as $clientDeal) {
            foreach ($clientDeal->deal->tasks as $task) {
                $calendarEvents[] = [
                    'id' => 'deal_' . $task->id,
                    'title' => $task->name,
                    'startDate' => $task->date->format('Y-m-d'),
                    'endDate' => $task->date->format('Y-m-d'),
                    'time' => $task->time ? $task->time->format('H:i') : '09:00',
                    'status' => $task->status ? 'completed' : 'pending',
                    'name' => $clientDeal->deal->name,
                    'color' => $task->status ? '#10b981' : '#f59e0b',
                    'type' => 'Deal Task',
                ];
            }
        }

        return Inertia::render('Lead/Dashboard/ClientDashboard', [
            'stats' => [
                'total_deals' => $totalDeals,
                'active_deals' => $activeDealCount,
                'won_deals' => $wonDealCount,
                'total_value' => $totalDealValue,
            ],
            'recentDeals' => $recentDeals,
            'calendarEvents' => $calendarEvents,
            'dealStatusChart' => $dealStatusChart,
            'message' => __('Client Dashboard - View your assigned deals.'),
        ]);
    }

    private function userDashboard(Request $request)
    {
        $user = Auth::user();

        // leads, deals, calls

        // Get assigned deals and leads for user
        $assignedDealIds = UserDeal::where('user_id', $user->id)->pluck('deal_id');
        $assignedLeadIds = UserLead::where('user_id', $user->id)->pluck('lead_id');

        // Lead stats (assigned to user)
        $assignedLeads = Lead::whereIn('id', $assignedLeadIds);
        $todayLeads = (clone $assignedLeads)->whereDate('created_at', now()->toDateString())->count();
        $yesterdayLeads = (clone $assignedLeads)->whereDate('created_at', now()->subDay()->toDateString())->count();
        $monthlyLeads = (clone $assignedLeads)->whereMonth('created_at', now()->month)->count();
        $totalLeads = (clone $assignedLeads)->count();

        // Deal stats (assigned to user)
        $assignedDeals = Deal::whereIn('id', $assignedDealIds);
        $convertedDeals = (clone $assignedLeads)->where('is_converted', '>', 0)->count();
        $activeDeals = (clone $assignedDeals)->where('status', 'Active')->count();
        $wonDeals = (clone $assignedDeals)->where('status', 'Won')->count();
        $lostDeals = (clone $assignedDeals)->where('status', 'Loss')->count();

        // Call stats (calls for assigned deals/leads or created by user)
        $dealCalls = DealCall::whereIn('deal_id', $assignedDealIds);
        $leadCalls = LeadCall::whereIn('lead_id', $assignedLeadIds);
        $todayCalls = (clone $dealCalls)->whereDate('created_at', today())->count() + (clone $leadCalls)->whereDate('created_at', today())->count();
        $yesterdayCalls = (clone $dealCalls)->whereDate('created_at', today()->subDay())->count() + (clone $leadCalls)->whereDate('created_at', today()->subDay())->count();
        $monthlyCalls = (clone $dealCalls)->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count() + (clone $leadCalls)->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();
        $totalCalls = (clone $dealCalls)->count() + (clone $leadCalls)->count();

        // Task statistics
        $completedTasks = DealTask::whereIn('deal_id', $assignedDealIds)
            ->where('status', 1)->count() +
            LeadTask::whereIn('lead_id', $assignedLeadIds)
                ->where('status', 1)->count();

        $pendingTasks = DealTask::whereIn('deal_id', $assignedDealIds)
            ->where('status', 0)->count() +
            LeadTask::whereIn('lead_id', $assignedLeadIds)
                ->where('status', 0)->count();

        // Recent assigned deals
        $recentDeals = Deal::whereIn('id', $assignedDealIds)
            ->with('stage')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Recent assigned leads
        $recentLeads = Lead::whereIn('id', $assignedLeadIds)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'subject', 'created_at']);

        // Calendar events from assigned tasks
        $calendarEvents = [];

        // Deal tasks
        $userDeals = UserDeal::where('user_id', $user->id)->with('deal.tasks')->get();
        foreach ($userDeals as $userDeal) {
            foreach ($userDeal->deal->tasks as $task) {
                $calendarEvents[] = [
                    'id' => 'deal_' . $task->id,
                    'title' => $task->name,
                    'startDate' => $task->date->format('Y-m-d'),
                    'endDate' => $task->date->format('Y-m-d'),
                    'time' => $task->time ? $task->time->format('H:i') : '09:00',
                    'status' => $task->status ? 'completed' : 'pending',
                    'name' => $userDeal->deal->name,
                    'color' => $task->status ? '#10b981' : '#f59e0b',
                    'type' => 'Deal Task',
                ];
            }
        }

        // Lead tasks
        $userLeads = UserLead::where('user_id', $user->id)->with('lead.tasks')->get();
        foreach ($userLeads as $userLead) {
            foreach ($userLead->lead->tasks as $task) {
                $calendarEvents[] = [
                    'id' => 'lead_' . $task->id,
                    'title' => $task->name,
                    'startDate' => $task->date->format('Y-m-d'),
                    'endDate' => $task->date->format('Y-m-d'),
                    'time' => $task->time ? $task->time->format('H:i') : '09:00',
                    'status' => $task->status ? 'completed' : 'pending',
                    'name' => $userLead->lead->name,
                    'color' => $task->status ? '#10b981' : '#3b82f6',
                    'type' => 'Lead Task',
                ];
            }
        }

        // Total amount from assigned deals
        $totalAmount = Deal::whereIn('id', $assignedDealIds)->sum('price');

        // Task status chart
        $taskStatusChart = [
            ['name' => 'Completed', 'value' => $completedTasks],
            ['name' => 'Pending', 'value' => $pendingTasks],
        ];

        return Inertia::render('Lead/Dashboard/UserDashboard', [
            'stats' => [
                'todayLeads' => $todayLeads,
                'yesterdayLeads' => $yesterdayLeads,
                'monthlyLeads' => $monthlyLeads,
                'totalLeads' => $totalLeads,

                'convertedDeals' => $convertedDeals,
                'activeDeals' => $activeDeals,
                'wonDeals' => $wonDeals,
                'lostDeals' => $lostDeals,

                'todayCalls' => $todayCalls,
                'yesterdayCalls' => $yesterdayCalls,
                'monthlyCalls' => $monthlyCalls,
                'totalCalls' => $totalCalls,
            ],
            'recentDeals' => $recentDeals,
            'recentLeads' => $recentLeads,
            'calendarEvents' => $calendarEvents,
            'taskStatusChart' => $taskStatusChart,
            'message' => __('User Dashboard - View your assigned leads and deals.'),
        ]);
    }
}
