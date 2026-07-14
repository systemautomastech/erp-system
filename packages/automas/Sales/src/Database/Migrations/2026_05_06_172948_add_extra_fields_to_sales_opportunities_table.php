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
        if (Schema::hasTable('sales_opportunities')) {
            Schema::table('sales_opportunities', function (Blueprint $table) {
                if (!Schema::hasColumn('sales_opportunities', 'expected_amount')) {
                    $table->decimal('expected_amount', 15, 2)->nullable()->after('amount');
                }
                if (!Schema::hasColumn('sales_opportunities', 'lead_source')) {
                    $table->string('lead_source')->nullable();
                }
                if (!Schema::hasColumn('sales_opportunities', 'next_followup_date')) {
                    $table->date('next_followup_date')->nullable();
                }
                if (!Schema::hasColumn('sales_opportunities', 'next_step')) {
                    $table->string('next_step')->nullable();
                }
                if (!Schema::hasColumn('sales_opportunities', 'lost_reason')) {
                    $table->text('lost_reason')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_opportunities', function (Blueprint $table) {
                $table->dropColumn('expected_amount');
                $table->dropColumn('lead_source');
                $table->dropColumn('next_followup_date');
                $table->dropColumn('next_step');
                $table->dropColumn('lost_reason');
        });
    }
};
