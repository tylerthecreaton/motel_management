<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get all rentals for this user.
     */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    /**
     * Get the active rental for this user.
     */
    public function activeRental()
    {
        return $this->hasOne(Rental::class)
            ->where('status', 'active')
            ->latest();
    }

    /**
     * Get the roles for this user.
     * 
     * ดึงรายการ roles ของผู้ใช้
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')
            ->withTimestamps();
    }

    /**
     * Check if user has a specific role.
     * 
     * ตรวจสอบว่าผู้ใช้มี role ที่ระบุหรือไม่
     * 
     * @param string|array $roles
     * @return bool
     */
    public function hasRole($roles): bool
    {
        if (is_string($roles)) {
            return $this->roles()->where('name', $roles)->exists();
        }

        if (is_array($roles)) {
            return $this->roles()->whereIn('name', $roles)->exists();
        }

        return false;
    }

    /**
     * Check if user has any of the given roles.
     * 
     * ตรวจสอบว่าผู้ใช้มี role ใดๆ ที่ระบุหรือไม่
     * 
     * @param array $roles
     * @return bool
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Check if user has all of the given roles.
     * 
     * ตรวจสอบว่าผู้ใช้มี role ทั้งหมดที่ระบุหรือไม่
     * 
     * @param array $roles
     * @return bool
     */
    public function hasAllRoles(array $roles): bool
    {
        foreach ($roles as $role) {
            if (!$this->hasRole($role)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if user has a specific permission.
     * 
     * ตรวจสอบว่าผู้ใช้มี permission ที่ระบุหรือไม่ (ผ่าน roles)
     * 
     * @param string $permission
     * @return bool
     */
    public function hasPermission(string $permission): bool
    {
        foreach ($this->roles as $role) {
            if ($role->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Assign role to user.
     * 
     * กำหนด role ให้กับผู้ใช้
     * 
     * @param Role|int|string $role
     * @return void
     */
    public function assignRole($role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        if (is_int($role)) {
            $this->roles()->attach($role);
        } else {
            $this->roles()->attach($role->id);
        }
    }

    /**
     * Remove role from user.
     * 
     * ลบ role ออกจากผู้ใช้
     * 
     * @param Role|int|string $role
     * @return void
     */
    public function removeRole($role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        if (is_int($role)) {
            $this->roles()->detach($role);
        } else {
            $this->roles()->detach($role->id);
        }
    }

    /**
     * Sync roles for user.
     * 
     * ซิงค์ roles ของผู้ใช้ (ลบ roles เก่าและเพิ่ม roles ใหม่)
     * 
     * @param array $roles
     * @return void
     */
    public function syncRoles(array $roles): void
    {
        $this->roles()->sync($roles);
    }
}
