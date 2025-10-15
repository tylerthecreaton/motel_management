<?php

namespace Database\Seeders;

use App\Models\Rental;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestRentalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // สร้าง user ทดสอบถ้ายังไม่มี
        $user = User::firstOrCreate(
            ['email' => 'tenant@test.com'],
            [
                'name' => 'Test Tenant',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // สร้างห้องทดสอบถ้ายังไม่มี
        $room = Room::firstOrCreate(
            ['name' => 'Room 101'],
            [
                'type' => 'Single Room',
                'price_per_month' => 5000,
                'status' => 'occupied',
                'description' => 'Test room for rental',
            ]
        );

        // สร้าง rental ที่ approved (เพราะ admin approve แล้ว)
        Rental::firstOrCreate(
            [
                'user_id' => $user->id,
                'room_id' => $room->id,
            ],
            [
                'start_date' => now(),
                'end_date' => now()->addMonths(12),
                'status' => 'approved', // เปลี่ยนเป็น approved
                'monthly_rent' => 5000,
                'total_price' => 60000,
                'contract_number' => 'CNT-' . now()->format('Ymd') . '-001',
                'contract_date' => now(),
                'deposit_amount' => 10000,
                'advance_payment' => 5000,
            ]
        );

        $this->command->info('Test rental with approved status created successfully!');
    }
}
