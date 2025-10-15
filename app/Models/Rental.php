<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rental extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'room_id',
        'start_date',
        'end_date',
        'status',
        'total_price',
        // ข้อมูลสัญญา
        'contract_number',
        'contract_date',
        'deposit_amount',
        'advance_payment',
        'monthly_rent',
        'special_conditions',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'contract_date' => 'date',
        'total_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'advance_payment' => 'decimal:2',
        'monthly_rent' => 'decimal:2',
    ];

    /**
     * Get the user that owns the rental.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the room that is being rented.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get all payments for this rental.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get all invoices for this rental.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the tenant information for this rental.
     */
    public function tenantInformation()
    {
        return $this->hasOne(TenantInformation::class);
    }

    /**
     * Get the total amount paid for this rental.
     */
    public function getTotalPaidAttribute(): float
    {
        return $this->payments()
            ->where('status', 'paid')
            ->sum('amount');
    }

    /**
     * Get the remaining balance for this rental.
     */
    public function getRemainingBalanceAttribute(): float
    {
        return $this->total_price - $this->total_paid;
    }

    /**
     * Check if the rental is fully paid.
     */
    public function isFullyPaid(): bool
    {
        return $this->remaining_balance <= 0;
    }

    /**
     * Scope a query to only include active rentals.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include pending rentals.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
