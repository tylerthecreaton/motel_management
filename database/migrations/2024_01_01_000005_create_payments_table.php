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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            // Foreign key
            $table->foreignId('rental_id')
                ->constrained()
                ->onDelete('cascade'); // ถ้าลบ rental จะลบ payment ด้วย

            // ข้อมูลการชำระเงิน
            $table->decimal('amount', 10, 2); // จำนวนเงินที่ชำระ
            $table->date('payment_date'); // วันที่ชำระเงิน

            // สถานะการชำระเงิน
            $table->enum('status', [
                'pending',  // รอการชำระ
                'paid',     // ชำระแล้ว
                'failed'    // ชำระไม่สำเร็จ
            ])->default('pending');

            $table->string('payment_method'); // วิธีการชำระเงิน เช่น "โอนเงิน", "PromptPay"
            $table->string('slip_image_path')->nullable(); // path รูปสลิปการโอนเงิน

            $table->timestamps();

            // Indexes สำหรับการค้นหาที่รวดเร็ว
            $table->index('rental_id');
            $table->index('status');
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
