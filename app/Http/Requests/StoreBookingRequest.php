<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * 
     * กำหนดว่าผู้ใช้มีสิทธิ์ทำคำขอนี้หรือไม่
     */
    public function authorize(): bool
    {
        // ผู้ใช้ที่ล็อกอินแล้วสามารถจองได้
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     * 
     * กำหนดกฎการตรวจสอบความถูกต้องของข้อมูล
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // ข้อมูลการจอง
            'room_id' => [
                'required',
                'integer',
                'exists:rooms,id',
            ],
            'start_date' => [
                'required',
                'date',
                'after_or_equal:today',
            ],
            'end_date' => [
                'required',
                'date',
                'after:start_date',
            ],

            // ข้อมูลสัญญา
            'deposit_amount' => [
                'required',
                'numeric',
                'min:0',
            ],
            'advance_payment' => [
                'required',
                'numeric',
                'min:0',
            ],
            'special_conditions' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:500',
            ],

            // ข้อมูลส่วนตัวผู้เข้าพัก
            'tenant.first_name' => [
                'required',
                'string',
                'max:255',
            ],
            'tenant.last_name' => [
                'required',
                'string',
                'max:255',
            ],
            'tenant.id_card_number' => [
                'required',
                'string',
                'size:13',
                'regex:/^[0-9]{13}$/',
            ],
            'tenant.date_of_birth' => [
                'required',
                'date',
                'before:today',
            ],

            // ที่อยู่ปัจจุบัน
            'tenant.current_address' => [
                'required',
                'string',
                'max:500',
            ],
            'tenant.province' => [
                'required',
                'string',
                'max:100',
            ],
            'tenant.district' => [
                'required',
                'string',
                'max:100',
            ],
            'tenant.sub_district' => [
                'required',
                'string',
                'max:100',
            ],
            'tenant.postal_code' => [
                'required',
                'string',
                'size:5',
                'regex:/^[0-9]{5}$/',
            ],

            // ข้อมูลติดต่อ
            'tenant.phone_number' => [
                'required',
                'string',
                'size:10',
                'regex:/^0[0-9]{9}$/',
            ],
            'tenant.email' => [
                'nullable',
                'email',
                'max:255',
            ],
            'tenant.line_id' => [
                'nullable',
                'string',
                'max:100',
            ],

            // ผู้ติดต่อฉุกเฉิน
            'tenant.emergency_contact_name' => [
                'required',
                'string',
                'max:255',
            ],
            'tenant.emergency_contact_relationship' => [
                'required',
                'string',
                'max:100',
            ],
            'tenant.emergency_contact_phone' => [
                'required',
                'string',
                'size:10',
                'regex:/^0[0-9]{9}$/',
            ],

            // อาชีพ
            'tenant.occupation' => [
                'required',
                'string',
                'max:255',
            ],
            'tenant.workplace' => [
                'nullable',
                'string',
                'max:255',
            ],
            'tenant.monthly_income' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            // เอกสารแนบ (optional - จะอัพโหลดทีหลังได้)
            'tenant.id_card_copy' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:2048', // 2MB
            ],
            'tenant.photo' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png',
                'max:2048', // 2MB
            ],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     * 
     * กำหนดข้อความแสดงข้อผิดพลาดแบบกำหนดเอง
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'room_id.required' => 'Please select a room.',
            'room_id.exists' => 'The selected room does not exist.',
            'start_date.required' => 'Please provide a start date.',
            'start_date.date' => 'Start date must be a valid date.',
            'start_date.after_or_equal' => 'Start date must be today or a future date.',
            'end_date.required' => 'Please provide an end date.',
            'end_date.date' => 'End date must be a valid date.',
            'end_date.after' => 'End date must be after the start date.',
        ];
    }
}
