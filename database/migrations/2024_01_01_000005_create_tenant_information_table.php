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
        Schema::create('tenant_information', function (Blueprint $table) {
            $table->id();

            // Foreign key to rental
            $table->foreignId('rental_id')
                ->constrained()
                ->onDelete('cascade'); // ถ้าลบ rental จะลบข้อมูลผู้เข้าพักด้วย

            // ข้อมูลส่วนตัวผู้เข้าพัก
            $table->string('first_name'); // ชื่อ
            $table->string('last_name'); // นามสกุล
            $table->string('id_card_number', 13)->unique(); // เลขบัตรประชาชน 13 หลัก
            $table->date('date_of_birth'); // วันเกิด
            
            // ที่อยู่ปัจจุบัน
            $table->text('current_address'); // ที่อยู่ปัจจุบันแบบเต็ม
            $table->string('province'); // จังหวัด
            $table->string('district'); // อำเภอ/เขต
            $table->string('sub_district'); // ตำบล/แขวง
            $table->string('postal_code', 5); // รหัสไปรษณีย์

            // ข้อมูลติดต่อ
            $table->string('phone_number', 10); // เบอร์โทรศัพท์
            $table->string('email')->nullable(); // อีเมล (ถ้ามี)
            $table->string('line_id')->nullable(); // LINE ID (ถ้ามี)

            // ข้อมูลผู้ติดต่อฉุกเฉิน
            $table->string('emergency_contact_name'); // ชื่อผู้ติดต่อฉุกเฉิน
            $table->string('emergency_contact_relationship'); // ความสัมพันธ์ (เช่น พ่อ, แม่, พี่, น้อง)
            $table->string('emergency_contact_phone', 10); // เบอร์โทรผู้ติดต่อฉุกเฉิน

            // ข้อมูลอาชีพ
            $table->string('occupation'); // อาชีพ
            $table->string('workplace')->nullable(); // สถานที่ทำงาน/ศึกษา
            $table->decimal('monthly_income', 10, 2)->nullable(); // รายได้ต่อเดือน

            // เอกสารแนบ (เก็บ path ของไฟล์)
            $table->string('id_card_copy_path')->nullable(); // path สำเนาบัตรประชาชน
            $table->string('photo_path')->nullable(); // path รูปถ่าย
            $table->json('additional_documents')->nullable(); // เอกสารเพิ่มเติม (array of paths)

            $table->timestamps();

            // Indexes
            $table->index('rental_id');
            $table->index('id_card_number');
            $table->index('phone_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_information');
    }
};
