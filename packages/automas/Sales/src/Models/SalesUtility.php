<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Automas\Sales\Models\SalesAccountType;
use Automas\Sales\Models\SalesAccountIndustry;
use Automas\Sales\Models\SalesOpportunityStage;
use Automas\Sales\Models\SalesCaseType;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SalesUtility extends Model
{
    public static function getSubTotal($items)
    {
        $subTotal = 0;
        foreach ($items as $product) {
            $subTotal += ($product->price * $product->quantity);
        }
        return $subTotal;
    }

    public static function getTotalTax($items)
    {
        if (module_is_active('ProductService')) {
            $totalTax = 0;
            foreach ($items as $product) {
                $subtotal = ($product->price * $product->quantity);
                $afterDiscount = $subtotal - $product->discount;
                $taxes = self::totalTaxRate($product->tax);
                $totalTax += ($taxes / 100) * $afterDiscount;
            }
            return $totalTax;
        } else {
            return 0;
        }
    }

    public static function getTotalDiscount($items)
    {
        $totalDiscount = 0;
        foreach ($items as $product) {
            $totalDiscount += $product->discount;
        }
        return $totalDiscount;
    }

    public static function totalTaxRate($taxes)
    {
        if (empty($taxes)) {
            return 0;
        }
        
        $taxArr = explode(',', $taxes);
        $taxRate = 0;
        if (module_is_active('ProductService')) {
            foreach ($taxArr as $taxId) {
                $taxId = trim($taxId);
                if (!empty($taxId)) {
                    $tax = \Automas\ProductService\Models\ProductServiceTax::find($taxId);
                    if ($tax) {
                        $taxRate += (float)$tax->rate;
                    }
                }
            }
        }
        return $taxRate;
    }

    public static function getTotal($items)
    {
        return $items->sum('final_price');
    }

    public static function defaultdata($company_id = null)
    {
        $opportunity_stages = [
            ['name' => 'Prospecting', 'color' => '#3B82F6', 'order' => 1],
            ['name' => 'Qualification', 'color' => '#8B5CF6', 'order' => 2],
            ['name' => 'Proposal', 'color' => '#F59E0B', 'order' => 3],
            ['name' => 'Negotiation', 'color' => '#EF4444', 'order' => 4],
            ['name' => 'Closed Won', 'color' => '#10B981', 'order' => 5],
            ['name' => 'Closed Lost', 'color' => '#6B7280', 'order' => 6],
        ];

        if (!empty($company_id)) {
            // Create Opportunity Stages
            foreach ($opportunity_stages as $index => $stage_data) {
                $opportunityStage = SalesOpportunityStage::where('name', $stage_data['name'])
                    ->where('created_by', $company_id)
                    ->first();

                if (empty($opportunityStage)) {
                    SalesOpportunityStage::create([
                        'name' => $stage_data['name'],
                        'color' => $stage_data['color'],
                        'order' => $index + 1,
                        'is_active' => true,
                        'creator_id' => 1,
                        'created_by' => $company_id,
                    ]);
                }
            }
        }
    }

    public static function GivePermissionToRoles($role_id = null, $rolename = null)
    {
        $staff_permission = [
            'manage-sales',
            'manage-sales-dashboard',

            'manage-sales-accounts',
            'manage-own-sales-accounts',
            'create-sales-accounts',
            'view-sales-accounts',
            'edit-sales-accounts',

            'manage-sales-contacts',
            'manage-own-sales-contacts',
            'create-sales-contacts',
            'view-sales-contacts',
            'edit-sales-contacts',

            'manage-sales-opportunities',
            'manage-own-sales-opportunities',
            'create-sales-opportunities',
            'view-sales-opportunities',
            'edit-sales-opportunities',

            'manage-sales-account-types',
            'manage-any-sales-account-types',

            'manage-sales-account-industries',
            'manage-any-sales-account-industries',

            'manage-sales-opportunity-stages',
            'manage-any-sales-opportunity-stages',

            'manage-shipping-providers',
            'manage-any-shipping-providers',

            'manage-sales-quotes',
            'manage-own-sales-quotes',
            'create-sales-quotes',
            'view-sales-quotes',
            'edit-sales-quotes',

            'manage-sales-orders',
            'manage-own-sales-orders',
            'create-sales-orders',
            'view-sales-orders',
            'edit-sales-orders',

            'manage-sales-cases',
            'manage-own-sales-cases',
            'create-sales-cases',
            'view-sales-cases',
            'edit-sales-cases',

            'manage-sales-case-types',
            'manage-any-sales-case-types',

            'manage-sales-document-types',
            'manage-any-sales-document-types',

            'manage-sales-document-folders',
            'manage-any-sales-document-folders',

            'manage-sales-documents',
            'manage-own-sales-documents',
            'create-sales-documents',
            'view-sales-documents',

            'manage-sales-calls',
            'manage-own-sales-calls',
            'view-sales-calls',

            'manage-sales-meetings',
            'manage-own-sales-meetings',
            'view-sales-meetings',
        ];

        if ($rolename == 'staff') {
            $roles_v = Role::where('name', 'staff')->where('id', $role_id)->first();
            if ($roles_v) {
                foreach ($staff_permission as $permission_v) {
                    $permission = Permission::where('name', $permission_v)->first();
                    if (!empty($permission)) {
                        if (!$roles_v->hasPermissionTo($permission_v)) {
                            $roles_v->givePermissionTo($permission);
                        }
                    }
                }
            }
        }
    }
}
