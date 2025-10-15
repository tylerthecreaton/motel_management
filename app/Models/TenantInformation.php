<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantInformation extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tenant_information';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'rental_id',
        // ข้อมูลส่วนตัว
        'first_name',
        'last_name',
        'id_card_number',
        'date_of_birth',
        // ที่อยู่
        'current_address',
        'province',
        'district',
        'sub_district',
        'postal_code',
        // ข้อมูลติดต่อ
        'phone_number',
        'email',
        'line_id',
        // ผู้ติดต่อฉุกเฉิน
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_phone',
        // อาชีพ
        'occupation',
        'workplace',
        'monthly_income',
        // เอกสาร
        'id_card_copy_path',
        'photo_path',
        'additional_documents',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
        'monthly_income' => 'decimal:2',
        'additional_documents' => 'array', // JSON array
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'id_card_number', // ซ่อนเลขบัตรประชาชนเมื่อ serialize
    ];

    /**
     * Get the rental that owns this tenant information.
     */
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /**
     * Get the tenant's full name.
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the tenant's full address.
     *
     * @return string
     */
    public function getFullAddressAttribute(): string
    {
        return "{$this->current_address}, {$this->sub_district}, {$this->district}, {$this->province} {$this->postal_code}";
    }

    /**
     * Get masked ID card number (show only last 4 digits).
     *
     * @return string
     */
    public function getMaskedIdCardAttribute(): string
    {
        if (!$this->id_card_number) {
            return '';
        }
        
        return 'XXXXX-XXXXX-' . substr($this->id_card_number, -2);
    }

    /**
     * Scope a query to search by name.
     */
    public function scopeSearchByName($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%");
        });
    }

    /**
     * Scope a query to search by phone number.
     */
    public function scopeSearchByPhone($query, string $phone)
    {
        return $query->where('phone_number', 'like', "%{$phone}%");
    }
}
