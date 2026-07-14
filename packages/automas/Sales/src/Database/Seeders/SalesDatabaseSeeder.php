<?php

namespace Automas\Sales\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class SalesDatabaseSeeder extends Seeder
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
            // Add here your demo data seeders
            $userId = User::where('email', 'company@example.com')->first()->id;
            (new DemoAccountTypeSeeder())->run($userId);
            (new DemoAccountIndustrySeeder())->run($userId);
            (new DemoSalesAccountSeeder())->run($userId);
            (new DemoSalesContactSeeder())->run($userId);
            (new SalesOpportunityStageSeeder())->run($userId);
            (new DemoSalesOpportunitySeeder())->run($userId);
            (new DemoSalesShippingProviderSeeder())->run($userId);
            (new DemoSalesQuoteSeeder())->run($userId);
            (new DemoSalesOrderSeeder())->run($userId);
            (new DemoCaseTypeSeeder())->run($userId);
            (new DemoSalesCaseSeeder())->run($userId);
            (new DemoSalesDocumentTypeSeeder())->run($userId);
            (new DemoSalesDocumentFolderSeeder())->run($userId);
            (new DemoSalesDocumentSeeder())->run($userId);
            (new DemoSalesCallSeeder())->run($userId);
            (new DemoSalesMeetingSeeder())->run($userId);
            (new DemoSalesStreamSeeder())->run($userId);
        }
    }
}