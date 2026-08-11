<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sales_proposal_tariffs')) {
            Schema::create('sales_proposal_tariffs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('proposal_id')->constrained('sales_proposals')->cascadeOnDelete();
                $table->string('particulars')->nullable();
                $table->decimal('tariff_per_min', 10, 4)->default(0)->nullable();
                $table->string('brand')->nullable();
                $table->decimal('qty', 10, 2)->default(1)->nullable();
                $table->string('pulse_per_min')->nullable();
                $table->integer('sort_order')->default(0);
                $table->timestamps();

                $table->index('proposal_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_proposal_tariffs');
    }
};
