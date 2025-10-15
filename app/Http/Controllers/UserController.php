<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get all users (Admin only).
     * 
     * ดึงรายการผู้ใช้ทั้งหมด (สำหรับ admin)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // รับค่า filter จาก query string
        $query = User::query();

        // Search by name or email
        // ค้นหาตามชื่อหรืออีเมล
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Filter by email verification status
        // กรองตามสถานะการยืนยันอีเมล
        if ($request->has('verified')) {
            if ($request->verified === 'true') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->verified === 'false') {
                $query->whereNull('email_verified_at');
            }
        }

        // Load relationships
        // โหลดข้อมูลความสัมพันธ์
        $users = $query->with('roles')
            ->withCount('rentals')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ], 200);
    }

    /**
     * Get a specific user by ID.
     * 
     * ดึงข้อมูลผู้ใช้ตาม ID
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with(['rentals.room', 'rentals.tenantInformation', 'roles.permissions'])
            ->withCount('rentals')
            ->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
        ], 200);
    }

    /**
     * Create a new user.
     * 
     * สร้างผู้ใช้ใหม่
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validate request data
        // ตรวจสอบข้อมูลที่ส่งมา
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', 'min:8'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
        ]);

        // Create new user
        // สร้างผู้ใช้ใหม่
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(), // Auto-verify for admin-created users
        ]);

        // Assign roles if provided
        // กำหนด roles ถ้ามีการส่งมา
        if (!empty($validated['roles'])) {
            $user->roles()->attach($validated['roles']);
        } else {
            // ถ้าไม่ได้กำหนด role ให้กำหนดเป็น 'user' โดยอัตโนมัติ
            $defaultRole = \App\Models\Role::where('name', 'user')->first();
            if ($defaultRole) {
                $user->roles()->attach($defaultRole->id);
            }
        }

        $user->load('roles');

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => $user,
        ], 201);
    }

    /**
     * Update an existing user.
     * 
     * อัพเดทข้อมูลผู้ใช้
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        // Validate request data
        // ตรวจสอบข้อมูลที่ส่งมา
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'confirmed', 'min:8'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
        ]);

        // Update user data
        // อัพเดทข้อมูลผู้ใช้
        $updateData = [
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
        ];

        // Update password if provided
        // อัพเดทรหัสผ่านถ้ามีการส่งมา
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        // Update roles if provided
        // อัพเดท roles ถ้ามีการส่งมา
        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => $user->fresh()->load('roles'),
        ], 200);
    }

    /**
     * Delete a user.
     * 
     * ลบผู้ใช้
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        // Prevent deleting user with active rentals
        // ป้องกันการลบผู้ใช้ที่มีการเช่าที่ active อยู่
        $hasActiveRentals = $user->rentals()
            ->whereIn('status', ['pending', 'approved', 'active'])
            ->exists();

        if ($hasActiveRentals) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete user with active rentals. Please complete or cancel all rentals first.',
            ], 400);
        }

        // Delete the user
        // ลบผู้ใช้
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ], 200);
    }

    /**
     * Toggle email verification status.
     * 
     * เปลี่ยนสถานะการยืนยันอีเมล
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function toggleEmailVerification(int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        // Toggle verification status
        // สลับสถานะการยืนยัน
        if ($user->email_verified_at) {
            $user->update(['email_verified_at' => null]);
            $message = 'Email verification removed.';
        } else {
            $user->update(['email_verified_at' => now()]);
            $message = 'Email verified successfully.';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $user->fresh(),
        ], 200);
    }
}
