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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();

            // ข้อมูลพื้นฐานของห้อง
            $table->string('name'); // เช่น "ห้อง 101"
            $table->string('type'); // เช่น "ห้องเดี่ยว", "ห้องคู่"
            $table->decimal('price_per_month', 10, 2); // ราคาเช่าต่อเดือน

            // สถานะห้อง
            $table->enum('status', ['available', 'occupied', 'maintenance'])
                ->default('available');

            // ข้อมูลเพิ่มเติม
            $table->text('description')->nullable(); // รายละเอียดห้อง
            $table->string('image_path')->nullable(); // path รูปภาพหลักของห้อง
            $table->json('amenities')->nullable(); // สิ่งอำนวยความสะดวก เช่น ["wifi", "air_con", "water_heater"]

            $table->timestamps();

            // Indexes สำหรับการค้นหาที่รวดเร็ว
            $table->index('status');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
