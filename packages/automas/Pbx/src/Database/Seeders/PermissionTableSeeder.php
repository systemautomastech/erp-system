<?php

namespace Automas\Pbx\Database\Seeders;

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
            ['name' => 'manage settings', 'module' => 'pbx', 'label' => 'Manage All Settings'],

            ['name' => 'manage extensions', 'module' => 'pbx', 'label' => 'Manage All Extension'],
            ['name' => 'view extensions', 'module' => 'pbx', 'label' => 'View Extension'],
            ['name' => 'create extensions', 'module' => 'pbx', 'label' => 'Create Extension'],
            ['name' => 'edit extensions', 'module' => 'pbx', 'label' => 'Edit Extension'],
            ['name' => 'delete extensions', 'module' => 'pbx', 'label' => 'Delete Extension'],

            ['name' => 'manage pbx', 'module' => 'pbx', 'label' => 'manage pbx'],

            ['name' => 'view call logs', 'module' => 'pbx', 'label' => 'View All Logs'],
            ['name' => 'delete call logs', 'module' => 'pbx', 'label' => 'Delete Logs'],

            ['name' => 'use dialer', 'module' => 'pbx', 'label' => 'Use Dialer'],
        ];

        $company_role = Role::where('name', 'company')->first();

        foreach ($permission as $perm) {
            $permission_obj = Permission::firstOrCreate(
                ['name' => $perm['name'], 'guard_name' => 'web'],
                [
                    'module' => $perm['module'],
                    'label' => $perm['label'],
                    'add_on' => 'Lead',
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
