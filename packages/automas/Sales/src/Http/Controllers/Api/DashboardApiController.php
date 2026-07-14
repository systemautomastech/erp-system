<?php

namespace Automas\Sales\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesQuote;
use Automas\Sales\Models\SalesOrder;
use Automas\Sales\Models\SalesOpportunityStage;
use Automas\Sales\Models\SalesCall;
use Automas\Sales\Models\SalesMeeting;

class DashboardApiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            if (!Auth::user()->can('manage-sales-dashboard')) {
                return $this->errorResponse('Permission denied', null, 403);
            }

            $user = Auth::user();

            if ($user->type == 'company') {
                return $this->companyDashboard($request);
            }

            return $this->userDashboard($request);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    private function companyDashboard()
    {
        $creatorId = creatorId();

        // Key Metrics
        $totalQuotes         = SalesQuote::where('created_by', $creatorId)->count();
        $totalOrders         = SalesOrder::where('created_by', $creatorId)->count();
        $totalOpportunities  = SalesOpportunity::where('created_by', $creatorId)->count();
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
        $conversionRate  = $totalQuotes > 0 ? round(($convertedQuotes / $totalQuotes) * 100, 1) : 0;

        // Recent data
        $recentQuotes = SalesQuote::where('created_by', $creatorId)
            ->with(['account', 'opportunity', 'assignUser'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($quote) {
                return [
                    'id'           => $quote->id,
                    'name'         => $quote->name,
                    'quote_number' => $quote->quote_number,
                    'account'      => $quote->account?->name,
                    'opportunity'  => $quote->opportunity?->name,
                    'assign_user'  => $quote->assignUser?->name,
                    'status'       => $quote->status,
                    'date_quoted'  => $quote->date_quoted?->format('Y-m-d'),
                ];
            });

        $recentOrders = SalesOrder::where('created_by', $creatorId)
            ->with(['account', 'opportunity', 'assignUser'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id'           => $order->id,
                    'name'         => $order->name,
                    'order_number' => $order->order_number,
                    'account'      => $order->account?->name,
                    'opportunity'  => $order->opportunity?->name,
                    'assign_user'  => $order->assignUser?->name,
                    'status'       => $order->status,
                    'order_date'   => $order->order_date?->format('Y-m-d'),
                ];
            });

        $topOpportunities = SalesOpportunity::where('created_by', $creatorId)
            ->where('is_active', true)
            ->with(['account', 'stage', 'assignUser'])
            ->orderBy('amount', 'desc')
            ->take(5)
            ->get()
            ->map(function ($opportunity) {
                return [
                    'id'          => $opportunity->id,
                    'name'        => $opportunity->name,
                    'account'     => $opportunity->account?->name,
                    'stage'       => $opportunity->stage?->name,
                    'amount'      => $opportunity->amount,
                    'probability' => $opportunity->probability,
                    'close_date'  => $opportunity->close_date?->format('Y-m-d'),
                    'assign_user' => $opportunity->assignUser?->name,
                ];
            });

        // Opportunities by Stage Chart
        $opportunityStages = SalesOpportunityStage::where('created_by', $creatorId)
            ->withCount(['opportunities' => function ($query) use ($creatorId) {
                $query->where('created_by', $creatorId)->where('is_active', true);
            }])
            ->get()
            ->map(function ($stage) {
                return [
                    'name'  => $stage->name,
                    'value' => $stage->opportunities_count,
                    'color' => $stage->color ?? '#3b82f6'
                ];
            });

        // Monthly Sales Trend (last 6 months)
        $salesTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month         = now()->subMonths($i);
            $monthlyOrders = SalesOrder::where('created_by', $creatorId)
                ->whereYear('order_date', $month->year)
                ->whereMonth('order_date', $month->month)
                ->count();

            $monthlyRevenue = SalesOrder::where('sales_orders.created_by', $creatorId)
                ->whereIn('sales_orders.status', ['confirmed', 'delivered', 'completed'])
                ->whereYear('sales_orders.order_date', $month->year)
                ->whereMonth('sales_orders.order_date', $month->month)
                ->join('sales_order_items', 'sales_orders.id', '=', 'sales_order_items.order_id')
                ->sum('sales_order_items.final_price');

            $salesTrend[] = [
                'month'   => $month->format('M Y'),
                'orders'  => $monthlyOrders,
                'revenue' => (int) $monthlyRevenue
            ];
        }

        // Revenue by User (top 5)
        $revenueByUser = SalesOrder::where('sales_orders.created_by', $creatorId)
            ->whereIn('sales_orders.status', ['confirmed', 'delivered', 'completed'])
            ->whereNotNull('sales_orders.assign_user_id')
            ->join('sales_order_items', 'sales_orders.id', '=', 'sales_order_items.order_id')
            ->leftJoin('users', 'sales_orders.assign_user_id', '=', 'users.id')
            ->select(DB::raw('COALESCE(users.name, "Unassigned") as name'), DB::raw('SUM(sales_order_items.final_price) as revenue'))
            ->groupBy('users.id', 'users.name')
            ->orderBy('revenue', 'desc')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name'  => $item->name,
                    'value' => $item->revenue
                ];
            });

        // Orders by User (top 5)
        $ordersByUser = SalesOrder::where('sales_orders.created_by', $creatorId)
            ->whereNotNull('sales_orders.assign_user_id')
            ->leftJoin('users', 'sales_orders.assign_user_id', '=', 'users.id')
            ->select(DB::raw('COALESCE(users.name, "Unassigned") as name'), DB::raw('COUNT(*) as orders'))
            ->groupBy('users.id', 'users.name')
            ->orderBy('orders', 'desc')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name'  => $item->name,
                    'value' => (int) $item->orders
                ];
            });

        $data = [
            'stats' => [
                'total_quotes'         => $totalQuotes,
                'conversion_rate'      => $conversionRate,
                'converted_quotes'     => $convertedQuotes,
                'total_orders'         => $totalOrders,
                'total_opportunities'  => $totalOpportunities,
                'active_opportunities' => $activeOpportunities,
                'total_revenue'        => $totalRevenue,
                'pipeline_value'       => $pipelineValue,
            ],
            'recent_quotes'     => $recentQuotes,
            'recent_orders'     => $recentOrders,
            'top_opportunities' => $topOpportunities,
            'charts'            => [
                'opportunity_stages' => $opportunityStages,
                'sales_trend'        => $salesTrend,
                'revenue_by_user'    => $revenueByUser,
                'orders_by_user'     => $ordersByUser
            ],
        ];

        return $this->successResponse($data, 'Company dashboard data retrieved successfully');
    }

    private function userDashboard(Request $request)
    {
        $user      = Auth::user();
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

        $totalSalesValue = SalesOrder::where('sales_orders.created_by', $creatorId)
            ->where('sales_orders.assign_user_id', $user->id)
            ->whereIn('sales_orders.status', ['confirmed', 'delivered', 'completed'])
            ->join('sales_order_items', 'sales_orders.id', '=', 'sales_order_items.order_id')
            ->sum('sales_order_items.final_price') ?? 0;

        // Recent assigned data
        $recentQuotes = SalesQuote::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->with(['account', 'opportunity'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($quote) {
                return [
                    'id'           => $quote->id,
                    'name'         => $quote->name,
                    'quote_number' => $quote->quote_number,
                    'account'      => $quote->account?->name,
                    'opportunity'  => $quote->opportunity?->name,
                    'status'       => $quote->status,
                    'date_quoted'  => $quote->date_quoted?->format('Y-m-d'),
                ];
            });

        $recentOrders = SalesOrder::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->with(['account', 'opportunity'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id'           => $order->id,
                    'name'         => $order->name,
                    'order_number' => $order->order_number,
                    'account'      => $order->account?->name,
                    'opportunity'  => $order->opportunity?->name,
                    'status'       => $order->status,
                    'order_date'   => $order->order_date?->format('Y-m-d'),
                ];
            });

        $recentOpportunities = SalesOpportunity::where('created_by', $creatorId)
            ->where('assign_user_id', $user->id)
            ->with(['account', 'stage'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($opportunity) {
                return [
                    'id'         => $opportunity->id,
                    'name'       => $opportunity->name,
                    'account'    => $opportunity->account?->name,
                    'stage'      => $opportunity->stage?->name,
                    'amount'     => $opportunity->amount,
                    'close_date' => $opportunity->close_date?->format('Y-m-d'),
                ];
            });



        // Performance chart
        $performanceChart = [
            ['name' => 'Completed', 'value' => $completedOrders],
            ['name' => 'Pending', 'value' => $assignedOrders - $completedOrders]
        ];

        // Completion Rate
        $completionRate = $assignedOrders > 0 ? round(($completedOrders / $assignedOrders) * 100) : 0;

        // Total Assigned
        $totalAssigned = $assignedQuotes + $assignedOrders + $assignedOpportunities;

        $data = [
            'stats' => [
                'assigned_quotes'        => $assignedQuotes,
                'assigned_orders'        => $assignedOrders,
                'assigned_opportunities' => $assignedOpportunities,
                'completed_orders'       => $completedOrders,
                'total_sales_value'      => $totalSalesValue,
                'completion_rate'        => $completionRate,
                'total_assigned'         => $totalAssigned,
            ],
            'recent_quotes'        => $recentQuotes,
            'recent_orders'        => $recentOrders,
            'recent_opportunities' => $recentOpportunities,
            'performance_chart'    => $performanceChart,
        ];

        return $this->successResponse($data, 'User dashboard data retrieved successfully');
    }
}
