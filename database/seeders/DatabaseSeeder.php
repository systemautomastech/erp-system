<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        (new PermissionRoleSeeder())->run();
        (new DefultSetting())->run();
        (new PlanSeeder())->run();
        (new EmailTemplatesSeeder())->run();
        (new NotificationsTableSeeder())->run();

        $companyUser = User::where('type', 'company')->first();
        if ($companyUser) {
            User::CompanySetting($companyUser->id);
        }
    }
}
