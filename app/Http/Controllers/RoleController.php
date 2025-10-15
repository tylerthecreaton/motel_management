<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Get all roles with permissions.
     * 
     * ดึงรายการ roles ทั้งหมดพร้อม permissions
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $roles = Role::with(['permissions', 'users'])
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ], 200);
    }

    /**
     * Get a specific role with details.
     * 
     * ดึงข้อมูล role ตาม ID พร้อมรายละเอียด
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $role = Role::with(['permissions', 'users'])
            ->withCount('users')
            ->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $role,
        ], 200);
    }

    /**
     * Create a new role.
     * 
     * สร้าง role ใหม่
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles', 'regex:/^[a-z0-9-]+$/'],
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
        ]);

        // Attach permissions if provided
        if (!empty($validated['permissions'])) {
            $role->permissions()->attach($validated['permissions']);
        }

        $role->load('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully.',
            'data' => $role,
        ], 201);
    }

    /**
     * Update an existing role.
     * 
     * อัพเดทข้อมูล role
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found.',
            ], 404);
        }

        // ป้องกันการแก้ไข role พื้นฐาน
        if (in_array($role->name, ['admin', 'manager', 'user'])) {
            // อนุญาตให้แก้ไขเฉพาะ permissions
            $validated = $request->validate([
                'permissions' => ['nullable', 'array'],
                'permissions.*' => ['exists:permissions,id'],
            ]);

            if (isset($validated['permissions'])) {
                $role->permissions()->sync($validated['permissions']);
            }
        } else {
            // Role ที่สร้างเอง แก้ไขได้ทั้งหมด
            $validated = $request->validate([
                'name' => ['sometimes', 'required', 'string', 'max:255', 'unique:roles,name,' . $id, 'regex:/^[a-z0-9-]+$/'],
                'display_name' => ['sometimes', 'required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'permissions' => ['nullable', 'array'],
                'permissions.*' => ['exists:permissions,id'],
            ]);

            $role->update([
                'name' => $validated['name'] ?? $role->name,
                'display_name' => $validated['display_name'] ?? $role->display_name,
                'description' => $validated['description'] ?? $role->description,
            ]);

            if (isset($validated['permissions'])) {
                $role->permissions()->sync($validated['permissions']);
            }
        }

        $role->load('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully.',
            'data' => $role,
        ], 200);
    }

    /**
     * Delete a role.
     * 
     * ลบ role
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found.',
            ], 404);
        }

        // ป้องกันการลบ role พื้นฐาน
        if (in_array($role->name, ['admin', 'manager', 'user'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete system roles (admin, manager, user).',
            ], 400);
        }

        // ตรวจสอบว่ามี user ใช้ role นี้อยู่หรือไม่
        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete role that is assigned to users.',
            ], 400);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully.',
        ], 200);
    }

    /**
     * Get all available permissions.
     * 
     * ดึงรายการ permissions ทั้งหมด
     * 
     * @return JsonResponse
     */
    public function permissions(): JsonResponse
    {
        $permissions = Permission::orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy('group');

        return response()->json([
            'success' => true,
            'data' => $permissions,
        ], 200);
    }
}
