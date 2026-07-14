<?php

namespace Automas\Sales\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Automas\Sales\Models\SalesQuote;
use Automas\Sales\Models\SalesOrder;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesOpportunityStage;
use Automas\Sales\Models\SalesCall;
use Automas\Sales\Models\SalesMeeting;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if(Auth::user()->can('manage-sales-dashboard')){
            $user = Auth::user();
            
            if ($user->type == 'company') {
                return $this->companyDashboard($request);
            }
            
            return $this->userDashboard($request);
        }
        return back()->with('error', __('Permission denied'));
    }

    private function companyDashboard(Request $request)
    {
        $creatorId = creatorId();

        // Key Metrics
        $totalQuotes = SalesQuote::where('created_by', $creatorId)->count();
        $totalOrders = SalesOrder::where('created_by', $creatorId)->count();
        $totalOpportunities = SalesOpportunity::where('created_by', $creatorId)->count();
        $activeOpportunities = SalesOpportunity::where('created_by', $creatorId)->where('is_active', true)->count();

        // Revenue calculations
        $totalRevenue = SalesOrder::where('sales_orders.created_by', $creatorId)
            ->whereIn('sales_orders.status', ['confirmed', 'delivered', 'completed'])
            ->join('sales_order_items', 'sales_orders.id', '=', 'sales_order_items.order_id')
            ->whereNotNull('sales_order_items.final_price')
            ->sum('sales_order_items.final_price') ?? 0;

        $pipelineValue = SalesOpportunity::where('created_by', $creatorId)
            ->where('is_active', true)
            ->sum('amount');

        // Conversion rate
        $convertedQuotes = SalesQuote::where('created_by', $creatorId)->where('is_converted', true)->count();
        $conversionRate = $totalQuotes > 0 ? round(($convertedQuotes / $totalQuotes) * 100, 1) : 0;

        // Recent data
        $recentQuotes = SalesQuote::where('created_by', $creatorId)
            ->with(['account', 'opportunity', 'assignUser'])
            ->latest()
            ->take(5)
            ->get();

        $recentOrders = SalesOrder::where('created_by', $creatorId)
            ->with(['account', 'opportunity', 'assignUser'])
            ->latest()
            ->take(5)
            ->get();

        $topOpportunities = SalesOpportunity::where('created_by', $creatorId)
            ->where('is_active', true)
            ->with(['account', 'stage', 'assignUser'])
            ->orderBy('amount', 'desc')
            ->take(5)
            ->get();

        // Opportunities by Stage Chart
        $opportunityStages = SalesOpportunityStage::where('created_by', $creatorId)
            ->withCount(['opportunities' => function ($query) use ($creatorId) {
                $query->where('created_by', $creatorId)->where('is_active', true);
            }])
            ->get()
            ->map(function ($stage) {
                return [
                    'name' => $stage->name,
                    'value' => $stage->opportunities_count,
                    'color' => $stage->color ?? '#3b82f6'
                ];
            });

        // Monthly Sales Trend (last 6 months)
        $salesTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthlyOrders = SalesOrder::where('created_by', $creatorId)
                ->whereYear('order_date', $month->year)
                ->whereMonth('order_date', $month->month)
                ->count();

            $monthlyRevenue = SalesOrder::where('created_by', $creatorId)
                ->whereIn('status', ['confirmed', 'delivered', 'completed'])
                ->whereYear('order_date', $month->year)
                ->whereMonth('order_date', $month->month)
                ->with('items')
                ->get()
                ->sum(function ($order) {
                    return $order->items->sum('final_price');
                });

            $salesTrend[] = [
                'month' => $month->format('M Y'),
                'orders' => $monthlyOrders,
                'revenue' => (float) $monthlyRevenue
            ];
        }

        // Calendar events from calls and meetings
        $calendarEvents = [];

        // Get calls
        $calls = SalesCall::where('created_by', $creatorId)->with(['account', 'assignedUser'])->get();

        foreach ($calls as $call) {
            $date = $call->start_date ? $call->start_date->format('Y-m-d') : now()->format('Y-m-d');
            $time = $call->start_date ? $call->start_date->format('H:i') : '09:00';

            $calendarEvents[] = [
                'id' => 'call_' . $call->id,
                'title' => ($call->name ?? 'Sales Call'),
                'startDate' => $date,
                'endDate' => $date,
                'time' => $time,
                'status' => $call->status ?? 'scheduled',
                'name' => ($call->name ?? 'Sales Call'),
                'type' => 'call',
                'color' => '#3b82f6',
                'start_date' => $call->start_date,
                'end_date' => $call->end_date,
                'direction' => $call->direction,
                'description' => $call->description,
                'account' => $call->account,
                'assigned_user' => $call->assignedUser
            ];
        }

        // Get meetings
        $meetings = SalesMeeting::where('created_by', $creatorId)->with(['account', 'assignedUser'])->get();

        foreach ($meetings as $meeting) {
            $date = $meeting->start_date ? $meeting->start_date->format('Y-m-d') : now()->format('Y-m-d');
            $time = $meeting->start_date ? $meeting->start_date->format('H:i') : '09:00';

            $calendarEvents[] = [
                'id' => 'meeting_' . $meeting->id,
                'title' => ($meeting->name ?? 'Sales Meeting'),
                'startDate' => $date,
                'endDate' => $date,
                'time' => $time,
                'status' => $meeting->status ?? 'scheduled',
                'name' => ($meeting->name ?? 'Sales Meeting'),
                'type' => 'meeting',
                'color' => '#10b981',
                'start_date' => $meeting->start_date,
                'end_date' => $meeting->end_date,
                'meeting_type' => $meeting->meeting_type,
                'description' => $meeting->description,
                'account' => $meeting->account,
                'assigned_user' => $meeting->assignedUser
            ];
        }

        // Revenue by User (top 10)
        $revenueByUser = SalesOrder::where('created_by', $creatorId)
            ->whereIn('status', ['confirmed', 'delivered', 'completed'])
            ->whereNotNull('assign_user_id')
            ->with(['assignUser', 'items'])
            ->get()
            ->groupBy('assign_user_id')
            ->map(function ($orders, $userId) {
                $user = $orders->first()->assignUser;
                $revenue = $orders->sum(function ($order) {
                    return $order->items->sum('final_price');
                });
                return [
                    'name' => $user ? $user->name : 'Unassigned',
                    'value' => (float) $revenue
                ];
            })
            ->sortByDesc('value')
            ->take(10)
            ->values();
            

        // Orders by User (top 10)
        $ordersByUser = SalesOrder::where('created_by', $creatorId)
            ->whereNotNull('assign_user_id')
            ->with('assignUser')
            ->get()
            ->groupBy('assign_user_id')
            ->map(function ($orders, $userId) {
                $user = $orders->first()->assignUser;
                return [
                    'name' => $user ? $user->name : 'Unassigned',
                    'value' => $orders->count()
                ];
            })
            ->sortByDesc('value')
            ->take(10)
            ->values();

        return Inertia::render('Sales/Dashboard/CompanyDashboard', [
            'stats' => [
                'total_quotes' => $totalQuotes,
                'total_orders' => $totalOrders,
                'total_opportunities' => $totalOpportunities,
                'active_opportunities' => $activeOpportunities,
                'total_revenue' => (float) $totalRevenue,
                'pipeline_value' => (float) $pipelineValue,
                'conversion_rate' => $conversionRate,
                'converted_quotes' => $convertedQuotes
            ],
            'recent_quotes' => $recentQuotes,
            'recent_orders' => $recentOrders,
            'top_opportunities' => $topOpportunities,
            'charts' => [
                'opportunity_stages' => $opportunityStages,
                'sales_trend' => $salesTrend,
                'revenue_by_user' => $revenueByUser,
                'orders_by_user' => $ordersByUser
            ],
            'calendar_events' => $calendarEvents,
            'message' => __('Sales Dashboard - Manage your sales activities efficiently.')
        ]);
    }
    
    private function userDashboard(Request $request)
    {
        $user = Auth::user();
        $creatorId = creatorId();

        // Get assigned quotes, orders, and opportunities
        $assignedQuotes = SalesQuote::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->count();

        $assignedOrders = SalesOrder::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->count();

        $assignedOpportunities = SalesOpportunity::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->count();

        $completedOrders = SalesOrder::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->whereIn('status', ['delivered', 'completed'])
            ->count();

        $totalSalesValue = SalesOrder::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->whereIn('status', ['confirmed', 'delivered', 'completed'])
            ->with('items')
            ->get()
            ->sum(function ($order) {
                return $order->items->sum('final_price');
            });

        // Recent assigned data
        $recentQuotes = SalesQuote::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->with(['account', 'opportunity'])
            ->latest()
            ->take(5)
            ->get();

        $recentOrders = SalesOrder::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->with(['account', 'opportunity'])
            ->latest()
            ->take(5)
            ->get();

        $recentOpportunities = SalesOpportunity::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->with(['account', 'stage'])
            ->latest()
            ->take(5)
            ->get();

        // Calendar events from assigned calls and meetings
        $calendarEvents = [];

        $calls = SalesCall::where('created_by', $creatorId)
            ->where('assigned_user_id', $user->id)
            ->with(['account', 'assignedUser'])
            ->get();

        foreach ($calls as $call) {
            $date = $call->start_date ? $call->start_date->format('Y-m-d') : now()->format('Y-m-d');
            $time = $call->start_date ? $call->start_date->format('H:i') : '09:00';

            $calendarEvents[] = [
                'id' => 'call_' . $call->id,
                'title' => ($call->name ?? 'Sales Call'),
                'startDate' => $date,
                'endDate' => $date,
                'time' => $time,
                'status' => $call->status ?? 'scheduled',
                'name' => ($call->name ?? 'Sales Call'),
                'type' => 'call',
                'color' => '#3b82f6',
                'start_date' => $call->start_date,
                'end_date' => $call->end_date,
                'direction' => $call->direction,
                'description' => $call->description,
                'account' => $call->account,
                'assigned_user' => $call->assignedUser
            ];
        }

        $meetings = SalesMeeting::where('created_by', $creatorId)
            ->where('assigned_user_id', $user->id)
            ->with(['account', 'assignedUser'])
            ->get();

        foreach ($meetings as $meeting) {
            $date = $meeting->start_date ? $meeting->start_date->format('Y-m-d') : now()->format('Y-m-d');
            $time = $meeting->start_date ? $meeting->start_date->format('H:i') : '09:00';

            $calendarEvents[] = [
                'id' => 'meeting_' . $meeting->id,
                'title' => ($meeting->name ?? 'Sales Meeting'),
                'startDate' => $date,
                'endDate' => $date,
                'time' => $time,
                'status' => $meeting->status ?? 'scheduled',
                'name' => ($meeting->name ?? 'Sales Meeting'),
                'type' => 'meeting',
                'color' => '#10b981',
                'start_date' => $meeting->start_date,
                'end_date' => $meeting->end_date,
                'meeting_type' => $meeting->meeting_type,
                'description' => $meeting->description,
                'account' => $meeting->account,
                'assigned_user' => $meeting->assignedUser
            ];
        }

        // Performance chart
        $performanceChart = [
            ['name' => 'Completed', 'value' => $completedOrders],
            ['name' => 'Pending', 'value' => $assignedOrders - $completedOrders]
        ];

        return Inertia::render('Sales/Dashboard/UserDashboard', [
            'stats' => [
                'assigned_quotes' => $assignedQuotes,
                'assigned_orders' => $assignedOrders,
                'assigned_opportunities' => $assignedOpportunities,
                'completed_orders' => $completedOrders,
                'total_sales_value' => (float) $totalSalesValue,
            ],
            'recent_quotes' => $recentQuotes,
            'recent_orders' => $recentOrders,
            'recent_opportunities' => $recentOpportunities,
            'calendar_events' => $calendarEvents,
            'performance_chart' => $performanceChart,
            'message' => __('User Dashboard - View your assigned sales activities.')
        ]);
    }
}
