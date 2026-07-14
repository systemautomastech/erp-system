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
use Automas\Sales\Models\SalesUtility;
use App\Models\User;
use Carbon\Carbon;
use Automas\Sales\Models\SalesAccount;

class ReportController extends Controller
{
    public function quoteReports(Request $request)
    {
        if(Auth::user()->can('view-reports')){
            // Summary Cards
            $quoteSummary = $this->getQuoteSummary();
            
            // Quote Status Distribution (Pie Chart)
            $quoteStatusDistribution = $this->getQuoteStatusDistribution();
            

            
            // Conversion Metrics
            $conversionMetrics = $this->getConversionMetrics();
            
            // Staff Quotes (Bar Chart with filters)
            $staffQuotes = $this->getStaffQuotes($request->from_date, $request->to_date, $request->sales_user);
            
            // Per Month Quotes
            $perMonthQuotes = $this->getPerMonthQuotes();
            
            // Amount Reports
            $amountSummary = $this->getAmountSummary();
            $monthlyAmounts = $this->getMonthlyAmounts();
            
            // Get users for dropdown
            $users = User::emp()->where('created_by', '=', creatorId())
                ->select('id', 'name')
                ->get();

            return Inertia::render('Sales/Reports/QuoteReports', [
                'quoteSummary' => $quoteSummary,
                'quoteStatusDistribution' => $quoteStatusDistribution,
                'conversionMetrics' => $conversionMetrics,
                'staffQuotes' => $staffQuotes,
                'perMonthQuotes' => $perMonthQuotes,
                'amountSummary' => $amountSummary,
                'monthlyAmounts' => $monthlyAmounts,
                'users' => $users,

                'statuses' => $this->getStatuses(),
            ]);
        }
        return back()->with('error', __('Permission denied'));
    }

    public function orderReports(Request $request)
    {
        if(Auth::user()->can('view-reports')){
            // Summary Cards
            $orderSummary = $this->getOrderSummary();
            
            // Order Status Distribution (Pie Chart)
            $orderStatusDistribution = $this->getOrderStatusDistribution();
            
            // Conversion Metrics
            $conversionMetrics = $this->getOrderConversionMetrics();
            
            // Staff Orders (Bar Chart with filters)
            $staffOrders = $this->getStaffOrders($request->from_date, $request->to_date, $request->sales_user);
            
            // Per Month Orders
            $perMonthOrders = $this->getPerMonthOrders();
            
            // Amount Reports
            $amountSummary = $this->getOrderAmountSummary();
            $monthlyAmounts = $this->getOrderMonthlyAmounts();
            
            // Get users for dropdown
            $users = User::emp()->where('created_by', '=', creatorId())
                ->select('id', 'name')
                ->get();

            return Inertia::render('Sales/Reports/SalesOrderReports', [
                'orderSummary' => $orderSummary,
                'orderStatusDistribution' => $orderStatusDistribution,
                'conversionMetrics' => $conversionMetrics,
                'staffOrders' => $staffOrders,
                'perMonthOrders' => $perMonthOrders,
                'amountSummary' => $amountSummary,
                'monthlyAmounts' => $monthlyAmounts,
                'users' => $users,
                'statuses' => $this->getOrderStatuses(),
            ]);
        }
        return back()->with('error', __('Permission denied'));
    }

    public function opportunityReports(Request $request)
    {
        if(Auth::user()->can('view-reports')){
            // Summary Cards
            $opportunitySummary = $this->getOpportunitySummary();
            
            // Opportunity Stage Distribution (Pie Chart)
            $opportunityStageDistribution = $this->getOpportunityStageDistribution();
            
            // Opportunity Status Distribution (Active/Inactive)
            $opportunityStatusDistribution = $this->getOpportunityStatusDistribution();
            
            // Conversion Metrics
            $conversionMetrics = $this->getOpportunityConversionMetrics();
            
            // Staff Opportunities (Bar Chart with filters)
            $staffOpportunities = $this->getStaffOpportunities($request->from_date, $request->to_date, $request->sales_user);
            
            // Per Month Opportunities
            $perMonthOpportunities = $this->getPerMonthOpportunities();
            
            // Amount Reports
            $amountSummary = $this->getOpportunityAmountSummary();
            $monthlyAmounts = $this->getOpportunityMonthlyAmounts();
            
            // Get users and stages for dropdown
            $users = User::emp()->where('created_by', '=', creatorId())
                ->select('id', 'name')
                ->get();
            
            $stages = SalesOpportunityStage::where('created_by', creatorId())
                ->select('id', 'name')
                ->get();

            return Inertia::render('Sales/Reports/OpportunityReports', [
                'opportunitySummary' => $opportunitySummary,
                'opportunityStageDistribution' => $opportunityStageDistribution,
                'opportunityStatusDistribution' => $opportunityStatusDistribution,
                'conversionMetrics' => $conversionMetrics,
                'staffOpportunities' => $staffOpportunities,
                'perMonthOpportunities' => $perMonthOpportunities,
                'amountSummary' => $amountSummary,
                'monthlyAmounts' => $monthlyAmounts,
                'users' => $users,
                'stages' => $stages,
            ]);
        }
        return back()->with('error', __('Permission denied'));
    }

