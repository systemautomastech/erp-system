<?php

namespace Automas\Sales\Database\Seeders;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Artisan;

class PermissionTableSeeder extends Seeder
{
    public function run()
    {
        Model::unguard();
        Artisan::call('cache:clear');

        $permission = [
            ['name' => 'manage-sales', 'module' => 'sales', 'label' => 'Manage Sales'],
            ['name' => 'manage-sales-dashboard', 'module' => 'sales', 'label' => 'Manage Dashboard'],
            ['name' => 'manage-sales-system-setup', 'module' => 'sales', 'label' => 'Manage System Setup'],

            ['name' => 'manage-sales-accounts', 'module' => 'sales-account', 'label' => 'Manage Accounts'],
            ['name' => 'manage-any-sales-accounts', 'module' => 'sales-account', 'label' => 'Manage All Accounts'],
            ['name' => 'manage-own-sales-accounts', 'module' => 'sales-account', 'label' => 'Manage Own Accounts'],
            ['name' => 'view-sales-accounts', 'module' => 'sales-account', 'label' => 'View Accounts'],
            ['name' => 'create-sales-accounts', 'module' => 'sales-account', 'label' => 'Create Accounts'],
            ['name' => 'edit-sales-accounts', 'module' => 'sales-account', 'label' => 'Edit Accounts'],
            ['name' => 'delete-sales-accounts', 'module' => 'sales-account', 'label' => 'Delete Accounts'],

            ['name' => 'manage-sales-contacts', 'module' => 'sales-contact', 'label' => 'Manage Contacts'],
            ['name' => 'manage-any-sales-contacts', 'module' => 'sales-contact', 'label' => 'Manage All Contacts'],
            ['name' => 'manage-own-sales-contacts', 'module' => 'sales-contact', 'label' => 'Manage Own Contacts'],
            ['name' => 'view-sales-contacts', 'module' => 'sales-contact', 'label' => 'View Contacts'],
            ['name' => 'create-sales-contacts', 'module' => 'sales-contact', 'label' => 'Create Contacts'],
            ['name' => 'edit-sales-contacts', 'module' => 'sales-contact', 'label' => 'Edit Contacts'],
            ['name' => 'delete-sales-contacts', 'module' => 'sales-contact', 'label' => 'Delete Contacts'],
            
            ['name' => 'manage-sales-opportunities', 'module' => 'sales-opportunity', 'label' => 'Manage Opportunities'],
            ['name' => 'manage-any-sales-opportunities', 'module' => 'sales-opportunity', 'label' => 'Manage All Opportunities'],
            ['name' => 'manage-own-sales-opportunities', 'module' => 'sales-opportunity', 'label' => 'Manage Own Opportunities'],
            ['name' => 'view-sales-opportunities', 'module' => 'sales-opportunity', 'label' => 'View Opportunities'],
            ['name' => 'create-sales-opportunities', 'module' => 'sales-opportunity', 'label' => 'Create Opportunities'],
            ['name' => 'edit-sales-opportunities', 'module' => 'sales-opportunity', 'label' => 'Edit Opportunities'],
            ['name' => 'delete-sales-opportunities', 'module' => 'sales-opportunity', 'label' => 'Delete Opportunities'],

            ['name' => 'manage-sales-account-types', 'module' => 'sales-account-type', 'label' => 'Manage Account Types'],
            ['name' => 'manage-any-sales-account-types', 'module' => 'sales-account-type', 'label' => 'Manage All Account Types'],
            ['name' => 'manage-own-sales-account-types', 'module' => 'sales-account-type', 'label' => 'Manage Own Account Types'],
            ['name' => 'create-sales-account-types', 'module' => 'sales-account-type', 'label' => 'Create Account Types'],
            ['name' => 'edit-sales-account-types', 'module' => 'sales-account-type', 'label' => 'Edit Account Types'],
            ['name' => 'delete-sales-account-types', 'module' => 'sales-account-type', 'label' => 'Delete Account Types'],

            ['name' => 'manage-sales-account-industries', 'module' => 'sales-account-industry', 'label' => 'Manage Account Industries'],
            ['name' => 'manage-any-sales-account-industries', 'module' => 'sales-account-industry', 'label' => 'Manage All Account Industries'],
            ['name' => 'manage-own-sales-account-industries', 'module' => 'sales-account-industry', 'label' => 'Manage Own Account Industries'],
            ['name' => 'create-sales-account-industries', 'module' => 'sales-account-industry', 'label' => 'Create Account Industries'],
            ['name' => 'edit-sales-account-industries', 'module' => 'sales-account-industry', 'label' => 'Edit Account Industries'],
            ['name' => 'delete-sales-account-industries', 'module' => 'sales-account-industry', 'label' => 'Delete Account Industries'],

            ['name' => 'manage-sales-opportunity-stages', 'module' => 'sales-opportunity-stage', 'label' => 'Manage Opportunity Stages'],
            ['name' => 'manage-any-sales-opportunity-stages', 'module' => 'sales-opportunity-stage', 'label' => 'Manage All Opportunity Stages'],
            ['name' => 'manage-own-sales-opportunity-stages', 'module' => 'sales-opportunity-stage', 'label' => 'Manage Own Opportunity Stages'],
            ['name' => 'create-sales-opportunity-stages', 'module' => 'sales-opportunity-stage', 'label' => 'Create Opportunity Stages'],
            ['name' => 'edit-sales-opportunity-stages', 'module' => 'sales-opportunity-stage', 'label' => 'Edit Opportunity Stages'],
            ['name' => 'delete-sales-opportunity-stages', 'module' => 'sales-opportunity-stage', 'label' => 'Delete Opportunity Stages'],

            ['name' => 'manage-shipping-providers', 'module' => 'shipping-provider', 'label' => 'Manage Shipping Providers'],
            ['name' => 'manage-any-shipping-providers', 'module' => 'shipping-provider', 'label' => 'Manage All Shipping Providers'],
            ['name' => 'manage-own-shipping-providers', 'module' => 'shipping-provider', 'label' => 'Manage Own Shipping Providers'],
            ['name' => 'create-shipping-providers', 'module' => 'shipping-provider', 'label' => 'Create Shipping Providers'],
            ['name' => 'edit-shipping-providers', 'module' => 'shipping-provider', 'label' => 'Edit Shipping Providers'],
            ['name' => 'delete-shipping-providers', 'module' => 'shipping-provider', 'label' => 'Delete Shipping Providers'],
            
            ['name' => 'manage-sales-quotes', 'module' => 'sales-quote', 'label' => 'Manage Sales Quotes'],
            ['name' => 'manage-any-sales-quotes', 'module' => 'sales-quote', 'label' => 'Manage All Sales Quotes'],
            ['name' => 'manage-own-sales-quotes', 'module' => 'sales-quote', 'label' => 'Manage Own Sales Quotes'],
            ['name' => 'view-sales-quotes', 'module' => 'sales-quote', 'label' => 'View Sales Quotes'],
            ['name' => 'create-sales-quotes', 'module' => 'sales-quote', 'label' => 'Create Sales Quotes'],
            ['name' => 'edit-sales-quotes', 'module' => 'sales-quote', 'label' => 'Edit Sales Quotes'],
            ['name' => 'delete-sales-quotes', 'module' => 'sales-quote', 'label' => 'Delete Sales Quotes'],
            ['name' => 'convert-sales-quotes', 'module' => 'sales-quote', 'label' => 'Convert Sales Quotes'],
            ['name' => 'print-sales-quotes', 'module' => 'sales-quote', 'label' => 'Print Sales Quotes'],
            
            ['name' => 'manage-sales-orders', 'module' => 'sales-order', 'label' => 'Manage Sales Orders'],
            ['name' => 'manage-any-sales-orders', 'module' => 'sales-order', 'label' => 'Manage All Sales Orders'],
            ['name' => 'manage-own-sales-orders', 'module' => 'sales-order', 'label' => 'Manage Own Sales Orders'],
            ['name' => 'view-sales-orders', 'module' => 'sales-order', 'label' => 'View Sales Orders'],
            ['name' => 'create-sales-orders', 'module' => 'sales-order', 'label' => 'Create Sales Orders'],
            ['name' => 'edit-sales-orders', 'module' => 'sales-order', 'label' => 'Edit Sales Orders'],
            ['name' => 'delete-sales-orders', 'module' => 'sales-order', 'label' => 'Delete Sales Orders'],
            ['name' => 'convert-sales-orders', 'module' => 'sales-order', 'label' => 'Convert Sales Orders'],

            // CaseType management
            ['name' => 'manage-sales-case-types', 'module' => 'case-types', 'label' => 'Manage CaseTypes'],
            ['name' => 'manage-any-sales-case-types', 'module' => 'case-types', 'label' => 'Manage All CaseTypes'],
            ['name' => 'manage-own-sales-case-types', 'module' => 'case-types', 'label' => 'Manage Own CaseTypes'],
            ['name' => 'create-sales-case-types', 'module' => 'case-types', 'label' => 'Create CaseTypes'],
            ['name' => 'edit-sales-case-types', 'module' => 'case-types', 'label' => 'Edit CaseTypes'],
            ['name' => 'delete-sales-case-types', 'module' => 'case-types', 'label' => 'Delete CaseTypes'],

            // Sales Cases management
            ['name' => 'manage-sales-cases', 'module' => 'sales-cases', 'label' => 'Manage Sales Cases'],
            ['name' => 'manage-any-sales-cases', 'module' => 'sales-cases', 'label' => 'Manage All Sales Cases'],
            ['name' => 'manage-own-sales-cases', 'module' => 'sales-cases', 'label' => 'Manage Own Sales Cases'],
            ['name' => 'view-sales-cases', 'module' => 'sales-cases', 'label' => 'View Sales Cases'],
            ['name' => 'create-sales-cases', 'module' => 'sales-cases', 'label' => 'Create Sales Cases'],
            ['name' => 'edit-sales-cases', 'module' => 'sales-cases', 'label' => 'Edit Sales Cases'],
            ['name' => 'delete-sales-cases', 'module' => 'sales-cases', 'label' => 'Delete Sales Cases'],

            // Sales Streams management
            ['name' => 'manage-sales-streams', 'module' => 'sales-streams', 'label' => 'Manage Sales Streams'],

            // SalesDocumentType management
            ['name' => 'manage-sales-document-types', 'module' => 'sales-document-types', 'label' => 'Manage Document Types'],
            ['name' => 'manage-any-sales-document-types', 'module' => 'sales-document-types', 'label' => 'Manage All Document Types'],
            ['name' => 'manage-own-sales-document-types', 'module' => 'sales-document-types', 'label' => 'Manage Own Document Types'],
            ['name' => 'create-sales-document-types', 'module' => 'sales-document-types', 'label' => 'Create Document Types'],
            ['name' => 'edit-sales-document-types', 'module' => 'sales-document-types', 'label' => 'Edit Document Types'],
            ['name' => 'delete-sales-document-types', 'module' => 'sales-document-types', 'label' => 'Delete Document Types'],

            // SalesDocumentFolder management
            ['name' => 'manage-sales-document-folders', 'module' => 'sales-document-folders', 'label' => 'Manage Document Folders'],
            ['name' => 'manage-any-sales-document-folders', 'module' => 'sales-document-folders', 'label' => 'Manage All Document Folders'],
            ['name' => 'manage-own-sales-document-folders', 'module' => 'sales-document-folders', 'label' => 'Manage Own Document Folders'],
            ['name' => 'view-sales-document-folders', 'module' => 'sales-document-folders', 'label' => 'View Document Folders'],
            ['name' => 'create-sales-document-folders', 'module' => 'sales-document-folders', 'label' => 'Create Document Folders'],
            ['name' => 'edit-sales-document-folders', 'module' => 'sales-document-folders', 'label' => 'Edit Document Folders'],
            ['name' => 'delete-sales-document-folders', 'module' => 'sales-document-folders', 'label' => 'Delete Document Folders'],

            // Sales Documents management
            ['name' => 'manage-sales-documents', 'module' => 'sales-documents', 'label' => 'Manage Documents'],
            ['name' => 'manage-any-sales-documents', 'module' => 'sales-documents', 'label' => 'Manage All Documents'],
            ['name' => 'manage-own-sales-documents', 'module' => 'sales-documents', 'label' => 'Manage Own Documents'],
            ['name' => 'view-sales-documents', 'module' => 'sales-documents', 'label' => 'View Documents'],
            ['name' => 'create-sales-documents', 'module' => 'sales-documents', 'label' => 'Create Documents'],
            ['name' => 'edit-sales-documents', 'module' => 'sales-documents', 'label' => 'Edit Documents'],
            ['name' => 'delete-sales-documents', 'module' => 'sales-documents', 'label' => 'Delete Documents'],

            // Sales Calls management
            ['name' => 'manage-sales-calls', 'module' => 'sales-calls', 'label' => 'Manage Sales Calls'],
            ['name' => 'manage-any-sales-calls', 'module' => 'sales-calls', 'label' => 'Manage All Sales Calls'],
            ['name' => 'manage-own-sales-calls', 'module' => 'sales-calls', 'label' => 'Manage Own Sales Calls'],
            ['name' => 'view-sales-calls', 'module' => 'sales-calls', 'label' => 'View Sales Calls'],
            ['name' => 'create-sales-calls', 'module' => 'sales-calls', 'label' => 'Create Sales Calls'],
            ['name' => 'edit-sales-calls', 'module' => 'sales-calls', 'label' => 'Edit Sales Calls'],
            ['name' => 'delete-sales-calls', 'module' => 'sales-calls', 'label' => 'Delete Sales Calls'],

            // Sales Meetings management
            ['name' => 'manage-sales-meetings', 'module' => 'sales-meetings', 'label' => 'Manage Sales Meetings'],
            ['name' => 'manage-any-sales-meetings', 'module' => 'sales-meetings', 'label' => 'Manage All Sales Meetings'],
            ['name' => 'manage-own-sales-meetings', 'module' => 'sales-meetings', 'label' => 'Manage Own Sales Meetings'],
            ['name' => 'view-sales-meetings', 'module' => 'sales-meetings', 'label' => 'View Sales Meetings'],
            ['name' => 'create-sales-meetings', 'module' => 'sales-meetings', 'label' => 'Create Sales Meetings'],
            ['name' => 'edit-sales-meetings', 'module' => 'sales-meetings', 'label' => 'Edit Sales Meetings'],
            ['name' => 'delete-sales-meetings', 'module' => 'sales-meetings', 'label' => 'Delete Sales Meetings'],

            ['name' => 'manage-sales-reports', 'module' => 'sales-reports', 'label' => 'Manage Sales Reports'],
            ['name' => 'view-sales-reports', 'module' => 'sales-reports', 'label' => 'View Sales Reports'],
            
            ['name' => 'edit-sales-settings', 'module' => 'sales-settings', 'label' => 'Edit Sales Settings'],
        ];

        $company_role = Role::where('name', 'company')->first();

        foreach ($permission as $perm) {
            $permission_obj = Permission::firstOrCreate(
                ['name' => $perm['name'], 'guard_name' => 'web'],
                [
                    'module' => $perm['module'],
                    'label' => $perm['label'],
                    'add_on' => 'Sales',
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            if ($company_role && !$company_role->hasPermissionTo($permission_obj)) {
                $company_role->givePermissionTo($permission_obj);
            }
        }
    }
}