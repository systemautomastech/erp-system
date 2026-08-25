<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchase_invoices', function (Blueprint $table) {
            $table->unsignedBigInteger('vendor_id')->nullable()->change();
            $table->string('vendor_name')->nullable()->after('vendor_id');
            $table->string('vendor_email')->nullable()->after('vendor_name');
            $table->string('vendor_phone')->nullable()->after('vendor_email');
            $table->text('vendor_address')->nullable()->after('vendor_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_invoices', function (Blueprint $table) {
            $table->dropColumn(['vendor_name', 'vendor_email', 'vendor_phone', 'vendor_address']);
        });
    }
};
