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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            // Foreign key ไปยังตาราง rentals
            $table->foreignId('rental_id')->constrained('rentals')->onDelete('cascade');
            // เลขที่ใบแจ้งหนี้ (ต้องไม่ซ้ำ)
            $table->string('invoice_number')->unique();
            // วันที่ออกใบแจ้งหนี้
            $table->date('issue_date');
            // วันครบกำหนดชำระ
            $table->date('due_date');
            // ค่าเช่าห้อง
            $table->decimal('room_rent', 10, 2)->default(0);
            // ค่าไฟฟ้า
            $table->decimal('electricity_charge', 10, 2)->default(0);
            // ค่าน้ำ
            $table->decimal('water_charge', 10, 2)->default(0);
            // ยอดรวมทั้งหมด
            $table->decimal('total_amount', 10, 2)->default(0);
            // สถานะการชำระเงิน
            $table->enum('status', ['unpaid', 'paid', 'overdue'])->default('unpaid');
            $table->timestamps();

            // Index สำหรับการค้นหา
            $table->index('rental_id');
            $table->index('status');
            $table->index('issue_date');
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