    private function getQuoteSummary()
    {
        $totalQuotes = SalesQuote::where('created_by', creatorId())->count();
        $acceptedQuotes = SalesQuote::where('created_by', creatorId())->where('status', 'Accepted')->count();
        $declinedQuotes = SalesQuote::where('created_by', creatorId())->where('status', 'Declined')->count();
        $draftQuotes = SalesQuote::where('created_by', creatorId())->where('status', 'Draft')->count();
        $sentQuotes = SalesQuote::where('created_by', creatorId())->where('status', 'Sent')->count();
        $expiredQuotes = SalesQuote::where('created_by', creatorId())->where('status', 'Expired')->count();

        return [
            'total' => $totalQuotes,
            'accepted' => $acceptedQuotes,
            'declined' => $declinedQuotes,
            'draft' => $draftQuotes,
            'sent' => $sentQuotes,
            'expired' => $expiredQuotes,
        ];
    }

    private function getQuoteStatusDistribution()
    {
        $accepted = SalesQuote::where('created_by', creatorId())->where('status', 'Accepted')->count();
        $declined = SalesQuote::where('created_by', creatorId())->where('status', 'Declined')->count();
        $draft = SalesQuote::where('created_by', creatorId())->where('status', 'Draft')->count();
        $sent = SalesQuote::where('created_by', creatorId())->where('status', 'Sent')->count();
        $expired = SalesQuote::where('created_by', creatorId())->where('status', 'Expired')->count();

        return [
            ['name' => 'Accepted', 'value' => $accepted],
            ['name' => 'Declined', 'value' => $declined],
            ['name' => 'Draft', 'value' => $draft],
            ['name' => 'Sent', 'value' => $sent],
            ['name' => 'Expired', 'value' => $expired],
        ];
    }



    private function getConversionMetrics()
    {
        $totalQuotes = SalesQuote::where('created_by', creatorId())->count();
        $convertedQuotes = SalesQuote::where('created_by', creatorId())
            ->where('is_converted', true)
            ->count();

        $conversionRate = $totalQuotes > 0 ? round(($convertedQuotes / $totalQuotes) * 100, 2) : 0;

        return [
            'totalQuotes' => $totalQuotes,
            'convertedQuotes' => $convertedQuotes,
            'conversionRate' => $conversionRate,
        ];
    }

    private function getStaffQuotes($fromDate = null, $toDate = null, $salesUser = null)
    {
        $users = User::emp()->where('created_by', '=', creatorId());
        
        if ($salesUser && $salesUser !== 'all') {
            $users->where('id', $salesUser);
        }
        
        $users = $users->get();
        $data = [];

        foreach ($users as $user) {
            $query = SalesQuote::where('created_by', creatorId())
                ->where('assign_user_id', $user->id);

            if ($fromDate && $toDate) {
                $query->whereDate('created_at', '>=', $fromDate)
                      ->whereDate('created_at', '<=', $toDate);
            }

            $count = $query->count();
            
            $data[] = [
                'name' => $user->name,
                'quotes' => $count
            ];
        }

        return $data;
    }

    private function getStatuses()
    {
        return [
            ['value' => 'Draft', 'label' => 'Draft'],
            ['value' => 'Sent', 'label' => 'Sent'],
            ['value' => 'Accepted', 'label' => 'Accepted'],
            ['value' => 'Declined', 'label' => 'Declined'],
            ['value' => 'Expired', 'label' => 'Expired'],
        ];
    }

    private function getPerMonthQuotes()
    {
        $data = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create(date('Y'), $month)->format('M Y');
            $count = SalesQuote::where('created_by', creatorId())
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', date('Y'))
                ->count();
            
            $data[] = [
                'month' => $month,
                'name' => $monthName,
                'quotes' => $count
            ];
        }

