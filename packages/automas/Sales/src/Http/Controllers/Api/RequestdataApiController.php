<?php

namespace Automas\Sales\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesOpportunityStage;
use Automas\Sales\Models\SalesOrder;
use Automas\Sales\Models\SalesQuote;
use Automas\Sales\Models\SalesShippingProvider;
use Illuminate\Http\Request;
use Automas\Sales\Models\SalesCase;

class RequestdataApiController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        try {
            $data = [
                'accounts'             => $this->getFilteredAccounts(),
                'contacts'             => $this->getFilteredContacts(),
                'opportunities_stages' => $this->getFilteredStages(),
                'users'                => $this->getFilteredUsers(),
                'opportunities'        => $this->getFilteredOpportunities(),
                'shipping_providers'   => $this->getFilteredShippingProviders(),
                'quotes'               => $this->getFilteredQuotes(),
                'customers'            => User::where('type', 'client')->select('id', 'name', 'email')->where('created_by', creatorId())->get(),
                'cases'                => $this->getFilteredCases(),   
            ];

            return $this->successResponse($data, 'Data retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
    private function getFilteredUsers()
    {
        return User::emp()->where('created_by', creatorId())
            ->select('id', 'name')->get();
    }
    private function getFilteredCases()
    {
        return SalesCase::where('created_by', creatorId())
            ->select(
                'id',
                'name',

            )->get();
    }

    private function getFilteredAccounts()
    {
        return SalesAccount::where('created_by', creatorId())
            ->where('is_active', true)
            ->select('id', 'name')
            ->get();
    }

    private function getFilteredContacts()
    {
        return SalesContact::where('created_by', creatorId())
            ->where('is_active', true)
            ->select('id', 'name', 'account_id')
            ->get();
    }

    private function getFilteredStages()
    {
        return SalesOpportunityStage::where('created_by', creatorId())
            ->where('is_active', true)
            ->orderBy('order')
            ->select('id', 'name', 'color')
            ->get();
    }
    private function getFilteredOpportunities()
    {
        return SalesOpportunity::where('created_by', creatorId())
            ->where('is_active', true)
            ->select('id', 'name', 'account_id', 'contact_id', 'stage_id', 'assign_user_id')->get();
    }
    private function getFilteredShippingProviders()
    {
        return SalesShippingProvider::where('created_by', creatorId())
            ->select('id', 'name')->get();
    }
    private function getFilteredQuotes()
    {
        return SalesQuote::where('created_by', creatorId())
            ->select(
                'id',
                'name',
                'opportunity_id',
                'account_id',
                'customer_id',
                'warehouse_id',
                'shipping_provider_id',
                'assign_user_id'
            )->get();
    }
    
    public function getQuoteData($id)
    {
        try {
            $quote = SalesQuote::with([
                'account:id,name',
                'opportunity:id,name',
                'assignUser:id,name',
                'customer:id,name',
                'warehouse:id,name',
                'items.product:id,name,sku',
                'items.taxes:id,item_id,tax_name,tax_rate',
                'billingContact:id,name',
                'shippingContact:id,name',
                'shippingProvider:id,name'
            ])
                ->where('id', $id)

                ->first();

            if (!$quote) {
                return $this->errorResponse('Quote not found', null, 404);
            }

            $data = [
                'id'                   => $quote->id,
                'notes'                => $quote->notes,
                'description'          => $quote->description,
                'subtotal'             => $quote->subtotal,
                'tax_amount'           => $quote->tax_amount,
                'discount_amount'      => $quote->discount_amount,
                'total_amount'         => $quote->total_amount,
                'account'              => $quote->account,
                'opportunity'          => $quote->opportunity,
                'customer'             => $quote->customer,
                'warehouse'            => $quote->warehouse,
                'assign_user'          => $quote->assignUser,
                'billing_contact'      => $quote->billingContact,
                'shipping_contact'     => $quote->shippingContact,
                'shipping_provider'    => $quote->shippingProvider,
                'billing_address'      => $quote->billing_address,
                'shipping_address'     => $quote->shipping_address,
                'billing_city'         => $quote->billing_city,
                'shipping_city'        => $quote->shipping_city,
                'billing_state'        => $quote->billing_state,
                'shipping_state'       => $quote->shipping_state,
                'billing_country'      => $quote->billing_country,
                'shipping_country'     => $quote->shipping_country,
                'billing_postal_code'  => $quote->billing_postal_code,
                'shipping_postal_code' => $quote->shipping_postal_code,
                'items'                => $quote->items->map(function ($item) {
                    return [
                        'id'                  => $item->id,
                        'product'             => $item->product,
                        'quantity'            => $item->quantity,
                        'unit_price'          => $item->unit_price,
                        'discount_percentage' => $item->discount_percentage,
                        'tax_percentage'      => $item->tax_percentage,
                        'line_total'          => $item->quantity * $item->unit_price,
                        'taxes'               => $item->taxes
                    ];
                })
            ];

            return $this->successResponse($data, 'Quote details retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
     public function getSalesOrderData($id)
    {
        try {
            $salesOrder = SalesOrder::with([
                'account:id,name',
                'opportunity:id,name',
                'assignUser:id,name',
                'customer:id,name',
                'warehouse:id,name',
                'quote:id,name',
                'items.product:id,name,sku',
                'items.taxes:id,item_id,tax_name,tax_rate',
                'billingContact:id,name',
                'shippingContact:id,name',
                'shippingProvider:id,name'
            ])
                ->where('id', $id)
                ->first();

            if (!$salesOrder) {
                return $this->errorResponse('Sales order not found', null, 404);
            }

            $data = [
                'id'                   => $salesOrder->id,
                'order_number'         => $salesOrder->order_number,
                'name'                 => $salesOrder->name,
                'status'               => $salesOrder->status,
                'order_date'           => $salesOrder->order_date,
                'notes'                => $salesOrder->notes,
                'description'          => $salesOrder->description,
                'subtotal'             => $salesOrder->subtotal,
                'tax_amount'           => $salesOrder->tax_amount,
                'discount_amount'      => $salesOrder->discount_amount,
                'total_amount'         => $salesOrder->total_amount,
                'quote'                => $salesOrder->quote,
                'account'              => $salesOrder->account,
                'opportunity'          => $salesOrder->opportunity,
                'customer'             => $salesOrder->customer,
                'warehouse'            => $salesOrder->warehouse,
                'assign_user'          => $salesOrder->assignUser,
                'billing_contact'      => $salesOrder->billingContact,
                'shipping_contact'     => $salesOrder->shippingContact,
                'shipping_provider'    => $salesOrder->shippingProvider,
                'billing_address'      => $salesOrder->billing_address,
                'shipping_address'     => $salesOrder->shipping_address,
                'billing_city'         => $salesOrder->billing_city,
                'shipping_city'        => $salesOrder->shipping_city,
                'billing_state'        => $salesOrder->billing_state,
                'shipping_state'       => $salesOrder->shipping_state,
                'billing_country'      => $salesOrder->billing_country,
                'shipping_country'     => $salesOrder->shipping_country,
                'billing_postal_code'  => $salesOrder->billing_postal_code,
                'shipping_postal_code' => $salesOrder->shipping_postal_code,
                'items'                => $salesOrder->items->map(function ($item) {
                    return [
                        'id'                  => $item->id,
                        'product'             => $item->product,
                        'quantity'            => $item->quantity,
                        'unit_price'          => $item->unit_price,
                        'discount_percentage' => $item->discount_percentage,
                        'tax_percentage'      => $item->tax_percentage,
                        'line_total'          => $item->quantity * $item->unit_price,
                        'taxes'               => $item->taxes
                    ];
                })
            ];

            return $this->successResponse($data, 'Sales order details retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
    public function getParentRecords(Request $request)
    {
        try {
            $parentType = $request->parent_type;

            $data = match($parentType) {
                'account' => SalesAccount::where('created_by', creatorId())
                    ->where('is_active', true)
                    ->select('id', 'name')
                    ->get(),
                'contact' => SalesContact::where('created_by', creatorId())
                    ->where('is_active', true)
                    ->select('id', 'name')
                    ->get(),
                'opportunity' => SalesOpportunity::where('created_by', creatorId())
                    ->where('is_active', true)
                    ->select('id', 'name')
                    ->get(),
                'case' => SalesCase::where('created_by', creatorId())
                    ->select('id', 'name')
                    ->get(),
                default => []
            };

            return $this->successResponse($data, 'Records retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
}
