<?php

namespace Automas\SupportTicket\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class SupportTicketDatabaseSeeder extends Seeder
{
    public function run()
    {
        Model::unguard();
        $this->call(EmailTemplateTableSeeder::class);
        $this->call(NotificationsTableSeeder::class);
        $this->call(PermissionTableSeeder::class);
        $this->call(DefultSettingTableSeeder::class);
        $this->call(MarketplaceSettingSeeder::class);

        if (config('app.run_demo_seeder')) {
            // Add here your demo data seeders
            $companyUser = User::where('email', 'company@example.com')->first() ?? User::where('type', 'company')->first() ?? User::first();
            $userId = $companyUser ? $companyUser->id : 1;
            (new DemoTicketCategorySeeder())->run($userId);
            (new DemoKnowledgeBaseCategorySeeder())->run($userId);
            (new DemoCustomPageSeeder())->run($userId);
            (new DemoSupportTicketSettingsSeeder())->run($userId);
            (new DemoTicketSeeder())->run($userId);
            (new DemoKnowledgeBaseSeeder())->run($userId);
            (new DemoFaqSeeder())->run($userId);
            (new DemoContactSeeder())->run($userId);
            (new DemoQuickLinkSeeder())->run($userId);
        }
    }
}





































































































