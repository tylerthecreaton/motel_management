<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * สร้าง roles และ permissions เริ่มต้น
     */
    public function run(): void
    {
        // สร้าง Permissions
        $permissions = [
            // User Management
            ['name' => 'view-users', 'display_name' => 'View Users', 'description' => 'Can view user list', 'group' => 'users'],
            ['name' => 'create-users', 'display_name' => 'Create Users', 'description' => 'Can create new users', 'group' => 'users'],
            ['name' => 'edit-users', 'display_name' => 'Edit Users', 'description' => 'Can edit user information', 'group' => 'users'],
            ['name' => 'delete-users', 'display_name' => 'Delete Users', 'description' => 'Can delete users', 'group' => 'users'],
            
            // Room Management
            ['name' => 'view-rooms', 'display_name' => 'View Rooms', 'description' => 'Can view room list', 'group' => 'rooms'],
            ['name' => 'create-rooms', 'display_name' => 'Create Rooms', 'description' => 'Can create new rooms', 'group' => 'rooms'],
            ['name' => 'edit-rooms', 'display_name' => 'Edit Rooms', 'description' => 'Can edit room information', 'group' => 'rooms'],
            ['name' => 'delete-rooms', 'display_name' => 'Delete Rooms', 'description' => 'Can delete rooms', 'group' => 'rooms'],
            
            // Booking Management
            ['name' => 'view-bookings', 'display_name' => 'View Bookings', 'description' => 'Can view all bookings', 'group' => 'bookings'],
            ['name' => 'approve-bookings', 'display_name' => 'Approve Bookings', 'description' => 'Can approve booking requests', 'group' => 'bookings'],
            ['name' => 'reject-bookings', 'display_name' => 'Reject Bookings', 'description' => 'Can reject booking requests', 'group' => 'bookings'],
            
            // Role Management
            ['name' => 'view-roles', 'display_name' => 'View Roles', 'description' => 'Can view role list', 'group' => 'roles'],
            ['name' => 'create-roles', 'display_name' => 'Create Roles', 'description' => 'Can create new roles', 'group' => 'roles'],
            ['name' => 'edit-roles', 'display_name' => 'Edit Roles', 'description' => 'Can edit role information', 'group' => 'roles'],
            ['name' => 'delete-roles', 'display_name' => 'Delete Roles', 'description' => 'Can delete roles', 'group' => 'roles'],
            ['name' => 'assign-roles', 'display_name' => 'Assign Roles', 'description' => 'Can assign roles to users', 'group' => 'roles'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // สร้าง Roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'description' => 'Full system access with all permissions'
            ]
        );

        $managerRole = Role::firstOrCreate(
            ['name' => 'manager'],
            [
                'display_name' => 'Manager',
                'description' => 'Can manage rooms and bookings'
            ]
        );

        $userRole = Role::firstOrCreate(
            ['name' => 'user'],
            [
                'display_name' => 'User',
                'description' => 'Regular user with basic access'
            ]
        );

        // กำหนด Permissions ให้กับ Roles
        
        // Admin มีสิทธิ์ทั้งหมด
        $adminRole->permissions()->sync(Permission::all());

        // Manager มีสิทธิ์จัดการห้องและการจอง
        $managerPermissions = Permission::whereIn('name', [
            'view-users',
            'view-rooms', 'create-rooms', 'edit-rooms', 'delete-rooms',
            'view-bookings', 'approve-bookings', 'reject-bookings',
        ])->pluck('id');
        $managerRole->permissions()->sync($managerPermissions);

        // User มีสิทธิ์พื้นฐาน (ดูห้อง)
        $userPermissions = Permission::whereIn('name', [
            'view-rooms',
        ])->pluck('id');
        $userRole->permissions()->sync($userPermissions);

        $this->command->info('Roles and Permissions seeded successfully!');
    }
}
