<?php

namespace Automas\Taskly\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Automas\Taskly\Models\BugStage;
use Automas\Taskly\Models\TaskStage;

class TasklyDatabaseSeeder extends Seeder
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

            TaskStage::defaultdata($userId);
            BugStage::defaultdata($userId);

            (new DemoProjectSeeder())->run($userId);
            (new DemoProjectMilestoneSeeder())->run($userId);
            (new DemoProjectTaskSeeder())->run($userId);
            (new DemoProjectBugSeeder())->run($userId);
            (new DemoActivityLogSeeder())->run($userId);
            (new DemoProjectPaymentSeeder())->run($userId);
        }
    }
}
