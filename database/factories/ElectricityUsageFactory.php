<?php

namespace Database\Factories;

use App\Models\ElectricityUsage;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ElectricityUsage>
 */
class ElectricityUsageFactory extends Factory
{
    protected $model = ElectricityUsage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // สร้างเลขมิเตอร์แบบสุ่ม
        $previousUnits = fake()->numberBetween(1000, 5000);
        $currentUnits = $previousUnits + fake()->numberBetween(50, 500); // ใช้ไฟ 50-500 หน่วย

        return [
            'room_id' => Room::factory(),
            'reading_date' => fake()->dateTimeBetween('-3 months', 'now'),
            'previous_units' => $previousUnits,
            'current_units' => $currentUnits,
            // units_used จะถูกคำนวณอัตโนมัติใน model
            'is_billed' => fake()->boolean(30), // 30% โอกาสที่จะออกบิลแล้ว
        ];
    }

    /**
     * สร้างข้อมูลที่ยังไม่ได้ออกบิล
     */
    public function unbilled(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_billed' => false,
        ]);
    }

    /**
     * สร้างข้อมูลที่ออกบิลแล้ว
     */
    public function billed(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_billed' => true,
        ]);
    }

    /**
     * สร้างข้อมูลสำหรับห้องเฉพาะ
     */
    public function forRoom(int $roomId): static
    {
        return $this->state(fn(array $attributes) => [
            'room_id' => $roomId,
        ]);
    }

    /**
     * สร้างข้อมูลสำหรับเดือนปัจจุบัน
     */
    public function currentMonth(): static
    {
        return $this->state(fn(array $attributes) => [
            'reading_date' => now()->startOfMonth(),
        ]);
    }

    /**
     * สร้างข้อมูลการใช้ไฟน้อย (50-150 หน่วย)
     */
    public function lowUsage(): static
    {
        $previousUnits = fake()->numberBetween(1000, 5000);
        
        return $this->state(fn(array $attributes) => [
            'previous_units' => $previousUnits,
            'current_units' => $previousUnits + fake()->numberBetween(50, 150),
        ]);
    }

    /**
     * สร้างข้อมูลการใช้ไฟสูง (300-500 หน่วย)
     */
    public function highUsage(): static
    {
        $previousUnits = fake()->numberBetween(1000, 5000);
        
        return $this->state(fn(array $attributes) => [
            'previous_units' => $previousUnits,
            'current_units' => $previousUnits + fake()->numberBetween(300, 500),
        ]);
    }
}
