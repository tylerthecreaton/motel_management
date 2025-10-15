<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    protected $model = Room::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roomTypes = ['Single Room', 'Double Room', 'Studio', 'Deluxe Room'];
        $statuses = ['available', 'occupied', 'maintenance'];

        // สิ่งอำนวยความสะดวกที่เป็นไปได้
        $allAmenities = ['wifi', 'air_con', 'water_heater', 'tv', 'refrigerator', 'balcony', 'parking'];

        // สุ่มเลือกสิ่งอำนวยความสะดวก 3-6 อย่าง
        $selectedAmenities = fake()->randomElements($allAmenities, fake()->numberBetween(3, 6));

        return [
            'name' => 'Room ' . fake()->unique()->numberBetween(101, 999),
            'type' => fake()->randomElement($roomTypes),
            'price_per_month' => fake()->randomFloat(2, 3000, 15000), // ราคา 3,000 - 15,000 บาท
            'status' => fake()->randomElement($statuses),
            'description' => fake()->optional(0.7)->paragraph(), // 70% จะมี description
            'image_path' => fake()->optional(0.5)->imageUrl(640, 480, 'room', true), // 50% จะมีรูปภาพ
            'amenities' => $selectedAmenities,
        ];
    }

    /**
     * Indicate that the room is available.
     */
    public function available(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'available',
        ]);
    }

    /**
     * Indicate that the room is occupied.
     */
    public function occupied(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'occupied',
        ]);
    }

    /**
     * Indicate that the room is under maintenance.
     */
    public function maintenance(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'maintenance',
        ]);
    }

    /**
     * Create a luxury room with premium amenities.
     */
    public function luxury(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'Deluxe Room',
            'price_per_month' => fake()->randomFloat(2, 10000, 20000),
            'amenities' => ['wifi', 'air_con', 'water_heater', 'tv', 'refrigerator', 'balcony', 'parking'],
            'description' => 'Luxury room with premium amenities and modern design.',
        ]);
    }
}
