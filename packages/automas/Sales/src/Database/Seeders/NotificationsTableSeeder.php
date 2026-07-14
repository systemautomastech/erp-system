<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\Models\Notification;

class NotificationsTableSeeder extends Seeder
{
    public function run()
    {
        Model::unguard();

        $notifications = [
            'Create Meeting',
            'Create Account',
            'Create Opportunity',
            'Opportunity Move',
            'Create Quote',
            'Quote Status Update',
            'Create Sales Order',
            'Sales Order Status Update',
            'Create Contact',
        ];
        $permissions = [
            'manage-sales-meetings',
            'manage-sales-accounts',
            'manage-sales-opportunities',
            'edit-sales-opportunities',
            'manage-sales-quotes',
            'edit-sales-quotes',
            'manage-sales-orders',
            'edit-sales-orders',
            'manage-sales-contacts',
        ];
        foreach($notifications as $key=>$n){
            $ntfy = Notification::where('action',$n)->where('type','mail')->where('module','Sales')->count();
            if($ntfy == 0){
                $new = new Notification();
                $new->action = $n;
                $new->status = 'on';
                $new->permissions = $permissions[$key];
                $new->module = 'Sales';
                $new->type = 'mail';
                $new->save();
            }
        }
    }
}