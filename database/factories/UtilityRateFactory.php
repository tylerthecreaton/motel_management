<?php

namespace Database\Factories;

use App\Models\UtilityRate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UtilityRate>
 */
class UtilityRateFactory extends Factory
{
    protected $model = UtilityRate::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // ราคาค่าไฟฟ้าต่อหน่วย (ปกติประมาณ 4-6 บาท/kWh)
            'electricity_rate_per_unit' => fake()->randomFloat(2, 4.00, 6.00),
            // ราคาค่าน้ำรายเดือน (ปกติประมาณ 100-200 บาท/เดือน)
            'water_flat_rate' => fake()->randomFloat(2, 100.00, 200.00),
        ];
    }

    /**
     * สร้าง utility rate ที่มี id = 1 (สำหรับ singleton pattern)
     */
    public function singleton(): static
    {
        return $this->state(fn(array $attributes) => [
            'id' => 1,
        ]);
    }
}
