<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'price_per_month',
        'status',
        'description',
        'image_path',
        'amenities',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price_per_month' => 'decimal:2',
        'amenities' => 'array', // JSON จะถูก cast เป็น array โดยอัตโนมัติ
    ];

    /**
     * Get all rentals for this room.
     */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    /**
     * Get the current active rental for this room.
     */
    public function currentRental()
    {
        return $this->hasOne(Rental::class)
            ->where('status', 'active')
            ->latest();
    }

    /**
     * Scope a query to only include available rooms.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include occupied rooms.
     */
    public function scopeOccupied($query)
    {
        return $query->where('status', 'occupied');
    }

    /**
     * Check if the room is available.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
