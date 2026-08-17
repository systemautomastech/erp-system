<?php

namespace Automas\DoubleEntry\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DoubleEntryDatabaseSeeder extends Seeder
{
    public function run()
    {
        Model::unguard();

        $this->call(PermissionTableSeeder::class);
        $this->call(MarketplaceSettingSeeder::class);

        if (config('app.run_demo_seeder')) {
            // Add here your demo data seeders
            $companyUser = User::where('email', 'company@automas.com')->first() ?? User::where('type', 'company')->first() ?? User::first();
            $userId = $companyUser ? $companyUser->id : 1;
        }
    }
}
