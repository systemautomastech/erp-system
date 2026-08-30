<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('lead_subjects')) {
            Schema::create('lead_subjects', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('creator_id')->nullable()->index();
                $table->foreignId('created_by')->nullable()->index();
                $table->timestamps();

                $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            });
        }

        $permissions = [
            ['name' => 'manage-subjects', 'module' => 'subjects', 'label' => 'Manage Subjects'],
            ['name' => 'manage-any-subjects', 'module' => 'subjects', 'label' => 'Manage All Subjects'],
            ['name' => 'manage-own-subjects', 'module' => 'subjects', 'label' => 'Manage Own Subjects'],
            ['name' => 'create-subjects', 'module' => 'subjects', 'label' => 'Create Subjects'],
            ['name' => 'edit-subjects', 'module' => 'subjects', 'label' => 'Edit Subjects'],
            ['name' => 'delete-subjects', 'module' => 'subjects', 'label' => 'Delete Subjects'],
        ];

        $company_role = Role::where('name', 'company')->first();

        foreach ($permissions as $perm) {
            $permission_obj = Permission::firstOrCreate(
                ['name' => $perm['name'], 'guard_name' => 'web'],
                [
                    'module' => $perm['module'],
                    'label' => $perm['label'],
                    'add_on' => 'Lead',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            if ($company_role && !$company_role->hasPermissionTo($permission_obj)) {
                $company_role->givePermissionTo($permission_obj);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_subjects');

        $permissions = [
            'manage-subjects',
            'manage-any-subjects',
            'manage-own-subjects',
            'create-subjects',
            'edit-subjects',
            'delete-subjects',
        ];

        Permission::whereIn('name', $permissions)->delete();
    }
};
