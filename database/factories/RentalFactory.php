<?php

namespace Database\Factories;

use App\Models\Rental;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rental>
 */
class RentalFactory extends Factory
{
    protected $model = Rental::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-6 months', '+1 month');
        $endDate = (clone $startDate)->modify('+' . fake()->numberBetween(1, 12) . ' months');

        $statuses = ['pending', 'approved', 'active', 'completed', 'cancelled'];

        return [
            'user_id' => User::factory(),
            'room_id' => Room::factory(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => fake()->randomElement($statuses),
            'total_price' => fake()->randomFloat(2, 3000, 50000),
        ];
    }

    /**
     * Indicate that the rental is pending.
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the rental is active.
     */
    public function active(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'active',
            'start_date' => now()->subMonths(1),
            'end_date' => now()->addMonths(11),
        ]);
    }

    /**
     * Indicate that the rental is completed.
     */
    public function completed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'completed',
            'start_date' => now()->subMonths(12),
            'end_date' => now()->subMonths(1),
        ]);
    }
}
