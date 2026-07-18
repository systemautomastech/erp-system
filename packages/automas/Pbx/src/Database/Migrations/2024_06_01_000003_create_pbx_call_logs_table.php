<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('pbx_call_logs')) {
            Schema::create('pbx_call_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('extension', 20)->nullable();
                $table->string('direction', 20)->nullable();
                $table->string('from_number', 50)->nullable();
                $table->string('to_number', 50)->nullable();
                $table->string('status', 50)->nullable();
                $table->string('uniqueid', 100)->nullable();
                $table->string('linkedid', 100)->nullable();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('answered_at')->nullable();
                $table->timestamp('ended_at')->nullable();
                $table->unsignedInteger('duration')->default(0);
                $table->string('recording_url')->nullable();
                $table->json('raw_payload')->nullable();
                $table->foreignId('creator_id')->nullable()->index();
                $table->foreignId('created_by')->nullable()->index();
                $table->timestamps();

                $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
                $table->index('uniqueid');
                $table->index('linkedid');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pbx_call_logs');
    }
};
