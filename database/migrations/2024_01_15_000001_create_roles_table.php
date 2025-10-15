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
        // สร้างตาราง roles สำหรับเก็บบทบาทต่างๆ
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // ชื่อ role เช่น admin, manager, user
            $table->string('display_name'); // ชื่อแสดงผล เช่น Administrator, Manager
            $table->text('description')->nullable(); // คำอธิบาย role
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
