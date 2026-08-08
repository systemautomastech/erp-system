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
            $table->unsignedInteger('proposal_starting_number')->default(1);
            $table->unsignedSmallInteger('default_validity_days')->default(30);
            $table->string('logo_image')->nullable();
            $table->string('background_image')->nullable();
            $table->text('default_terms')->nullable();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique('creator_id');
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

