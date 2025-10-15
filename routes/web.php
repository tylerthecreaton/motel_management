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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
