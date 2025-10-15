<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\RoomController;
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
});
