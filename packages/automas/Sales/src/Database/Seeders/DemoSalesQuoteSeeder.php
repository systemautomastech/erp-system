<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesQuote;
use Automas\Sales\Models\SalesQuoteItem;
use Automas\Sales\Models\SalesQuoteItemTax;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesShippingProvider;
use App\Models\User;
use App\Models\Warehouse;
use Automas\ProductService\Models\ProductServiceItem;
use Automas\Account\Models\Customer;

class DemoSalesQuoteSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesQuote::where('created_by', $userId)->exists()) {
            return;
        }

        $opportunities = SalesOpportunity::where('created_by', $userId)->get();
        $accounts = SalesAccount::where('created_by', $userId)->get();
        $contacts = SalesContact::where('created_by', $userId)->get();
        $shippingProviders = SalesShippingProvider::where('created_by', $userId)->get();
        $warehouses = Warehouse::where('created_by', $userId)->get();
        $users = User::emp()->where('created_by', $userId)->pluck('id')->toArray();
        $users[] = $userId;
        
        // Get customers with address details
        $customers = Customer::with('user')->where('created_by', $userId)->get();
        $allProducts = ProductServiceItem::where('created_by', $userId)->get();

        if ($accounts->isEmpty() || $contacts->isEmpty() || $allProducts->isEmpty()) {
            return;
        }

        $quotes = [
            ['name' => 'Enterprise Software License Quote', 'status' => 'Sent'],
            ['name' => 'Cloud Infrastructure Setup Quote', 'status' => 'Draft'],
            ['name' => 'Digital Marketing Campaign Quote', 'status' => 'Accepted'],
            ['name' => 'Manufacturing Equipment Quote', 'status' => 'Sent'],
            ['name' => 'Healthcare IT Solutions Quote', 'status' => 'Draft'],
            ['name' => 'Financial Services Platform Quote', 'status' => 'Sent'],
            ['name' => 'Retail POS System Quote', 'status' => 'Accepted'],
            ['name' => 'Construction Management Software Quote', 'status' => 'Draft'],
            ['name' => 'Green Energy Consulting Quote', 'status' => 'Accepted'],
            ['name' => 'E-commerce Platform Quote', 'status' => 'Sent'],
            ['name' => 'Food Distribution System Quote', 'status' => 'Draft'],
            ['name' => 'Logistics Optimization Quote', 'status' => 'Sent'],
            ['name' => 'Educational Technology Quote', 'status' => 'Accepted'],
            ['name' => 'Real Estate CRM Quote', 'status' => 'Sent'],
            ['name' => 'Pharmaceutical Research Quote', 'status' => 'Draft'],
            ['name' => 'Automotive Parts Inventory Quote', 'status' => 'Sent'],
            ['name' => 'Business Intelligence Quote', 'status' => 'Accepted'],
            ['name' => 'Media Production Workflow Quote', 'status' => 'Draft'],
            ['name' => 'Security System Integration Quote', 'status' => 'Sent'],
            ['name' => 'Textile Manufacturing ERP Quote', 'status' => 'Draft'],
        ];

        foreach ($quotes as $quoteData) {
            $dateQuoted = now()->subDays(rand(0, 180));
            $expiryDate = $dateQuoted->copy()->addDays(rand(30, 90));

            $quoteData['date_quoted'] = $dateQuoted->format('Y-m-d');
            $quoteData['expiry_date'] = $expiryDate->format('Y-m-d');

            $account = $accounts->random();
            $warehouse = $warehouses->isNotEmpty() ? $warehouses->random() : null;

            $warehouseProducts = $warehouse ?
                $allProducts->filter(function($product) use ($warehouse) {
                    return $product->warehouseStocks()->where('warehouse_id', $warehouse->id)->where('quantity', '>', 0)->exists();
                }) : $allProducts;

            if ($warehouseProducts->isEmpty()) {
                $warehouseProducts = $allProducts;
            }

            $items = $this->prepareItems($warehouseProducts);
            $totals = $this->calculateTotals($items);

            $accountContacts = $contacts->where('account_id', $account->id);
            $billingContact = $accountContacts->isNotEmpty() ? $accountContacts->random() : $contacts->random();
            $shippingContact = $accountContacts->isNotEmpty() ? $accountContacts->random() : $contacts->random();
            $accountOpportunities = $opportunities->where('account_id', $account->id);
            $opportunity = $accountOpportunities->isNotEmpty() ? $accountOpportunities->random() : null;

            // Get customer for this quote
            $customer = $customers->isNotEmpty() ? $customers->random() : null;
            
            // Use customer address if available, otherwise fallback to account address
            $billingAddr = $customer && $customer->billing_address ? $customer->billing_address : [];
            $shippingAddr = $customer && $customer->shipping_address ? $customer->shipping_address : [];
            
            $quote = SalesQuote::create(array_merge($quoteData, [
                'opportunity_id' => $opportunity?->id,
                'account_id' => $account->id,
                'customer_id' => $customer?->user_id,
                'billing_contact_id' => $billingContact->id,
                'shipping_contact_id' => $shippingContact->id,
                'shipping_provider_id' => $shippingProviders->isNotEmpty() ? $shippingProviders->random()->id : null,
                'warehouse_id' => $warehouse?->id,
                'assign_user_id' => !empty($users) ? $users[array_rand($users)] : null,
                'billing_address' => $billingAddr['address'] ?? $account->billing_address,
                'billing_city' => $billingAddr['city'] ?? $account->billing_city,
                'billing_state' => $billingAddr['state'] ?? $account->billing_state,
                'billing_country' => $billingAddr['country'] ?? $account->billing_country,
                'billing_postal_code' => $billingAddr['postal_code'] ?? $account->billing_postal_code,
                'shipping_address' => $shippingAddr['address'] ?? $account->shipping_address,
                'shipping_city' => $shippingAddr['city'] ?? $account->shipping_city,
                'shipping_state' => $shippingAddr['state'] ?? $account->shipping_state,
                'shipping_country' => $shippingAddr['country'] ?? $account->shipping_country,
                'shipping_postal_code' => $shippingAddr['postal_code'] ?? $account->shipping_postal_code,
                'subtotal' => $totals['subtotal'],
                'tax_amount' => $totals['tax_amount'],
                'discount_amount' => $totals['discount_amount'],
                'total_amount' => $totals['total_amount'],
                'creator_id' => $userId,
                'created_by' => $userId,
            ]));

            $this->createQuoteItems($quote->id, $items, $userId);
        }
    }

    private function prepareItems($allProducts)
    {
        $items = [];
        if ($allProducts->count() < 2) {
            return $items;
        }
        $itemCount = rand(2, min(4, $allProducts->count()));
        $selectedProducts = $allProducts->random($itemCount);

        foreach ($selectedProducts as $product) {
            $quantity = rand(1, 10);
            $discountPercentage = rand(0, 1) ? rand(0, 15) : 0;

            $taxPercentage = 0;
            $taxes = [];
            $productTaxes = $product->taxes;
            if ($productTaxes && $productTaxes->count() > 0) {
                foreach ($productTaxes as $tax) {
                    $taxPercentage += (float)$tax->rate;
                    $taxes[] = [
                        'tax_name' => $tax->tax_name,
                        'tax_rate' => $tax->rate,
                        'rate' => $tax->rate
                    ];
                }
            }

            $items[] = [
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->sale_price,
                'discount_percentage' => $discountPercentage,
                'tax_percentage' => $taxPercentage,
                'taxes' => $taxes
            ];
        }

        return $items;
    }

    private function calculateTotals($items)
    {
        $subtotal = 0;
        $totalTax = 0;
        $totalDiscount = 0;

        foreach ($items as $item) {
            $lineTotal = $item['quantity'] * $item['unit_price'];
            $discountAmount = ($lineTotal * ($item['discount_percentage'] ?? 0)) / 100;
            $afterDiscount = $lineTotal - $discountAmount;
            $taxAmount = ($afterDiscount * ($item['tax_percentage'] ?? 0)) / 100;

            $subtotal += $lineTotal;
            $totalDiscount += $discountAmount;
            $totalTax += $taxAmount;
        }

        return [
            'subtotal' => $subtotal,
            'tax_amount' => $totalTax,
            'discount_amount' => $totalDiscount,
            'total_amount' => $subtotal + $totalTax - $totalDiscount
        ];
    }

    private function createQuoteItems($quoteId, $items, $userId)
    {
        foreach ($items as $itemData) {
            $item = SalesQuoteItem::create([
                'quote_id' => $quoteId,
                'product_id' => $itemData['product_id'],
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'discount_percentage' => $itemData['discount_percentage'] ?? 0,
                'tax_percentage' => $itemData['tax_percentage'] ?? 0,
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);

            if (isset($itemData['taxes']) && is_array($itemData['taxes'])) {
                foreach ($itemData['taxes'] as $tax) {
                    SalesQuoteItemTax::create([
                        'item_id' => $item->id,
                        'tax_name' => $tax['tax_name'],
                        'tax_rate' => $tax['tax_rate'] ?? $tax['rate'] ?? 0,
                    ]);
                }
            }
        }
    }
}