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
        Schema::create('proposal_general_settings', function (Blueprint $table) {
            $table->id();
            $table->string('proposal_number_prefix');
            $table->unsignedInteger('next_starting_number');
            $table->unsignedSmallInteger('validity_period_days')->default(30);
            $table->;
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_general_settings');
    }
};
