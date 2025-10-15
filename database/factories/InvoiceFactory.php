<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Rental;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $issueDate = fake()->dateTimeBetween('-3 months', 'now');
        $dueDate = (clone $issueDate)->modify('+7 days'); // ครบกำหนด 7 วันหลังออกบิล

        $roomRent = fake()->randomFloat(2, 3000, 15000);
        $electricityCharge = fake()->randomFloat(2, 200, 1500);
        $waterCharge = fake()->randomFloat(2, 100, 300);

        return [
            'rental_id' => Rental::factory(),
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'issue_date' => $issueDate,
            'due_date' => $dueDate,
            'room_rent' => $roomRent,
            'electricity_charge' => $electricityCharge,
            'water_charge' => $waterCharge,
            // total_amount จะถูกคำนวณอัตโนมัติใน model
            'status' => fake()->randomElement(['unpaid', 'paid', 'overdue']),
        ];
    }

    /**
     * สร้างใบแจ้งหนี้ที่ยังไม่ชำระ
     */
    public function unpaid(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'unpaid',
            'due_date' => now()->addDays(7),
        ]);
    }

    /**
     * สร้างใบแจ้งหนี้ที่ชำระแล้ว
     */
    public function paid(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'paid',
        ]);
    }

    /**
     * สร้างใบแจ้งหนี้ที่เกินกำหนด
     */
    public function overdue(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'overdue',
            'due_date' => now()->subDays(fake()->numberBetween(1, 30)),
        ]);
    }

    /**
     * สร้างใบแจ้งหนี้สำหรับการเช่าเฉพาะ
     */
    public function forRental(int $rentalId): static
    {
        return $this->state(fn(array $attributes) => [
            'rental_id' => $rentalId,
        ]);
    }

    /**
     * สร้างใบแจ้งหนี้สำหรับเดือนปัจจุบัน
     */
    public function currentMonth(): static
    {
        return $this->state(fn(array $attributes) => [
            'issue_date' => now()->startOfMonth(),
            'due_date' => now()->startOfMonth()->addDays(7),
        ]);
    }

    /**
     * สร้างใบแจ้งหนี้ที่มีค่าใช้จ่ายสูง
     */
    public function highAmount(): static
    {
        return $this->state(fn(array $attributes) => [
            'room_rent' => fake()->randomFloat(2, 10000, 20000),
            'electricity_charge' => fake()->randomFloat(2, 1000, 2500),
            'water_charge' => fake()->randomFloat(2, 200, 500),
        ]);
    }

    /**
     * สร้างใบแจ้งหนี้ที่มีค่าใช้จ่ายต่ำ
     */
    public function lowAmount(): static
    {
        return $this->state(fn(array $attributes) => [
            'room_rent' => fake()->randomFloat(2, 3000, 5000),
            'electricity_charge' => fake()->randomFloat(2, 200, 500),
            'water_charge' => fake()->randomFloat(2, 100, 150),
        ]);
    }

    /**
     * สร้างใบแจ้งหนี้ที่ใกล้ครบกำหนด (เหลือ 1-3 วัน)
     */
    public function dueSoon(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'unpaid',
            'due_date' => now()->addDays(fake()->numberBetween(1, 3)),
        ]);
    }
}
