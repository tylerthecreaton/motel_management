<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // สร้าง Admin User
        User::firstOrCreate(
            ['email' => 'admin@motel.com'],
            [
                'name' => 'Admin',
                'password' => 'password', // จะถูก hash อัตโนมัติ
                'email_verified_at' => now(),
            ]
        );

        // สร้าง Test User สำหรับทดสอบ
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        // แสดงข้อมูล login ใน console
        $this->command->info('✅ Users created successfully!');
        $this->command->newLine();
        $this->command->info('📧 Admin Login:');
        $this->command->info('   Email: admin@motel.com');
        $this->command->info('   Password: password');
        $this->command->newLine();
        $this->command->info('📧 Test User Login:');
        $this->command->info('   Email: test@example.com');
        $this->command->info('   Password: password');
    }
}
