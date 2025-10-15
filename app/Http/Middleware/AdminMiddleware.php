<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ตรวจสอบว่า user ที่ login อยู่เป็น admin หรือไม่
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // ตรวจสอบว่า user มี role admin หรือไม่
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Forbidden. Admin access required.'
            ], 403);
        }

        return $next($request);
    }
}
