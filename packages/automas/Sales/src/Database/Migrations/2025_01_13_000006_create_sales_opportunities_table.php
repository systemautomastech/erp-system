<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sales_opportunities')) {
            Schema::create('sales_opportunities', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('account_id')->nullable()->index();
                $table->foreignId('contact_id')->nullable()->index();
                $table->foreignId('stage_id')->nullable()->index();
                $table->decimal('amount', 15, 2)->default(0);
                $table->integer('probability')->default(0);
                $table->date('close_date');
                $table->foreignId('assign_user_id')->nullable()->index();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->foreignId('creator_id')->nullable()->index();
                $table->foreignId('created_by')->nullable()->index();

                $table->foreign('account_id')->references('id')->on('sales_accounts')->onDelete('set null');
                $table->foreign('contact_id')->references('id')->on('sales_contacts')->onDelete('set null');
                $table->foreign('stage_id')->references('id')->on('sales_opportunity_stages')->onDelete('set null');
                $table->foreign('assign_user_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_opportunities');
    }
};