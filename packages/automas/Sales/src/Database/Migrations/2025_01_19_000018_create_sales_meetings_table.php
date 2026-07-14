<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sales_meetings')) {
            Schema::create('sales_meetings', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('status')->default('scheduled');
                $table->string('meeting_type')->default('in_person');
                $table->dateTime('start_date');
                $table->dateTime('end_date');
                $table->string('parent_type')->nullable();
                $table->unsignedBigInteger('parent_id')->nullable();
                $table->foreignId('account_id')->nullable()->index();
                $table->foreignId('assigned_user_id')->nullable()->index();
                $table->text('description')->nullable();
                $table->json('attendees_users')->nullable();
                $table->json('attendees_contacts')->nullable();
                $table->boolean('is_active')->default(true);
                $table->foreignId('creator_id')->nullable()->index();
                $table->foreignId('created_by')->nullable()->index();

                $table->foreign('account_id')->references('id')->on('sales_accounts')->onDelete('set null');
                $table->foreign('assigned_user_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_meetings');
    }
};