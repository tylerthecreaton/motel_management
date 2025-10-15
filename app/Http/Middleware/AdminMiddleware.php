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
        // สมมติว่า User model มี field 'is_admin' หรือ 'role'

        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // ตัวอย่าง: ตรวจสอบจาก field 'is_admin'
        // if (!$request->user()->is_admin) {
        //     return response()->json([
        //         'message' => 'Forbidden. Admin access required.'
        //     ], 403);
        // }

        // ตัวอย่าง: ตรวจสอบจาก field 'role'
        // if ($request->user()->role !== 'admin') {
        //     return response()->json([
        //         'message' => 'Forbidden. Admin access required.'
        //     ], 403);
        // }

        // TODO: ปรับแต่งตามโครงสร้าง User model ของคุณ
        // ตอนนี้จะ pass ไปก่อน (สำหรับ development)

        return $next($request);
    }
}
