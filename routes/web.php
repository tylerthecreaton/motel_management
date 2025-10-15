<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // ถ้า user login แล้วให้ไปหน้า dashboard
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    // ถ้ายังไม่ login ให้ไปหน้า login
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Room Management Routes
    Route::prefix('rooms')->name('rooms.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('rooms/index');
        })->name('index');

        Route::get('/create', function () {
            return Inertia::render('rooms/create');
        })->name('create');

        Route::get('/{id}', function ($id) {
            return Inertia::render('rooms/show', ['roomId' => $id]);
        })->name('show');

        Route::get('/{id}/edit', function ($id) {
            return Inertia::render('rooms/edit', ['roomId' => $id]);
        })->name('edit');
    });

    // Booking/Contract Management Routes
    Route::prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('bookings/index');
        })->name('index');

        Route::get('/create/{roomId}', function ($roomId) {
            return Inertia::render('bookings/create', ['roomId' => $roomId]);
        })->name('create');

        Route::get('/{id}', function ($id) {
            return Inertia::render('bookings/show', ['id' => $id]);
        })->name('show');
    });

    // Tenant Routes
    Route::prefix('tenant')->name('tenant.')->group(function () {
        Route::get('/invoices', function () {
            return Inertia::render('tenant/invoices');
        })->name('invoices');
    });

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        // Admin Overview
        Route::get('/', function () {
            return Inertia::render('admin/index');
        })->name('index');

        // Admin Bookings Management
        Route::prefix('bookings')->name('bookings.')->group(function () {
            Route::get('/', function () {
                return Inertia::render('admin/bookings/index');
            })->name('index');

            Route::get('/{id}', function ($id) {
                return Inertia::render('admin/bookings/show', ['id' => $id]);
            })->name('show');
        });

        // Admin Users Management
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', function () {
                return Inertia::render('admin/users/index');
            })->name('index');

            Route::get('/create', function () {
                return Inertia::render('admin/users/create');
            })->name('create');

            Route::get('/{id}', function ($id) {
                return Inertia::render('admin/users/show', ['userId' => $id]);
            })->name('show');

            Route::get('/{id}/edit', function ($id) {
                return Inertia::render('admin/users/edit', ['userId' => $id]);
            })->name('edit');
        });

        // Admin Roles Management
        Route::prefix('roles')->name('roles.')->group(function () {
            Route::get('/', function () {
                return Inertia::render('admin/roles/index');
            })->name('index');

            Route::get('/create', function () {
                return Inertia::render('admin/roles/create');
            })->name('create');

            Route::get('/{id}', function ($id) {
                return Inertia::render('admin/roles/show', ['roleId' => $id]);
            })->name('show');

            Route::get('/{id}/edit', function ($id) {
                return Inertia::render('admin/roles/edit', ['roleId' => $id]);
            })->name('edit');
        });

        // Admin Utility Settings
        Route::get('/utility-settings', function () {
            return Inertia::render('admin/utility-settings');
        })->name('utility-settings');

        // Admin Invoice Management
        Route::get('/invoices', function () {
            return Inertia::render('admin/invoices');
        })->name('invoices');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
