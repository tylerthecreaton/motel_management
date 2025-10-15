<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserInvoiceController extends Controller
{
    /**
     * Get all invoices for the authenticated user.
     * Returns invoices based on the user's active rental.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // ดึง invoices ที่เกี่ยวข้องกับ rentals ของ user
        $invoices = Invoice::with(['rental.room', 'rental.user'])
            ->whereHas('rental', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('issue_date', 'desc')
            ->get();

        // เพิ่มข้อมูล electricity usage สำหรับแต่ละ invoice
        $invoices->each(function ($invoice) {
            // หาข้อมูลการใช้ไฟที่เกี่ยวข้องกับ invoice นี้
            $startDate = \Carbon\Carbon::parse($invoice->issue_date)->subDays(35);
            $electricityUsage = \App\Models\ElectricityUsage::where('room_id', $invoice->rental->room_id)
                ->where('is_billed', true)
                ->whereBetween('reading_date', [
                    $startDate,
                    $invoice->issue_date
                ])
                ->orderBy('reading_date', 'desc')
                ->first();

            // เพิ่มข้อมูล units_used ถ้ามี
            $invoice->electricity_units = $electricityUsage ? $electricityUsage->units_used : 0;
        });

        return response()->json([
            'data' => $invoices
        ], 200);
    }

    /**
     * Get a specific invoice for the authenticated user.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // ดึง invoice พร้อมตรวจสอบว่าเป็นของ user นี้
        $invoice = Invoice::with(['rental.room', 'rental.user'])
            ->whereHas('rental', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->find($id);

        if (!$invoice) {
            return response()->json([
                'message' => 'Invoice not found or access denied'
            ], 404);
        }

        // หาข้อมูลการใช้ไฟที่เกี่ยวข้อง
        $startDate = \Carbon\Carbon::parse($invoice->issue_date)->subDays(35);
        $electricityUsage = \App\Models\ElectricityUsage::where('room_id', $invoice->rental->room_id)
            ->where('is_billed', true)
            ->whereBetween('reading_date', [
                $startDate,
                $invoice->issue_date
            ])
            ->orderBy('reading_date', 'desc')
            ->first();

        // เพิ่มข้อมูล units_used
        $invoice->electricity_units = $electricityUsage ? $electricityUsage->units_used : 0;

        return response()->json([
            'data' => $invoice
        ], 200);
    }
}
