<?php

namespace Automas\Pbx\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PbxUtility extends Model
{
    use HasFactory;

    public static function GivePermissionToRoles($role_id = null, $rolename = null)
    {
        $staff_permission = [
            'manage extensions',
            'view extensions',
            'view call logs',
        ];

        $manager_permission = [
            'manage settings',
            'manage extensions',
            'view extensions',
            'create extensions',
            'edit extensions',
            'delete extensions',
            'manage pbx',
            'view call logs',
            'delete call logs',
            'use dialer',
        ];

        if ($rolename == 'staff') {
            self::assignPermissions($role_id, $staff_permission);
        } elseif (in_array($rolename, ['hr', 'manager'])) {
            self::assignPermissions($role_id, $manager_permission);
        }
    }

    public static function defaultdata($company_id = null, $created_by = null)
    {
        if (empty($created_by)) {
            return;
        }

        PbxSetting::firstOrCreate(
            ['created_by' => $created_by],
            [
                'pbx_name' => 'Automas PBX',
                'ami_port' => 5038,
                'extension_start' => 100,
                'extension_end' => 199,
                'max_extensions' => 50,
                'is_enabled' => false,
                'created_by' => $company_id ?? 0,
            ]
        );
    }

    protected static function assignPermissions($role_id, array $permissions): void
    {
        $role = Role::find($role_id);

        if (!$role) {
            return;
        }

        foreach ($permissions as $permissionName) {
            $permission = Permission::where('name', $permissionName)->where('module', 'Pbx')->first();

            if ($permission && !$role->hasPermission($permissionName)) {
                $role->givePermission($permission);
            }
        }
    }
}
