<?php

namespace App\Http\Controllers;

use App\Models\ElectricityUsage;
use App\Models\Invoice;
use App\Models\Rental;
use App\Models\UtilityRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
{
    /**
     * Generate monthly invoices for all active rentals.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function generateMonthlyInvoices(Request $request): JsonResponse
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $month = $request->month;
        $year = $request->year;

        // สร้างวันที่เริ่มต้นและสิ้นสุดของเดือน
        $startDate = "{$year}-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-01";
        $endDate = date('Y-m-t', strtotime($startDate)); // วันสุดท้ายของเดือน

        try {
            DB::beginTransaction();

            // 1. ดึง approved และ active rentals ทั้งหมด
            $activeRentals = Rental::with(['room'])
                ->whereIn('status', ['approved', 'active'])
                ->get();

            if ($activeRentals->isEmpty()) {
                DB::rollBack();
                return response()->json([
                    'message' => 'No approved or active rentals found',
                    'invoices_generated' => 0
                ], 200);
            }

            // 3. ดึงอัตราค่าสาธารณูปโภคปัจจุบัน
            $utilityRate = UtilityRate::current();
            $electricityRate = (float) $utilityRate->electricity_rate_per_unit;
            $waterRate = (float) $utilityRate->water_flat_rate;

            $invoicesGenerated = 0;
            $errors = [];

            // 2. วนลูปสร้าง invoice สำหรับแต่ละ rental
            foreach ($activeRentals as $rental) {
                try {
                    // a. ดึงค่าเช่าห้องจาก room
                    $roomRent = (float) $rental->room->price_per_month;

                    // b. ดึงข้อมูลการใช้ไฟฟ้าที่ยังไม่ได้ออกบิลสำหรับเดือนนี้
                    $electricityUsage = ElectricityUsage::where('room_id', $rental->room_id)
                        ->where('is_billed', false)
                        ->whereBetween('reading_date', [$startDate, $endDate])
                        ->orderBy('reading_date', 'desc')
                        ->first();

                    // d. คำนวณค่าไฟฟ้า
                    $electricityCharge = 0;
                    if ($electricityUsage) {
                        $electricityCharge = $electricityUsage->units_used * $electricityRate;
                    }

                    // e. ค่าน้ำคือ water_flat_rate
                    $waterCharge = $waterRate;

                    // f. คำนวณยอดรวม
                    $totalAmount = $roomRent + $electricityCharge + $waterCharge;

                    // g. สร้าง invoice
                    $invoice = Invoice::create([
                        'rental_id' => $rental->id,
                        'invoice_number' => Invoice::generateInvoiceNumber(),
                        'issue_date' => now(),
                        'due_date' => now()->addDays(7), // ครบกำหนด 7 วัน
                        'room_rent' => $roomRent,
                        'electricity_charge' => $electricityCharge,
                        'water_charge' => $waterCharge,
                        'total_amount' => $totalAmount,
                        'status' => 'unpaid',
                    ]);

                    // h. อัพเดท ElectricityUsage ให้เป็น billed
                    if ($electricityUsage) {
                        $electricityUsage->update(['is_billed' => true]);
                    }

                    $invoicesGenerated++;
                } catch (\Exception $e) {
                    // บันทึก error แต่ไม่หยุดการทำงาน
                    $errors[] = [
                        'rental_id' => $rental->id,
                        'room_name' => $rental->room->name,
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            // สร้างชื่อเดือนภาษาไทย
            $monthNames = [
                1 => 'มกราคม', 2 => 'กุมภาพันธ์', 3 => 'มีนาคม', 4 => 'เมษายน',
                5 => 'พฤษภาคม', 6 => 'มิถุนายน', 7 => 'กรกฎาคม', 8 => 'สิงหาคม',
                9 => 'กันยายน', 10 => 'ตุลาคม', 11 => 'พฤศจิกายน', 12 => 'ธันวาคม'
            ];
            $monthName = $monthNames[$month];

            $response = [
                'message' => "Successfully generated {$invoicesGenerated} invoices for {$monthName} {$year}",
                'invoices_generated' => $invoicesGenerated,
                'month' => $month,
                'year' => $year,
                'period' => "{$monthName} {$year}",
            ];

            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['message'] .= " (with " . count($errors) . " errors)";
            }

            return response()->json($response, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to generate invoices',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all active rentals with tenant information.
     * 
     * @return JsonResponse
     */
    public function getActiveRentals(): JsonResponse
    {
        try {
            // ดึง rentals ที่มี status เป็น approved หรือ active
            $rentals = Rental::with(['user', 'room', 'tenantInformation'])
                ->whereIn('status', ['approved', 'active'])
                ->get();

            // Log for debugging
            \Log::info('Active/Approved rentals count: ' . $rentals->count());

            return response()->json([
                'data' => $rentals
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching active rentals: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to fetch active rentals',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a single invoice for a specific rental.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'rental_id' => 'required|integer|exists:rentals,id',
            'room_rent' => 'required|numeric|min:0',
            'electricity_charge' => 'required|numeric|min:0',
            'water_charge' => 'required|numeric|min:0',
            'electricity_usage_id' => 'nullable|integer|exists:electricity_usages,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // คำนวณยอดรวม
            $totalAmount = $request->room_rent + $request->electricity_charge + $request->water_charge;

            // สร้าง invoice
            $invoice = Invoice::create([
                'rental_id' => $request->rental_id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'issue_date' => now(),
                'due_date' => now()->addDays(7),
                'room_rent' => $request->room_rent,
                'electricity_charge' => $request->electricity_charge,
                'water_charge' => $request->water_charge,
                'total_amount' => $totalAmount,
                'status' => 'unpaid',
            ]);

            // อัพเดท ElectricityUsage ถ้ามี
            if ($request->electricity_usage_id) {
                $electricityUsage = ElectricityUsage::find($request->electricity_usage_id);
                if ($electricityUsage) {
                    $electricityUsage->update(['is_billed' => true]);
                }
            }

            DB::commit();

            // Load relationships
            $invoice->load(['rental.user', 'rental.room', 'rental.tenantInformation']);

            return response()->json([
                'message' => 'Invoice created successfully',
                'data' => $invoice
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
