<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sales_orders')) {
            Schema::create('sales_orders', function (Blueprint $table) {
                $table->id();
                $table->string('order_number')->nullable();
                $table->string('name');
                $table->foreignId('quote_id')->nullable()->index();
                $table->foreignId('opportunity_id')->nullable()->index();
                $table->foreignId('account_id')->nullable()->index();
                $table->foreignId('customer_id')->nullable()->index();
                $table->foreignId('warehouse_id')->nullable()->index();
                $table->string('status');
                $table->date('order_date');
                $table->text('billing_address')->nullable();
                $table->text('shipping_address')->nullable();
                $table->string('billing_city')->nullable();
                $table->string('billing_state')->nullable();
                $table->string('shipping_city')->nullable();
                $table->string('shipping_state')->nullable();
                $table->string('billing_country')->nullable();
                $table->string('billing_postal_code')->nullable();
                $table->string('shipping_country')->nullable();
                $table->string('shipping_postal_code')->nullable();
                $table->foreignId('billing_contact_id')->nullable()->index();
                $table->foreignId('shipping_contact_id')->nullable()->index();
                $table->foreignId('shipping_provider_id')->nullable()->index();
                $table->foreignId('assign_user_id')->nullable()->index();
                $table->text('description')->nullable();
                $table->decimal('subtotal', 15, 2)->default(0);
                $table->decimal('tax_amount', 15, 2)->default(0);
                $table->decimal('discount_amount', 15, 2)->default(0);
                $table->decimal('total_amount', 15, 2)->default(0);
                $table->text('notes')->nullable();
                $table->boolean('is_invoiced')->default(false);
                $table->foreignId('invoice_id')->nullable()->index();
                $table->foreignId('creator_id')->nullable()->index();
                $table->foreignId('created_by')->nullable()->index();

                $table->foreign('quote_id')->references('id')->on('sales_quotes')->onDelete('set null');
                $table->foreign('opportunity_id')->references('id')->on('sales_opportunities')->onDelete('set null');
                $table->foreign('account_id')->references('id')->on('sales_accounts')->onDelete('set null');
                $table->foreign('customer_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('billing_contact_id')->references('id')->on('sales_contacts')->onDelete('set null');
                $table->foreign('shipping_contact_id')->references('id')->on('sales_contacts')->onDelete('set null');
                $table->foreign('shipping_provider_id')->references('id')->on('sales_shipping_providers')->onDelete('set null');
                $table->foreign('assign_user_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

                $table->timestamps();
            });
        }
        
        // Add foreign key constraint for quotes table after sales_orders is created
        if (Schema::hasTable('sales_quotes') && Schema::hasColumn('sales_quotes', 'converted_salesorder_id')) {
            Schema::table('sales_quotes', function (Blueprint $table) {
                $table->foreign('converted_salesorder_id')->references('id')->on('sales_orders')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        // Drop foreign key constraint from sales_quotes first
        if (Schema::hasTable('sales_quotes')) {
            Schema::table('sales_quotes', function (Blueprint $table) {
                $table->dropForeign(['converted_salesorder_id']);
            });
        }
        
        Schema::dropIfExists('sales_orders');
    }
};