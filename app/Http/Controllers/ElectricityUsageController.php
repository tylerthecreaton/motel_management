<?php

namespace App\Http\Controllers;

use App\Models\ElectricityUsage;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ElectricityUsageController extends Controller
{
    /**
     * Store a new electricity usage record.
     * Automatically calculates previous_units from the last record.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validate basic request data
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|integer|exists:rooms,id',
            'reading_date' => 'required|date',
            'current_units' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // ดึงการบันทึกมิเตอร์ล่าสุดของห้องนี้
        $latestUsage = ElectricityUsage::getLatestForRoom($request->room_id);

        // กำหนด previous_units (ถ้าไม่มีข้อมูลเก่าให้เป็น 0)
        $previousUnits = $latestUsage ? $latestUsage->current_units : 0;

        // ตรวจสอบว่า current_units มากกว่า previous_units
        if ($request->current_units <= $previousUnits) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => [
                    'current_units' => [
                        "Current units ({$request->current_units}) must be greater than previous units ({$previousUnits})"
                    ]
                ]
            ], 422);
        }

        // คำนวณ units_used
        $unitsUsed = $request->current_units - $previousUnits;

        // สร้างข้อมูลการใช้ไฟใหม่
        $electricityUsage = ElectricityUsage::create([
            'room_id' => $request->room_id,
            'reading_date' => $request->reading_date,
            'previous_units' => $previousUnits,
            'current_units' => $request->current_units,
            'units_used' => $unitsUsed,
            'is_billed' => false,
        ]);

        // Load relationship
        $electricityUsage->load('room');

        return response()->json([
            'message' => 'Electricity usage recorded successfully',
            'data' => $electricityUsage
        ], 201);
    }
}
