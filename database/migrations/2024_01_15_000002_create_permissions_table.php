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
        // สร้างตาราง permissions สำหรับเก็บสิทธิ์การเข้าถึงต่างๆ
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // ชื่อ permission เช่น create-users, edit-rooms
            $table->string('display_name'); // ชื่อแสดงผล เช่น Create Users, Edit Rooms
            $table->text('description')->nullable(); // คำอธิบาย permission
            $table->string('group')->nullable(); // กลุ่ม เช่น users, rooms, bookings
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
