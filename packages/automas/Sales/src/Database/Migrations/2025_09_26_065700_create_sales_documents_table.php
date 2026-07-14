<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sales_documents')) {
            Schema::create('sales_documents', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('account_id')->nullable()->index();
                $table->foreignId('folder_id')->nullable()->index();
                $table->foreignId('type_id')->nullable()->index();
                $table->foreignId('opportunity_id')->nullable()->index();
                $table->string('status')->default('draft');
                $table->date('publish_date')->nullable();
                $table->date('expiration_date')->nullable();
                $table->string('attachment')->nullable();
                $table->foreignId('assign_user_id')->nullable()->index();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->foreignId('creator_id')->nullable()->index();
                $table->foreignId('created_by')->nullable()->index();

                $table->foreign('account_id')->references('id')->on('sales_accounts')->onDelete('set null');
                $table->foreign('folder_id')->references('id')->on('sales_document_folders')->onDelete('set null');
                $table->foreign('type_id')->references('id')->on('sales_document_types')->onDelete('set null');
                $table->foreign('opportunity_id')->references('id')->on('sales_opportunities')->onDelete('set null');
                $table->foreign('assign_user_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_documents');
    }
};
