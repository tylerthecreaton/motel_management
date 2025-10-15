<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Rental;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $paymentMethods = ['Bank Transfer', 'PromptPay', 'Cash', 'Credit Card'];
        $statuses = ['pending', 'paid', 'failed'];

        return [
            'rental_id' => Rental::factory(),
            'amount' => fake()->randomFloat(2, 1000, 15000),
            'payment_date' => fake()->dateTimeBetween('-3 months', 'now'),
            'status' => fake()->randomElement($statuses),
            'payment_method' => fake()->randomElement($paymentMethods),
            'slip_image_path' => fake()->optional(0.6)->imageUrl(400, 600, 'payment', true), // 60% จะมีสลิป
        ];
    }

    /**
     * Indicate that the payment is paid.
     */
    public function paid(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'paid',
            'payment_date' => fake()->dateTimeBetween('-2 months', 'now'),
        ]);
    }

    /**
     * Indicate that the payment is pending.
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'pending',
            'payment_date' => now(),
            'slip_image_path' => null,
        ]);
    }

    /**
     * Indicate that the payment is failed.
     */
    public function failed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'failed',
        ]);
    }
}
