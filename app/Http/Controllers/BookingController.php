<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Models\Rental;
use App\Models\Room;
use App\Models\TenantInformation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /**
     * Store a new rental booking request.
     * 
     * จัดการคำขอจองห้องพัก โดยตรวจสอบความพร้อมของห้องและสร้างการจองใหม่
     * 
     * @param StoreBookingRequest $request
     * @return JsonResponse
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        // 1. Get validated data from FormRequest
        // รับข้อมูลที่ผ่านการตรวจสอบแล้วจาก FormRequest
        $validated = $request->validated();

        // 2. Check if room exists and is available
        // ตรวจสอบว่าห้องมีอยู่จริงและว่างอยู่
        $room = Room::find($validated['room_id']);
        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found.',
            ], 404);
        }

        // 3. Check if room status is available
        // ตรวจสอบว่าห้องมีสถานะว่างอยู่
        if ($room->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'This room is not available for booking. Current status: ' . $room->status,
            ], 400);
        }

        // 4. Check for overlapping rentals
        // ตรวจสอบว่ามีการจองที่ทับซ้อนกับช่วงเวลาที่เลือกหรือไม่
        $hasOverlap = Rental::where('room_id', $validated['room_id'])
            ->whereIn('status', ['approved', 'active']) // เฉพาะสถานะที่ยืนยันแล้ว
            ->where(function ($query) use ($validated) {
                // ตรวจสอบการทับซ้อนของวันที่
                // Case 1: วันเริ่มต้นใหม่อยู่ระหว่างการจองที่มีอยู่
                $query->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                    // Case 2: วันสิ้นสุดใหม่อยู่ระหว่างการจองที่มีอยู่
                    ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']])
                    // Case 3: การจองใหม่ครอบคลุมการจองที่มีอยู่ทั้งหมด
                    ->orWhere(function ($q) use ($validated) {
                        $q->where('start_date', '>=', $validated['start_date'])
                            ->where('end_date', '<=', $validated['end_date']);
                    })
                    // Case 4: การจองที่มีอยู่ครอบคลุมการจองใหม่ทั้งหมด
                    ->orWhere(function ($q) use ($validated) {
                        $q->where('start_date', '<=', $validated['start_date'])
                            ->where('end_date', '>=', $validated['end_date']);
                    });
            })
            ->exists();

        // 5. If room is not available for the selected dates, return conflict error
        // ถ้าห้องไม่ว่างในช่วงวันที่เลือก ส่งข้อความแจ้งเตือน
        if ($hasOverlap) {
            return response()->json([
                'success' => false,
                'message' => 'ห้องนี้ถูกจองในช่วงวันที่คุณเลือกแล้ว',
            ], 409);
        }

        // 6. Calculate total price
        // คำนวณราคารวมตามจำนวนเดือน
        $startDate = new \DateTime($validated['start_date']);
        $endDate = new \DateTime($validated['end_date']);
        $interval = $startDate->diff($endDate);
        
        // คำนวณจำนวนเดือน (โดยประมาณ 30 วันต่อเดือน)
        $totalDays = $interval->days;
        $months = ceil($totalDays / 30);
        $totalPrice = $room->price_per_month * $months;

        // 7. Create rental contract and tenant information using database transaction
        // สร้างสัญญาเช่าและข้อมูลผู้เข้าพักโดยใช้ database transaction
        try {
            DB::beginTransaction();

            // 7.1 Generate contract number
            // สร้างเลขที่สัญญา (รูปแบบ: CNT-YYYYMMDD-XXXX)
            $contractNumber = 'CNT-' . date('Ymd') . '-' . str_pad(Rental::count() + 1, 4, '0', STR_PAD_LEFT);

            // 7.2 Create rental record
            // สร้างรายการเช่า
            $rental = Rental::create([
                'user_id' => $request->user()->id,
                'room_id' => $validated['room_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'total_price' => $totalPrice,
                'status' => 'pending',
                // ข้อมูลสัญญา
                'contract_number' => $contractNumber,
                'contract_date' => now(),
                'deposit_amount' => $validated['deposit_amount'],
                'advance_payment' => $validated['advance_payment'],
                'monthly_rent' => $room->price_per_month,
                'special_conditions' => $validated['special_conditions'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // 7.3 Handle file uploads for tenant documents
            // จัดการการอัพโหลดเอกสารผู้เข้าพัก
            $idCardCopyPath = null;
            $photoPath = null;

            if ($request->hasFile('tenant.id_card_copy')) {
                $idCardCopyPath = $request->file('tenant.id_card_copy')
                    ->store('tenant_documents/id_cards', 'public');
            }

            if ($request->hasFile('tenant.photo')) {
                $photoPath = $request->file('tenant.photo')
                    ->store('tenant_documents/photos', 'public');
            }

            // 7.4 Create tenant information
            // สร้างข้อมูลผู้เข้าพัก
            $tenantInfo = TenantInformation::create([
                'rental_id' => $rental->id,
                // ข้อมูลส่วนตัว
                'first_name' => $validated['tenant']['first_name'],
                'last_name' => $validated['tenant']['last_name'],
                'id_card_number' => $validated['tenant']['id_card_number'],
                'date_of_birth' => $validated['tenant']['date_of_birth'],
                // ที่อยู่
                'current_address' => $validated['tenant']['current_address'],
                'province' => $validated['tenant']['province'],
                'district' => $validated['tenant']['district'],
                'sub_district' => $validated['tenant']['sub_district'],
                'postal_code' => $validated['tenant']['postal_code'],
                // ข้อมูลติดต่อ
                'phone_number' => $validated['tenant']['phone_number'],
                'email' => $validated['tenant']['email'] ?? null,
                'line_id' => $validated['tenant']['line_id'] ?? null,
                // ผู้ติดต่อฉุกเฉิน
                'emergency_contact_name' => $validated['tenant']['emergency_contact_name'],
                'emergency_contact_relationship' => $validated['tenant']['emergency_contact_relationship'],
                'emergency_contact_phone' => $validated['tenant']['emergency_contact_phone'],
                // อาชีพ
                'occupation' => $validated['tenant']['occupation'],
                'workplace' => $validated['tenant']['workplace'] ?? null,
                'monthly_income' => $validated['tenant']['monthly_income'] ?? null,
                // เอกสาร
                'id_card_copy_path' => $idCardCopyPath,
                'photo_path' => $photoPath,
            ]);

            // 7.5 Note: Room status will be updated to 'occupied' when admin approves the contract
            // หมายเหตุ: สถานะห้องจะถูกอัพเดทเป็น 'occupied' เมื่อ admin อนุมัติสัญญา
            // ตอนนี้ห้องยังคงเป็น 'available' เพื่อให้สามารถรับการจองอื่นได้ (ถ้ามี)

            DB::commit();

            // 8. Load relationships for response
            // โหลดข้อมูลความสัมพันธ์สำหรับการตอบกลับ
            $rental->load(['room', 'user', 'tenantInformation']);

            // 9. Return success response with rental and tenant data
            // ส่งข้อมูลการจองและผู้เข้าพักที่สร้างสำเร็จกลับไป
            return response()->json([
                'success' => true,
                'message' => 'Rental contract created successfully. Waiting for admin approval.',
                'data' => $rental,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            // Delete uploaded files if transaction fails
            // ลบไฟล์ที่อัพโหลดถ้า transaction ล้มเหลว
            if (isset($idCardCopyPath)) {
                Storage::disk('public')->delete($idCardCopyPath);
            }
            if (isset($photoPath)) {
                Storage::disk('public')->delete($photoPath);
            }

            // Handle any unexpected errors
            // จัดการข้อผิดพลาดที่ไม่คาดคิด
            return response()->json([
                'success' => false,
                'message' => 'Failed to create rental contract.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all bookings (Admin only).
     * 
     * ดึงรายการจองทั้งหมด (สำหรับ admin)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getAllBookings(Request $request): JsonResponse
    {
        // รับค่า filter จาก query string
        $query = Rental::with(['room', 'user', 'tenantInformation']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by room
        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        // Search by contract number
        if ($request->has('search')) {
            $query->where('contract_number', 'like', '%' . $request->search . '%');
        }

        $rentals = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $rentals,
        ], 200);
    }

    /**
     * Get all bookings for the authenticated user.
     * 
     * ดึงรายการจองทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $rentals = Rental::where('user_id', $request->user()->id)
            ->with(['room', 'tenantInformation'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rentals,
        ], 200);
    }

    /**
     * Get a specific booking by ID.
     * 
     * ดึงข้อมูลการจองตาม ID
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $rental = Rental::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with(['room', 'payments', 'tenantInformation'])
            ->first();

        if (!$rental) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $rental,
        ], 200);
    }

    /**
     * Approve a booking request (Admin only).
     * 
     * อนุมัติคำขอจอง (สำหรับ admin เท่านั้น)
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $rental = Rental::with(['room', 'user', 'tenantInformation'])->find($id);

        if (!$rental) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        // ตรวจสอบว่าสถานะเป็น pending
        if ($rental->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending bookings can be approved.',
            ], 400);
        }

        // ตรวจสอบว่าห้องยังว่างอยู่
        if ($rental->room->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'Room is no longer available.',
            ], 400);
        }

        // อัพเดทสถานะสัญญาเป็น approved
        $rental->update(['status' => 'approved']);

        // อัพเดทสถานะห้องเป็น occupied
        $rental->room->update(['status' => 'occupied']);

        return response()->json([
            'success' => true,
            'message' => 'Booking approved successfully. Room is now occupied.',
            'data' => $rental,
        ], 200);
    }

    /**
     * Reject a booking request (Admin only).
     * 
     * ปฏิเสธคำขอจอง (สำหรับ admin เท่านั้น)
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $rental = Rental::with(['room', 'user', 'tenantInformation'])->find($id);

        if (!$rental) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        // ตรวจสอบว่าสถานะเป็น pending
        if ($rental->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending bookings can be rejected.',
            ], 400);
        }

        // อัพเดทสถานะสัญญาเป็น cancelled
        $rental->update(['status' => 'cancelled']);

        // ห้องยังคงเป็น available (ไม่ต้องเปลี่ยน)

        return response()->json([
            'success' => true,
            'message' => 'Booking rejected successfully.',
            'data' => $rental,
        ], 200);
    }

    /**
     * Cancel a booking request.
     * 
     * ยกเลิกคำขอจอง (เฉพาะสถานะ pending เท่านั้น)
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $rental = Rental::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$rental) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        // สามารถยกเลิกได้เฉพาะสถานะ pending
        if ($rental->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending bookings can be cancelled.',
            ], 400);
        }

        // Update rental status to cancelled
        $rental->update(['status' => 'cancelled']);

        // Note: ไม่ต้องเปลี่ยนสถานะห้อง เพราะห้องยังเป็น 'available' อยู่แล้ว
        // (จะเปลี่ยนเป็น 'occupied' ก็ต่อเมื่อ admin อนุมัติเท่านั้น)

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully.',
            'data' => $rental,
        ], 200);
    }
}
