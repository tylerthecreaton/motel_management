<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * สร้าง admin user เริ่มต้น
     */
    public function run(): void
    {
        // สร้าง admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@motel.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // หา admin role
        $adminRole = Role::where('name', 'admin')->first();

        if ($adminRole) {
            // กำหนด admin role ให้ user (ถ้ายังไม่มี)
            if (!$admin->hasRole('admin')) {
                $admin->assignRole($adminRole);
                $this->command->info('Admin role assigned to admin@motel.com');
            } else {
                $this->command->info('Admin user already has admin role');
            }
        } else {
            $this->command->error('Admin role not found. Please run RolePermissionSeeder first.');
        }

        $this->command->info('Admin user created/updated successfully!');
        $this->command->info('Email: admin@motel.com');
        $this->command->info('Password: password');
    }
}
