<?php

namespace Automas\Pos\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class PosDatabaseSeeder extends Seeder
{
    public function run()
    {
        Model::unguard();

        $this->call(PermissionTableSeeder::class);
        $this->call(MarketplaceSettingSeeder::class);
        $this->call(EmailTemplatesSeeder::class);
        $this->call(NotificationsTableSeeder::class);

        if(config('app.run_demo_seeder'))
        {
            $companyUser = User::where('email', 'company@example.com')->first() ?? User::where('type', 'company')->first() ?? User::first();
            $userId = $companyUser ? $companyUser->id : 1;
            (new DemoPosSeeder())->run($userId);
            (new DemoPosBillingCounterSeeder())->run($userId);
            (new DemoPosDiscountSeeder())->run($userId);
            (new DemoPosReturnSeeder())->run($userId);
        }
    }
}