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
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade'); // ถ้าลบ user จะลบ rental ด้วย

            $table->foreignId('room_id')
                ->constrained()
                ->onDelete('cascade'); // ถ้าลบ room จะลบ rental ด้วย

            // ข้อมูลการเช่า
            $table->date('start_date'); // วันที่เริ่มเช่า
            $table->date('end_date'); // วันที่สิ้นสุดการเช่า

            // สถานะการเช่า
            $table->enum('status', [
                'pending',    // รอการอนุมัติ
                'approved',   // อนุมัติแล้ว
                'active',     // กำลังเช่าอยู่
                'completed',  // เช่าเสร็จสิ้น
                'cancelled'   // ยกเลิก
            ])->default('pending');

            $table->decimal('total_price', 10, 2); // ราคารวมทั้งหมด

            $table->timestamps();

            // Indexes สำหรับการค้นหาที่รวดเร็ว
            $table->index('user_id');
            $table->index('room_id');
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
