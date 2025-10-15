<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ElectricityUsageController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserInvoiceController;
use App\Http\Controllers\UtilityRateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Public Room Routes (No Authentication Required)
// ดูรายการห้องและรายละเอียดห้องสำหรับผู้ใช้ทั่วไป
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

// Authentication routes with rate limiting
// Throttle: 5 attempts per minute per IP address
Route::middleware('throttle:5,1')->group(function () {
    // 1. POST /login - Login and get authentication token
    // Rate limited to prevent brute-force attacks
    Route::post('/login', [AuthController::class, 'login']);

    // Additional public route for user registration
    // Rate limited to prevent spam registrations
    Route::post('/register', [AuthController::class, 'register']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Authentication Required)
|--------------------------------------------------------------------------
| These routes are protected by the 'auth:sanctum' middleware.
| Users must provide a valid Bearer token to access these endpoints.
*/

Route::middleware('auth:sanctum')->group(function () {
    // 2. POST /logout - Logout and revoke current token
    Route::post('/logout', [AuthController::class, 'logout']);

    // 3. GET /me - Get current authenticated user information
    Route::get('/me', [AuthController::class, 'me']);

    // Additional protected route - Logout from all devices
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    /*
    |----------------------------------------------------------------------
    | Add Your Protected API Routes Below
    |----------------------------------------------------------------------
    | Example:
    | Route::apiResource('posts', PostController::class);
    | Route::get('/dashboard', [DashboardController::class, 'index']);
    */

    // Booking Routes - Protected (Authentication Required)
    // เส้นทางสำหรับการจองห้องพัก (ต้องล็อกอินก่อน)
    Route::prefix('bookings')->group(function () {
        Route::get('/', [BookingController::class, 'index']);           // ดูรายการจองของตัวเอง
        Route::post('/', [BookingController::class, 'store']);          // สร้างคำขอจองใหม่
        Route::get('/{id}', [BookingController::class, 'show']);        // ดูรายละเอียดการจอง
        Route::post('/{id}/cancel', [BookingController::class, 'cancel']); // ยกเลิกการจอง
    });

    // User Invoice Routes - Protected (Authentication Required)
    // เส้นทางสำหรับดูใบแจ้งหนี้ของผู้เช่า
    Route::prefix('user')->group(function () {
        Route::get('/invoices', [UserInvoiceController::class, 'index']);        // ดูรายการใบแจ้งหนี้ของตัวเอง
        Route::get('/invoices/{id}', [UserInvoiceController::class, 'show']);    // ดูรายละเอียดใบแจ้งหนี้
    });
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Authentication + Admin Role Required)
|--------------------------------------------------------------------------
| These routes require both authentication and admin privileges.
*/

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Room Management - Full CRUD
    Route::apiResource('rooms', RoomController::class);

    // Booking Management - Admin Actions
    // การจัดการการจอง - สำหรับ admin
    Route::prefix('bookings')->group(function () {
        Route::get('/', [BookingController::class, 'getAllBookings']);       // ดูรายการจองทั้งหมด
        Route::get('/{id}', [BookingController::class, 'show']);             // ดูรายละเอียดการจอง
        Route::post('/{id}/approve', [BookingController::class, 'approve']); // อนุมัติการจอง
        Route::post('/{id}/reject', [BookingController::class, 'reject']);   // ปฏิเสธการจอง
    });

    // User Management - Full CRUD
    // การจัดการผู้ใช้ - สำหรับ admin
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);                              // ดูรายการผู้ใช้ทั้งหมด
        Route::post('/', [UserController::class, 'store']);                             // สร้างผู้ใช้ใหม่
        Route::get('/{id}', [UserController::class, 'show']);                           // ดูรายละเอียดผู้ใช้
        Route::put('/{id}', [UserController::class, 'update']);                         // อัพเดทข้อมูลผู้ใช้
        Route::delete('/{id}', [UserController::class, 'destroy']);                     // ลบผู้ใช้
        Route::post('/{id}/toggle-verification', [UserController::class, 'toggleEmailVerification']); // เปลี่ยนสถานะการยืนยันอีเมล
    });

    // Role Management - Full CRUD
    // การจัดการ roles - สำหรับ admin
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index']);                              // ดูรายการ roles ทั้งหมด
        Route::post('/', [RoleController::class, 'store']);                             // สร้าง role ใหม่
        Route::get('/permissions', [RoleController::class, 'permissions']);             // ดูรายการ permissions ทั้งหมด
        Route::get('/{id}', [RoleController::class, 'show']);                           // ดูรายละเอียด role
        Route::put('/{id}', [RoleController::class, 'update']);                         // อัพเดทข้อมูล role
        Route::delete('/{id}', [RoleController::class, 'destroy']);                     // ลบ role
    });

    // Permission Management
    // การจัดการ permissions - สำหรับ admin
    Route::prefix('permissions')->group(function () {
        Route::get('/', [PermissionController::class, 'index']);                        // ดูรายการ permissions ทั้งหมด
        Route::get('/grouped', [PermissionController::class, 'grouped']);               // ดูรายการ permissions แบบจัดกลุ่ม
        Route::post('/', [PermissionController::class, 'store']);                       // สร้าง permission ใหม่
        Route::put('/{id}', [PermissionController::class, 'update']);                   // อัพเดทข้อมูล permission
        Route::delete('/{id}', [PermissionController::class, 'destroy']);               // ลบ permission
    });

    // Utility Rate Management
    // การจัดการอัตราค่าสาธารณูปโภค - สำหรับ admin
    Route::get('/utility-rates', [UtilityRateController::class, 'show']);               // ดูอัตราค่าสาธารณูปโภคปัจจุบัน
    Route::put('/utility-rates', [UtilityRateController::class, 'update']);             // อัพเดทอัตราค่าสาธารณูปโภค

    // Electricity Usage Management
    // การจัดการบันทึกมิเตอร์ไฟฟ้า - สำหรับ admin
    Route::post('/electricity-usages', [ElectricityUsageController::class, 'store']);   // บันทึกมิเตอร์ไฟฟ้า

    // Invoice Management
    // การจัดการใบแจ้งหนี้ - สำหรับ admin
    Route::get('/invoices/active-rentals', [InvoiceController::class, 'getActiveRentals']);    // ดูรายการผู้เช่าที่ active
    Route::post('/invoices', [InvoiceController::class, 'store']);                             // สร้างใบแจ้งหนี้แบบเลือกผู้เช่า
    Route::post('/invoices/generate', [InvoiceController::class, 'generateMonthlyInvoices']); // สร้างใบแจ้งหนี้รายเดือนทั้งหมด
});
