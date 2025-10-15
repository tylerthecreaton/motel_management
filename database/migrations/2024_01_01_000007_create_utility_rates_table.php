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
        Schema::create('utility_rates', function (Blueprint $table) {
            $table->id();
            // ราคาค่าไฟฟ้าต่อหน่วย (บาท/kWh)
            $table->decimal('electricity_rate_per_unit', 8, 2)->default(0);
            // ราคาค่าน้ำรายเดือน (บาทต่อเดือน)
            $table->decimal('water_flat_rate', 8, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utility_rates');
    }
};
