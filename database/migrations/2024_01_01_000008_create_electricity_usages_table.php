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
        Schema::create('electricity_usages', function (Blueprint $table) {
            $table->id();
            // Foreign key ไปยังตาราง rooms
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            // วันที่บันทึกมิเตอร์
            $table->date('reading_date');
            // เลขมิเตอร์ครั้งก่อน
            $table->integer('previous_units')->default(0);
            // เลขมิเตอร์ครั้งปัจจุบัน
            $table->integer('current_units');
            // จำนวนหน่วยที่ใช้ (current_units - previous_units)
            $table->integer('units_used')->default(0);
            // สถานะการออกบิล
            $table->boolean('is_billed')->default(false);
            $table->timestamps();

            // Index สำหรับการค้นหา
            $table->index(['room_id', 'reading_date']);
            $table->index('is_billed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('electricity_usages');
    }
};
