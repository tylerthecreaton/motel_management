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
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
