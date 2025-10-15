<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ElectricityUsage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'room_id',
        'reading_date',
        'previous_units',
        'current_units',
        'units_used',
        'is_billed',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'reading_date' => 'date',
        'previous_units' => 'integer',
        'current_units' => 'integer',
        'units_used' => 'integer',
        'is_billed' => 'boolean',
    ];

    /**
     * Boot method สำหรับคำนวณ units_used อัตโนมัติ
     */
    protected static function boot()
    {
        parent::boot();

        // คำนวณ units_used ก่อนบันทึกข้อมูล
        static::saving(function ($usage) {
            $usage->units_used = $usage->current_units - $usage->previous_units;
        });
    }

    /**
     * ความสัมพันธ์กับ Room model
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Scope สำหรับดึงข้อมูลที่ยังไม่ได้ออกบิล
     */
    public function scopeUnbilled($query)
    {
        return $query->where('is_billed', false);
    }

    /**
     * Scope สำหรับดึงข้อมูลที่ออกบิลแล้ว
     */
    public function scopeBilled($query)
    {
        return $query->where('is_billed', true);
    }

    /**
     * Scope สำหรับดึงข้อมูลตามห้อง
     */
    public function scopeForRoom($query, int $roomId)
    {
        return $query->where('room_id', $roomId);
    }

    /**
     * Scope สำหรับดึงข้อมูลตามช่วงเวลา
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('reading_date', [$startDate, $endDate]);
    }

    /**
     * คำนวณค่าไฟฟ้าตามอัตราปัจจุบัน
     *
     * @return float
     */
    public function calculateCost(): float
    {
        $rate = UtilityRate::getElectricityRate();
        return $this->units_used * $rate;
    }

    /**
     * ทำเครื่องหมายว่าออกบิลแล้ว
     *
     * @return bool
     */
    public function markAsBilled(): bool
    {
        return $this->update(['is_billed' => true]);
    }

    /**
     * ดึงการบันทึกมิเตอร์ล่าสุดของห้อง
     *
     * @param int $roomId
     * @return ElectricityUsage|null
     */
    public static function getLatestForRoom(int $roomId): ?ElectricityUsage
    {
        return static::where('room_id', $roomId)
            ->orderBy('reading_date', 'desc')
            ->first();
    }
}
