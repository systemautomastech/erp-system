<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('proposal_settings', function (Blueprint $table) {
            $table->id();
            $table->string('proposal_prefix')->default('PRO');
            $table->integer('proposal_starting_number')->default(1);
            $table->integer('default_validity_days')->default(30);
            $table->string('logo_image');
            $table->string('background_image');
            $table->string('bill_footer');
            $table->longtext('default_terms');
            // $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            // $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_settings');
    }
};
