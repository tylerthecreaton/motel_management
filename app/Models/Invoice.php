<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'rental_id',
        'invoice_number',
        'issue_date',
        'due_date',
        'room_rent',
        'electricity_charge',
        'water_charge',
        'total_amount',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'room_rent' => 'decimal:2',
        'electricity_charge' => 'decimal:2',
        'water_charge' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Boot method สำหรับคำนวณ total_amount อัตโนมัติ
     */
    protected static function boot()
    {
        parent::boot();

        // คำนวณ total_amount ก่อนบันทึกข้อมูล
        static::saving(function ($invoice) {
            $invoice->total_amount = $invoice->room_rent 
                + $invoice->electricity_charge 
                + $invoice->water_charge;
        });
    }

    /**
     * ความสัมพันธ์กับ Rental model
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Scope สำหรับดึงใบแจ้งหนี้ที่ยังไม่ชำระ
     */
    public function scopeUnpaid($query)
    {
        return $query->where('status', 'unpaid');
    }

    /**
     * Scope สำหรับดึงใบแจ้งหนี้ที่ชำระแล้ว
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope สำหรับดึงใบแจ้งหนี้ที่เกินกำหนด
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    /**
     * Scope สำหรับดึงใบแจ้งหนี้ตามการเช่า
     */
    public function scopeForRental($query, int $rentalId)
    {
        return $query->where('rental_id', $rentalId);
    }

    /**
     * Scope สำหรับดึงใบแจ้งหนี้ตามช่วงเวลา
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('issue_date', [$startDate, $endDate]);
    }

    /**
     * ตรวจสอบว่าใบแจ้งหนี้เกินกำหนดชำระหรือไม่
     *
     * @return bool
     */
    public function isOverdue(): bool
    {
        return $this->status === 'unpaid' && $this->due_date < now();
    }

    /**
     * ทำเครื่องหมายว่าชำระเงินแล้ว
     *
     * @return bool
     */
    public function markAsPaid(): bool
    {
        return $this->update(['status' => 'paid']);
    }

    /**
     * ทำเครื่องหมายว่าเกินกำหนดชำระ
     *
     * @return bool
     */
    public function markAsOverdue(): bool
    {
        return $this->update(['status' => 'overdue']);
    }

    /**
     * สร้างเลขที่ใบแจ้งหนี้อัตโนมัติ
     * รูปแบบ: INV-YYYYMM-XXXX (เช่น INV-202410-0001)
     *
     * @return string
     */
    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV-' . now()->format('Ym') . '-';
        
        // หาเลขที่ใบแจ้งหนี้ล่าสุดในเดือนนี้
        $lastInvoice = static::where('invoice_number', 'like', $prefix . '%')
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            // ดึงเลขลำดับจากเลขที่ใบแจ้งหนี้ล่าสุด
            $lastNumber = (int) substr($lastInvoice->invoice_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * คำนวณจำนวนวันที่เหลือก่อนครบกำหนด
     *
     * @return int
     */
    public function daysUntilDue(): int
    {
        return now()->diffInDays($this->due_date, false);
    }

    /**
     * ดึงใบแจ้งหนี้ที่ต้องอัพเดทสถานะเป็น overdue
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getOverdueInvoices()
    {
        return static::where('status', 'unpaid')
            ->where('due_date', '<', now())
            ->get();
    }
}