        return $data;
    }

    private function getAmountSummary()
    {
        $quotes = SalesQuote::where('sales_quotes.created_by', creatorId())->get();
        $totalAmount = $quotes->sum(fn($quote) => $quote->getTotal());
        
        $acceptedQuotes = SalesQuote::where('sales_quotes.created_by', creatorId())->where('status', 'Accepted')->get();
        $acceptedAmount = $acceptedQuotes->sum(fn($quote) => $quote->getTotal());
        
        $declinedQuotes = SalesQuote::where('sales_quotes.created_by', creatorId())->where('status', 'Declined')->get();
        $declinedAmount = $declinedQuotes->sum(fn($quote) => $quote->getTotal());
        
        $draftQuotes = SalesQuote::where('sales_quotes.created_by', creatorId())->where('status', 'Draft')->get();
        $draftAmount = $draftQuotes->sum(fn($quote) => $quote->getTotal());
        
        $sentQuotes = SalesQuote::where('sales_quotes.created_by', creatorId())->where('status', 'Sent')->get();
        $sentAmount = $sentQuotes->sum(fn($quote) => $quote->getTotal());
        
        $expiredQuotes = SalesQuote::where('sales_quotes.created_by', creatorId())->where('status', 'Expired')->get();
        $expiredAmount = $expiredQuotes->sum(fn($quote) => $quote->getTotal());

        return [
            'total' => $totalAmount,
            'accepted' => $acceptedAmount,
            'declined' => $declinedAmount,
            'draft' => $draftAmount,
            'sent' => $sentAmount,
            'expired' => $expiredAmount,
        ];
    }

    private function getMonthlyAmounts()
    {
        $data = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create(date('Y'), $month)->format('M Y');
            $quotes = SalesQuote::where('created_by', creatorId())
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', date('Y'))
                ->get();
            $amount = $quotes->sum(fn($quote) => $quote->getTotal());
            
            $data[] = [
                'month' => $month,
                'name' => $monthName,
                'amount' => $amount
            ];
        }

        return $data;
    }

    private function getOrderSummary()
    {
        $totalOrders = SalesOrder::where('created_by', creatorId())->count();
        $confirmedOrders = SalesOrder::where('created_by', creatorId())->where('status', 'Confirmed')->count();
        $cancelledOrders = SalesOrder::where('created_by', creatorId())->where('status', 'Cancelled')->count();
        $draftOrders = SalesOrder::where('created_by', creatorId())->where('status', 'Draft')->count();
        $pendingOrders = SalesOrder::where('created_by', creatorId())->where('status', 'Pending')->count();
        $deliveredOrders = SalesOrder::where('created_by', creatorId())->where('status', 'Delivered')->count();

        return [
            'total' => $totalOrders,
            'confirmed' => $confirmedOrders,
            'cancelled' => $cancelledOrders,
            'draft' => $draftOrders,
            'pending' => $pendingOrders,
            'delivered' => $deliveredOrders,
        ];
    }

    private function getOrderStatusDistribution()
    {
        $confirmed = SalesOrder::where('created_by', creatorId())->where('status', 'Confirmed')->count();
        $cancelled = SalesOrder::where('created_by', creatorId())->where('status', 'Cancelled')->count();
        $draft = SalesOrder::where('created_by', creatorId())->where('status', 'Draft')->count();
        $pending = SalesOrder::where('created_by', creatorId())->where('status', 'Pending')->count();
        $delivered = SalesOrder::where('created_by', creatorId())->where('status', 'Delivered')->count();

        return [
            ['name' => 'Confirmed', 'value' => $confirmed],
            ['name' => 'Cancelled', 'value' => $cancelled],
            ['name' => 'Draft', 'value' => $draft],
            ['name' => 'Pending', 'value' => $pending],
            ['name' => 'Delivered', 'value' => $delivered],
        ];
    }

    private function getOrderConversionMetrics()
    {
        $totalOrders = SalesOrder::where('created_by', creatorId())->count();
        $convertedOrders = SalesOrder::where('created_by', creatorId())

            ->count();

        $conversionRate = $totalOrders > 0 ? round(($convertedOrders / $totalOrders) * 100, 2) : 0;

        return [
            'totalOrders' => $totalOrders,
            'convertedOrders' => $convertedOrders,
            'conversionRate' => $conversionRate,
        ];
    }

    private function getStaffOrders($fromDate = null, $toDate = null, $salesUser = null)
    {
        $users = User::emp()->where('created_by', '=', creatorId());
        
        if ($salesUser && $salesUser !== 'all') {
            $users->where('id', $salesUser);
        }
        
        $users = $users->get();
        $data = [];

        foreach ($users as $user) {
            $query = SalesOrder::where('created_by', creatorId())
                ->where('assign_user_id', $user->id);

            if ($fromDate && $toDate) {
                $query->whereDate('created_at', '>=', $fromDate)
                      ->whereDate('created_at', '<=', $toDate);
            }

            $count = $query->count();
            
            $data[] = [
                'name' => $user->name,
                'orders' => $count
            ];
        }

        return $data;
    }

    private function getOrderStatuses()
    {
        return [
            ['value' => 'Draft', 'label' => 'Draft'],
            ['value' => 'Pending', 'label' => 'Pending'],
            ['value' => 'Confirmed', 'label' => 'Confirmed'],
            ['value' => 'Delivered', 'label' => 'Delivered'],
            ['value' => 'Cancelled', 'label' => 'Cancelled'],
        ];
    }

    private function getPerMonthOrders()
    {
        $data = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create(date('Y'), $month)->format('M Y');
            $count = SalesOrder::where('created_by', creatorId())
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', date('Y'))
                ->count();
            
            $data[] = [
                'month' => $month,
                'name' => $monthName,
                'orders' => $count
            ];
        }

        return $data;
    }

    private function getOrderAmountSummary()
    {
        $orders = SalesOrder::where('sales_orders.created_by', creatorId())->get();
        $totalAmount = $orders->sum(fn($order) => $order->getTotal());
        
        $confirmedOrders = SalesOrder::where('sales_orders.created_by', creatorId())->where('status', 'Confirmed')->get();
        $confirmedAmount = $confirmedOrders->sum(fn($order) => $order->getTotal());
        
        $cancelledOrders = SalesOrder::where('sales_orders.created_by', creatorId())->where('status', 'Cancelled')->get();
        $cancelledAmount = $cancelledOrders->sum(fn($order) => $order->getTotal());
        
        $draftOrders = SalesOrder::where('sales_orders.created_by', creatorId())->where('status', 'Draft')->get();
        $draftAmount = $draftOrders->sum(fn($order) => $order->getTotal());
        
        $pendingOrders = SalesOrder::where('sales_orders.created_by', creatorId())->where('status', 'Pending')->get();
        $pendingAmount = $pendingOrders->sum(fn($order) => $order->getTotal());
        
        $deliveredOrders = SalesOrder::where('sales_orders.created_by', creatorId())->where('status', 'Delivered')->get();
        $deliveredAmount = $deliveredOrders->sum(fn($order) => $order->getTotal());

        return [
            'total' => $totalAmount,
            'confirmed' => $confirmedAmount,
            'cancelled' => $cancelledAmount,
            'draft' => $draftAmount,
            'pending' => $pendingAmount,
            'delivered' => $deliveredAmount,
        ];
    }

    private function getOrderMonthlyAmounts()
    {
        $data = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create(date('Y'), $month)->format('M Y');
            $orders = SalesOrder::where('created_by', creatorId())
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', date('Y'))
                ->get();
            $amount = $orders->sum(fn($order) => $order->getTotal());
            
            $data[] = [
                'month' => $month,
                'name' => $monthName,
                'amount' => $amount
            ];
        }

        return $data;
    }

    private function getOpportunitySummary()
    {
        $totalOpportunities = SalesOpportunity::where('created_by', creatorId())->count();
        $activeOpportunities = SalesOpportunity::where('created_by', creatorId())->where('is_active', true)->count();
        $inactiveOpportunities = SalesOpportunity::where('created_by', creatorId())->where('is_active', false)->count();
        
        // More flexible matching for won/lost stages
        $wonOpportunities = SalesOpportunity::where('created_by', creatorId())
            ->whereHas('stage', function($query) {
                $query->where('name', 'LIKE', '%Won%')
                      ->orWhere('name', 'LIKE', '%Closed Won%')
                      ->orWhere('name', 'LIKE', '%Success%');
            })->count();
            
        $lostOpportunities = SalesOpportunity::where('created_by', creatorId())
            ->whereHas('stage', function($query) {
                $query->where('name', 'LIKE', '%Lost%')
                      ->orWhere('name', 'LIKE', '%Closed Lost%')
                      ->orWhere('name', 'LIKE', '%Failed%');
            })->count();

        return [
            'total' => $totalOpportunities,
            'active' => $activeOpportunities,
            'inactive' => $inactiveOpportunities,
            'won' => $wonOpportunities,
            'lost' => $lostOpportunities,
        ];
    }

    private function getOpportunityStageDistribution()
    {
        $data = SalesOpportunity::where('sales_opportunities.created_by', creatorId())
            ->join('sales_opportunity_stages', 'sales_opportunities.stage_id', '=', 'sales_opportunity_stages.id')
            ->select('sales_opportunity_stages.name', DB::raw('count(*) as value'))
            ->groupBy('sales_opportunity_stages.id', 'sales_opportunity_stages.name')
            ->get()
            ->toArray();

        return $data;
    }

    private function getOpportunityStatusDistribution()
    {
        $active = SalesOpportunity::where('created_by', creatorId())->where('is_active', true)->count();
        $inactive = SalesOpportunity::where('created_by', creatorId())->where('is_active', false)->count();

        return [
            ['name' => 'Active', 'value' => $active],
            ['name' => 'Inactive', 'value' => $inactive],
        ];
    }

    private function getOpportunityConversionMetrics()
    {
        $totalOpportunities = SalesOpportunity::where('created_by', creatorId())->count();
        $wonOpportunities = SalesOpportunity::where('created_by', creatorId())
            ->whereHas('stage', function($query) {
                $query->where('name', 'LIKE', '%Won%')
                      ->orWhere('name', 'LIKE', '%Closed Won%')
                      ->orWhere('name', 'LIKE', '%Success%');
            })->count();

        $conversionRate = $totalOpportunities > 0 ? round(($wonOpportunities / $totalOpportunities) * 100, 2) : 0;

        return [
            'totalOpportunities' => $totalOpportunities,
            'wonOpportunities' => $wonOpportunities,
            'conversionRate' => $conversionRate,
        ];
    }

    private function getStaffOpportunities($fromDate = null, $toDate = null, $salesUser = null)
    {
        $users = User::emp()->where('created_by', '=', creatorId());
        
        if ($salesUser && $salesUser !== 'all') {
            $users->where('id', $salesUser);
        }
        
        $users = $users->get();
        $data = [];

        foreach ($users as $user) {
            $query = SalesOpportunity::where('created_by', creatorId())
                ->where('assign_user_id', $user->id);

            if ($fromDate && $toDate) {
                $query->whereDate('created_at', '>=', $fromDate)
                      ->whereDate('created_at', '<=', $toDate);
            }

            $count = $query->count();
            
            $data[] = [
                'name' => $user->name,
                'opportunities' => $count
            ];
        }

        return $data;
    }

    private function getPerMonthOpportunities()
    {
        $data = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create(date('Y'), $month)->format('M Y');
            $count = SalesOpportunity::where('created_by', creatorId())
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', date('Y'))
                ->count();
            
            $data[] = [
                'month' => $month,
                'name' => $monthName,
                'opportunities' => $count
            ];
        }

        return $data;
    }

    private function getOpportunityAmountSummary()
    {
        $totalAmount = SalesOpportunity::where('created_by', creatorId())->sum('amount');
        $activeAmount = SalesOpportunity::where('created_by', creatorId())->where('is_active', true)->sum('amount');
        $inactiveAmount = SalesOpportunity::where('created_by', creatorId())->where('is_active', false)->sum('amount');
        
        // More flexible matching for won/lost stages
        $wonAmount = SalesOpportunity::where('created_by', creatorId())
            ->whereHas('stage', function($query) {
                $query->where('name', 'LIKE', '%Won%')
                      ->orWhere('name', 'LIKE', '%Closed Won%')
                      ->orWhere('name', 'LIKE', '%Success%');
            })->sum('amount');
            
        $lostAmount = SalesOpportunity::where('created_by', creatorId())
            ->whereHas('stage', function($query) {
                $query->where('name', 'LIKE', '%Lost%')
                      ->orWhere('name', 'LIKE', '%Closed Lost%')
                      ->orWhere('name', 'LIKE', '%Failed%');
            })->sum('amount');

        return [
            'total' => $totalAmount ?: 0,
            'active' => $activeAmount ?: 0,
            'inactive' => $inactiveAmount ?: 0,
            'won' => $wonAmount ?: 0,
            'lost' => $lostAmount ?: 0,
        ];
    }

    private function getOpportunityMonthlyAmounts()
    {
        $data = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $monthName = Carbon::create(date('Y'), $month)->format('M Y');
            $amount = SalesOpportunity::where('created_by', creatorId())
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', date('Y'))
                ->sum('amount');
            
            $data[] = [
                'month' => $month,
                'name' => $monthName,
                'amount' => $amount
            ];
        }

        return $data;
    }
}