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
        Schema::table('rentals', function (Blueprint $table) {
            // ข้อมูลสัญญา
            $table->string('contract_number')->unique()->nullable()->after('room_id'); // เลขที่สัญญา
            $table->date('contract_date')->nullable()->after('contract_number'); // วันที่ทำสัญญา

            // ข้อมูลการเงิน
            $table->decimal('deposit_amount', 10, 2)->default(0)->after('total_price'); // ค่าเช่ามัดจำ
            $table->decimal('advance_payment', 10, 2)->default(0)->after('deposit_amount'); // ค่าเช่าล่วงหน้า
            $table->decimal('monthly_rent', 10, 2)->after('advance_payment'); // ค่าเช่าต่อเดือน (คัดลอกจาก room)

            // เงื่อนไขพิเศษ
            $table->text('special_conditions')->nullable()->after('monthly_rent'); // เงื่อนไขพิเศษในสัญญา

            // หมายเหตุ
            $table->text('notes')->nullable()->after('special_conditions'); // หมายเหตุเพิ่มเติม

            // Index
            $table->index('contract_number');
            $table->index('contract_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            $table->dropIndex(['contract_number']);
            $table->dropIndex(['contract_date']);

            $table->dropColumn([
                'contract_number',
                'contract_date',
                'deposit_amount',
                'advance_payment',
                'monthly_rent',
                'special_conditions',
                'notes',
            ]);
        });
    }
};
