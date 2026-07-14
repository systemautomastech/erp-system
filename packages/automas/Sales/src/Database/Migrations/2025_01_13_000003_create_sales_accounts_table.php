<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sales_accounts')) {
            Schema::create('sales_accounts', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email');
                $table->string('phone');
                $table->string('website')->nullable();
                
                // Billing Address
                $table->text('billing_address')->nullable();
                $table->string('billing_city')->nullable();
                $table->string('billing_state')->nullable();
                $table->string('billing_country')->nullable();
                $table->string('billing_postal_code')->nullable();
                
                // Shipping Address
                $table->text('shipping_address')->nullable();
                $table->string('shipping_city')->nullable();
                $table->string('shipping_state')->nullable();
                $table->string('shipping_country')->nullable();
                $table->string('shipping_postal_code')->nullable();
                
                // Detail Section
                $table->foreignId('assign_user_id')->nullable()->index();
                $table->foreignId('type_id')->nullable()->index();
                $table->foreignId('industry_id')->nullable()->index();
                $table->foreignId('sales_document_id')->nullable()->index();
                $table->text('description')->nullable();
                
                $table->boolean('is_active')->default(true);
                $table->foreignId('creator_id')->nullable()->index();
                $table->foreignId('created_by')->nullable()->index();

                $table->foreign('assign_user_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('type_id')->references('id')->on('sales_account_types')->onDelete('set null');
                $table->foreign('industry_id')->references('id')->on('sales_account_industries')->onDelete('set null');
                $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_accounts');
    }
};