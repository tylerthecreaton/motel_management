<?php

namespace App\Http\Controllers;

use App\Models\UtilityRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UtilityRateController extends Controller
{
    /**
     * Display the single utility rate record.
     * If no record exists, create a default one and return it.
     *
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        // ใช้ singleton pattern เพื่อดึงหรือสร้างข้อมูลอัตราค่าสาธารณูปโภค
        $utilityRate = UtilityRate::current();

        return response()->json([
            'data' => $utilityRate
        ], 200);
    }

    /**
     * Update the utility rate record.
     * Validates the incoming electricity_rate_per_unit and water_flat_rate.
     * Updates the first (and only) record in the utility_rates table.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'electricity_rate_per_unit' => 'required|numeric|min:0|max:999999.99',
            'water_flat_rate' => 'required|numeric|min:0|max:999999.99',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // อัพเดทอัตราค่าสาธารณูปโภค
        $updated = UtilityRate::updateRates([
            'electricity_rate_per_unit' => $request->electricity_rate_per_unit,
            'water_flat_rate' => $request->water_flat_rate,
        ]);

        if (!$updated) {
            return response()->json([
                'message' => 'Failed to update utility rates'
            ], 500);
        }

        // ดึงข้อมูลที่อัพเดทแล้ว
        $utilityRate = UtilityRate::current();

        return response()->json([
            'message' => 'Utility rates updated successfully',
            'data' => $utilityRate
        ], 200);
    }
}
