<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sales_quote_items')) {
            Schema::create('sales_quote_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('quote_id')->index();
                $table->foreignId('product_id')->index();
                $table->integer('quantity');
                $table->decimal('unit_price', 15, 2);
                $table->decimal('discount_percentage', 5, 2)->default(0);
                $table->decimal('discount', 15, 2)->default(0);
                $table->decimal('tax_percentage', 5, 2)->default(0);

                $table->decimal('tax_amount', 15, 2)->default(0);
                $table->decimal('final_price', 15, 2)->default(0);
                $table->decimal('total_amount', 15, 2)->default(0);
                $table->text('description')->nullable();
                $table->foreignId('creator_id')->nullable()->index();
                $table->foreignId('created_by')->nullable()->index();

                $table->foreign('quote_id')->references('id')->on('sales_quotes')->onDelete('cascade');
                $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_quote_items');
    }
};
