<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UtilityRate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'electricity_rate_per_unit',
        'water_flat_rate',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'electricity_rate_per_unit' => 'decimal:2',
        'water_flat_rate' => 'decimal:2',
    ];

    /**
     * ดึงข้อมูลอัตราค่าสาธารณูปโภค (Singleton Pattern)
     * จะสร้างข้อมูลใหม่ถ้ายังไม่มีในฐานข้อมูล
     *
     * @return UtilityRate
     */
    public static function current(): UtilityRate
    {
        return static::firstOrCreate(
            ['id' => 1],
            [
                'electricity_rate_per_unit' => 0.00,
                'water_flat_rate' => 0.00,
            ]
        );
    }

    /**
     * อัพเดทอัตราค่าสาธารณูปโภค
     *
     * @param array $rates
     * @return bool
     */
    public static function updateRates(array $rates): bool
    {
        return static::current()->update($rates);
    }

    /**
     * ดึงราคาค่าไฟฟ้าต่อหน่วย
     *
     * @return float
     */
    public static function getElectricityRate(): float
    {
        return (float) static::current()->electricity_rate_per_unit;
    }

    /**
     * ดึงราคาค่าน้ำรายเดือน
     *
     * @return float
     */
    public static function getWaterRate(): float
    {
        return (float) static::current()->water_flat_rate;
    }
}
