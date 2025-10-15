<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    /**
     * Get the users that have this role.
     * 
     * ดึงรายการผู้ใช้ที่มี role นี้
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user')
            ->withTimestamps();
    }

    /**
     * Get the permissions for this role.
     * 
     * ดึงรายการ permissions ที่ role นี้มี
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role')
            ->withTimestamps();
    }

    /**
     * Check if role has a specific permission.
     * 
     * ตรวจสอบว่า role มี permission ที่ระบุหรือไม่
     * 
     * @param string|Permission $permission
     * @return bool
     */
    public function hasPermission($permission): bool
    {
        if (is_string($permission)) {
            return $this->permissions()->where('name', $permission)->exists();
        }

        return $this->permissions()->where('id', $permission->id)->exists();
    }

    /**
     * Give permission to role.
     * 
     * เพิ่ม permission ให้กับ role
     * 
     * @param Permission|int $permission
     * @return void
     */
    public function givePermission($permission): void
    {
        if (is_int($permission)) {
            $this->permissions()->attach($permission);
        } else {
            $this->permissions()->attach($permission->id);
        }
    }

    /**
     * Revoke permission from role.
     * 
     * ลบ permission ออกจาก role
     * 
     * @param Permission|int $permission
     * @return void
     */
    public function revokePermission($permission): void
    {
        if (is_int($permission)) {
            $this->permissions()->detach($permission);
        } else {
            $this->permissions()->detach($permission->id);
        }
    }
}
