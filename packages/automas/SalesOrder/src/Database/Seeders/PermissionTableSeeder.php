<?php

namespace Automas\SalesOrder\Database\Seeders;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Artisan;

class PermissionTableSeeder extends Seeder
{
    public function run(): void
    {
        Model::unguard();
        Artisan::call('cache:clear');

        $permissions = [
            // ── Sales Order ──────────────────────────────────────────────
            ['name' => 'manage-sales-orders',     'module' => 'sales-orders',     'label' => 'Manage Sales Orders'],
            ['name' => 'manage-any-sales-orders',  'module' => 'sales-orders',     'label' => 'Manage Any Sales Orders'],
            ['name' => 'manage-own-sales-orders',  'module' => 'sales-orders',     'label' => 'Manage Own Sales Orders'],
            ['name' => 'create-sales-orders',      'module' => 'sales-orders',     'label' => 'Create Sales Orders'],
            ['name' => 'view-sales-orders',        'module' => 'sales-orders',     'label' => 'View Sales Orders'],
            ['name' => 'edit-sales-orders',        'module' => 'sales-orders',     'label' => 'Edit Sales Orders'],
            ['name' => 'delete-sales-orders',      'module' => 'sales-orders',     'label' => 'Delete Sales Orders'],
            ['name' => 'print-sales-orders',       'module' => 'sales-orders',     'label' => 'Print / PDF Sales Orders'],

            // ── Delivery ─────────────────────────────────────────────────
            ['name' => 'manage-sales-order-deliveries', 'module' => 'sales-order-deliveries', 'label' => 'Manage Sales Order Deliveries'],
            ['name' => 'create-sales-order-deliveries', 'module' => 'sales-order-deliveries', 'label' => 'Create Sales Order Deliveries'],
            ['name' => 'view-sales-order-deliveries',   'module' => 'sales-order-deliveries', 'label' => 'View Sales Order Deliveries'],
            ['name' => 'cancel-sales-order-deliveries', 'module' => 'sales-order-deliveries', 'label' => 'Cancel Sales Order Deliveries'],
            ['name' => 'print-delivery-challans',       'module' => 'sales-order-deliveries', 'label' => 'Print Delivery Challans'],

            // ── Quotation Conversion ──────────────────────────────────────
            ['name' => 'convert-quotation-to-sales-order', 'module' => 'sales-orders', 'label' => 'Convert Quotation to Sales Order'],

            // ── Settings ─────────────────────────────────────────────────
            ['name' => 'manage-sales-order-settings', 'module' => 'sales-order-settings', 'label' => 'Manage Sales Order Settings'],
        ];

        // Roles that should receive all permissions by default
        $companyRole = Role::where('name', 'company')->first();
        $adminRole   = Role::where('name', 'admin')->orWhere('name', 'superadmin')->first();

        foreach ($permissions as $perm) {
            $permObj = Permission::firstOrCreate(
                ['name' => $perm['name'], 'guard_name' => 'web'],
                [
                    'module'     => $perm['module'],
                    'label'      => $perm['label'],
                    'add_on'     => 'SalesOrder',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Grant to company/admin by default
            foreach ([$companyRole, $adminRole] as $role) {
                if ($role && !$role->hasPermissionTo($permObj)) {
                    $role->givePermissionTo($permObj);
                }
            }
        }
    }
}