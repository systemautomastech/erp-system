<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesStream;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesCase;
use Automas\Sales\Models\SalesDocument;
use App\Models\User;
use Faker\Factory as Faker;

class DemoSalesStreamSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesStream::where('created_by', $userId)->exists()) {
            return;
        }

        $faker = Faker::create();
        
        $accounts = SalesAccount::where('created_by', $userId)->get();
        $contacts = SalesContact::where('created_by', $userId)->get();
        $opportunities = SalesOpportunity::where('created_by', $userId)->get();
        $cases = SalesCase::where('created_by', $userId)->get();
        $documents = SalesDocument::where('created_by', $userId)->get();
        $users = User::emp()->where('created_by', $userId)->pluck('id')->toArray();
        $users[] = $userId;
        
        if ($accounts->isEmpty() && $contacts->isEmpty() && $opportunities->isEmpty() && $cases->isEmpty()) {
            return;
        }
        
        // Only create if less than 20 total records exist
        $existingCount = SalesStream::count();
        if ($existingCount >= 20) {
            return;
        }
        
        $recordsToCreate = min(20 - $existingCount, 20);

        $logTypes = ['create', 'update', 'delete', 'comment', 'file_upload', 'status_change', 'assignment'];
        
        $messages = [
            'account' => ['Account created', 'Account updated', 'Account profile modified', 'Account status changed'],
            'contact' => ['Contact added', 'Contact information updated', 'Contact details modified', 'Contact status changed'],
            'opportunity' => ['Opportunity created', 'Opportunity updated', 'Deal progress updated', 'Opportunity status changed'],
            'case' => ['Case opened', 'Case updated', 'Case status modified', 'Case resolved'],
            'document' => ['Document uploaded', 'Document updated', 'Document shared', 'Document status changed']
        ];

        $allModules = [];
        foreach ($accounts as $account) {
            $allModules[] = ['type' => 'account', 'id' => $account->id];
        }
        foreach ($contacts as $contact) {
            $allModules[] = ['type' => 'contact', 'id' => $contact->id];
        }
        foreach ($opportunities as $opportunity) {
            $allModules[] = ['type' => 'opportunity', 'id' => $opportunity->id];
        }
        foreach ($cases as $case) {
            $allModules[] = ['type' => 'case', 'id' => $case->id];
        }
        foreach ($documents as $document) {
            $allModules[] = ['type' => 'document', 'id' => $document->id];
        }
        
        for ($i = 0; $i < $recordsToCreate; $i++) {
            $module = $faker->randomElement($allModules);
            $logType = $faker->randomElement($logTypes);
            $remark = $faker->randomElement($messages[$module['type']]);
            
            // Get assigned user based on module type
            $assignedUserId = $userId;
            if ($module['type'] == 'account') {
                $account = $accounts->find($module['id']);
                $assignedUserId = $account->assign_user_id ?? $userId;
            } elseif ($module['type'] == 'contact') {
                $contact = $contacts->find($module['id']);
                $assignedUserId = $contact->assign_user_id ?? $userId;
            } elseif ($module['type'] == 'opportunity') {
                $opportunity = $opportunities->find($module['id']);
                $assignedUserId = $opportunity->assign_user_id ?? $userId;
            } elseif ($module['type'] == 'case') {
                $case = $cases->find($module['id']);
                $assignedUserId = $case->assign_user_id ?? $userId;
            }
            
            SalesStream::create([
                'user_id' => $assignedUserId,
                'log_type' => $logType,
                'file_upload' => null,
                'remark' => $remark,
                'module_type' => $module['type'],
                'module_id' => $module['id'],
                'creator_id' => $userId,
                'created_by' => $userId,
                'created_at' => now()->subDays(rand(0, 60)),
            ]);
        }
    }
}