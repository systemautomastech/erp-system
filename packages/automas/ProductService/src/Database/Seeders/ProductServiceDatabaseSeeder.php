<?php

namespace Automas\ProductService\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class ProductServiceDatabaseSeeder extends Seeder
{
    public function run()
    {
        Model::unguard();

        $this->call(PermissionTableSeeder::class);
        $this->call(MarketplaceSettingSeeder::class);

        if (config('app.run_demo_seeder')) {
            $companyUser = User::where('email', 'company@automas.com')->first() ?? User::where('type', 'company')->first() ?? User::first();
            $userId = $companyUser ? $companyUser->id : 1;

            (new DemoCategorySeeder())->run($userId);
            (new DemoTaxSeeder())->run($userId);
            (new DemoUnitSeeder())->run($userId);
            (new DemoProductServiceItemSeeder())->run($userId);
        }
    }
}
