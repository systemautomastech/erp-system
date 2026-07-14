<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if(!Schema::hasTable('sales_cases'))
        {
            Schema::create('sales_cases', function (Blueprint $table) {
                $table->id();
                $table->string('case_number');
                $table->string('name');
                $table->enum('status', ['new', 'assigned', 'pending', 'closed', 'rejected', 'duplicate'])->default('new');
                $table->string('priority')->default('medium');
                $table->text('description')->nullable();
                $table->string('attachment')->nullable();
                $table->foreignId('account_id')->nullable()->index();
                $table->foreignId('contact_id')->nullable()->index();
                $table->foreignId('case_type_id')->nullable()->index();
                $table->foreignId('assign_user_id')->nullable()->index();
                $table->foreignId('creator_id')->nullable()->index();
                $table->foreignId('created_by')->nullable()->index();

                $table->foreign('account_id')->references('id')->on('sales_accounts')->onDelete('set null');
                $table->foreign('contact_id')->references('id')->on('sales_contacts')->onDelete('set null');
                $table->foreign('case_type_id')->references('id')->on('sales_case_types')->onDelete('set null');
                $table->foreign('assign_user_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_cases');
    }
};