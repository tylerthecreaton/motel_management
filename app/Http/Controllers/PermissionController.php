<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    /**
     * Get all permissions.
     * 
     * ดึงรายการ permissions ทั้งหมด
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::with('roles')
            ->orderBy('group')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $permissions,
        ], 200);
    }

    /**
     * Get permissions grouped by category.
     * 
     * ดึง permissions แบบจัดกลุ่ม
     * 
     * @return JsonResponse
     */
    public function grouped(): JsonResponse
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

    /**
     * Create a new permission.
     * 
     * สร้าง permission ใหม่
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions', 'regex:/^[a-z0-9-]+$/'],
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'group' => ['nullable', 'string', 'max:255'],
        ]);

        $permission = Permission::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Permission created successfully.',
            'data' => $permission,
        ], 201);
    }

    /**
     * Update an existing permission.
     * 
     * อัพเดทข้อมูล permission
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', 'unique:permissions,name,' . $id, 'regex:/^[a-z0-9-]+$/'],
            'display_name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'group' => ['nullable', 'string', 'max:255'],
        ]);

        $permission->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Permission updated successfully.',
            'data' => $permission,
        ], 200);
    }

    /**
     * Delete a permission.
     * 
     * ลบ permission
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission not found.',
            ], 404);
        }

        // ตรวจสอบว่ามี role ใช้ permission นี้อยู่หรือไม่
        if ($permission->roles()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete permission that is assigned to roles.',
            ], 400);
        }

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permission deleted successfully.',
        ], 200);
    }
}
