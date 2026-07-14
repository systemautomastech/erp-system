<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if(!Schema::hasTable('sales_order_item_taxes'))
        {
            Schema::create('sales_order_item_taxes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('item_id')->index();
                $table->string('tax_name');
                $table->decimal('tax_rate', 5, 2);
                $table->timestamps();

                $table->foreign('item_id')->references('id')->on('sales_order_items')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_order_item_taxes');
    }
};
