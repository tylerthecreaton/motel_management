<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * 
     * ตรวจสอบว่า user มี role ที่กำหนดหรือไม่
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // ตรวจสอบว่า user login แล้วหรือยัง
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // ตรวจสอบว่า user มี role ที่กำหนดหรือไม่
        if (!$request->user()->hasRole($role)) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role: ' . $role
            ], 403);
        }

        return $next($request);
    }
}
