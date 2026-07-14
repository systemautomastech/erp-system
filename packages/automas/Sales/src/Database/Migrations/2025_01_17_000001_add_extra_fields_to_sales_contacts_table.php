<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sales_contacts')) {
            Schema::table('sales_contacts', function (Blueprint $table) {
                $table->string('job_title')->nullable()->after('name');
                $table->string('lead_source')->nullable();
                $table->string('department')->nullable();
                $table->json('tags')->nullable();
                $table->text('social_media_urls')->nullable();
                $table->string('preferred_contact_method')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('sales_contacts')) {
            Schema::table('sales_contacts', function (Blueprint $table) {
                    $table->dropColumn('job_title');
                    $table->dropColumn('lead_source');
                    $table->dropColumn('department');
                    $table->dropColumn('tags');
                    $table->dropColumn('social_media_urls');
                    $table->dropColumn('preferred_contact_method');
            });
        }
    }
};
