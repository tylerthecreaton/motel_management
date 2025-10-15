<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    /**
     * Display a paginated list of rooms.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // รับค่า per_page จาก query string (default = 15)
        $perPage = $request->query('per_page', 15);

        // รองรับการ filter ตาม status และ type
        $query = Room::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // รองรับการค้นหาตามชื่อ
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $rooms = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // เพิ่ม image_url สำหรับแต่ละห้อง
        $rooms->getCollection()->transform(function ($room) {
            $room->image_url = $room->image_path ? asset('storage/' . $room->image_path) : null;
            return $room;
        });

        return response()->json($rooms, 200);
    }

    /**
     * Store a newly created room in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:rooms,name',
            'type' => 'required|string|max:255',
            'price_per_month' => 'required|numeric|min:0|max:999999.99',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // รูปภาพไม่เกิน 2MB
            'amenities' => 'nullable|array',
            'amenities.*' => 'string', // แต่ละ item ใน amenities ต้องเป็น string
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // จัดการอัพโหลดรูปภาพ
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $this->handleImageUpload($request->file('image'));
        }

        // Create new room with default status 'available'
        $room = Room::create([
            'name' => $request->name,
            'type' => $request->type,
            'price_per_month' => $request->price_per_month,
            'status' => 'available', // Default status
            'description' => $request->description,
            'image_path' => $imagePath,
            'amenities' => $request->amenities,
        ]);

        // เพิ่ม full URL ของรูปภาพใน response
        $roomData = $room->toArray();
        $roomData['image_url'] = $room->image_path ? asset('storage/' . $room->image_path) : null;

        return response()->json([
            'message' => 'Room created successfully',
            'data' => $roomData
        ], 201);
    }

    /**
     * Display the specified room.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'message' => 'Room not found'
            ], 404);
        }

        // Load relationships (optional - รวม rentals ที่เกี่ยวข้อง)
        $room->load([
            'rentals' => function ($query) {
                $query->latest()->limit(5);
            }
        ]);

        // เพิ่ม full URL ของรูปภาพ
        $room->image_url = $room->image_path ? asset('storage/' . $room->image_path) : null;

        return response()->json([
            'data' => $room
        ], 200);
    }

    /**
     * Update the specified room in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'message' => 'Room not found'
            ], 404);
        }

        // Validate request data
        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('rooms', 'name')->ignore($id)
            ],
            'type' => 'sometimes|required|string|max:255',
            'price_per_month' => 'sometimes|required|numeric|min:0|max:999999.99',
            'status' => [
                'sometimes',
                'required',
                Rule::in(['available', 'occupied', 'maintenance'])
            ],
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // รูปภาพไม่เกิน 2MB
            'amenities' => 'nullable|array',
            'amenities.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // เตรียมข้อมูลสำหรับ update
        $updateData = $request->only([
            'name',
            'type',
            'price_per_month',
            'status',
            'description',
            'amenities',
        ]);

        // จัดการอัพโหลดรูปภาพใหม่
        if ($request->hasFile('image')) {
            // ลบรูปภาพเก่าถ้ามี
            if ($room->image_path) {
                $this->deleteImage($room->image_path);
            }

            // อัพโหลดรูปภาพใหม่
            $updateData['image_path'] = $this->handleImageUpload($request->file('image'));
        }

        // Update room with validated data
        $room->update($updateData);

        // Refresh model และเพิ่ม full URL ของรูปภาพ
        $room = $room->fresh();
        $roomData = $room->toArray();
        $roomData['image_url'] = $room->image_path ? asset('storage/' . $room->image_path) : null;

        return response()->json([
            'message' => 'Room updated successfully',
            'data' => $roomData
        ], 200);
    }

    /**
     * Remove the specified room from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'message' => 'Room not found'
            ], 404);
        }

        // ตรวจสอบว่ามีการเช่าที่ active อยู่หรือไม่
        $hasActiveRental = $room->rentals()
            ->whereIn('status', ['active', 'approved'])
            ->exists();

        if ($hasActiveRental) {
            return response()->json([
                'message' => 'Cannot delete room with active or approved rentals'
            ], 409); // 409 Conflict
        }

        // ลบรูปภาพก่อนลบห้อง
        if ($room->image_path) {
            $this->deleteImage($room->image_path);
        }

        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully'
        ], 200);
    }

    /**
     * Handle image upload and return the stored path.
     *
     * @param \Illuminate\Http\UploadedFile $image
     * @return string
     */
    private function handleImageUpload($image): string
    {
        // สร้างชื่อไฟล์ที่ unique
        $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();

        // เก็บไฟล์ใน storage/app/public/rooms
        $path = $image->storeAs('rooms', $filename, 'public');

        return $path; // return เป็น 'rooms/filename.jpg'
    }

    /**
     * Delete an image from storage.
     *
     * @param string $path
     * @return bool
     */
    private function deleteImage(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }
}
