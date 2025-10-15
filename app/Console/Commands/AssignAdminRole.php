<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;

class AssignAdminRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:assign-admin {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign admin role to a user by email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');

        // Find user by email
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return 1;
        }

        // Find admin role
        $adminRole = Role::where('name', 'admin')->first();

        if (!$adminRole) {
            $this->error("Admin role not found. Please run: php artisan db:seed --class=RolePermissionSeeder");
            return 1;
        }

        // Check if user already has admin role
        if ($user->hasRole('admin')) {
            $this->info("User '{$user->name}' already has admin role.");
            return 0;
        }

        // Assign admin role
        $user->assignRole($adminRole);

        $this->info("Admin role assigned to user '{$user->name}' ({$user->email}) successfully!");
        
        // Show user's current roles
        $this->info("Current roles: " . $user->roles->pluck('name')->join(', '));

        return 0;
    }
}
