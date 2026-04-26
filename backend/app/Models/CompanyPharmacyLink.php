<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Link between a corporate buyer (company) and a hardware seller (bayi).
 *
 * Legacy name kept for backward-compatibility — controller + UI still reference
 * "CompanyPharmacyLink" / `pharmacy()` while the underlying column rename
 * (pharmacy_id → seller_id, table → company_seller_links) has happened
 * via migration 2026_04_23_100100.
 */
class CompanyPharmacyLink extends Model
{
    use HasFactory;

    protected $table = 'company_seller_links';

    protected $fillable = [
        'company_id',
        'seller_id',
        'status',
        'message',
        'rejection_reason',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /**
     * Backward-compat mutator — code that still writes `->pharmacy_id = X`
     * maps to the renamed seller_id column.
     */
    public function setPharmacyIdAttribute($value): void
    {
        $this->attributes['seller_id'] = $value;
    }

    /**
     * Backward-compat accessor — code that still reads `->pharmacy_id` sees seller_id.
     */
    public function getPharmacyIdAttribute()
    {
        return $this->attributes['seller_id'] ?? null;
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(User::class, 'company_id');
    }

    /**
     * Seller side of the link (hardware bayi).
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Legacy alias — `pharmacy()` → `seller()` (same relation, different label).
     */
    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function approve(): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_at' => now(),
        ]);
    }

    public function reject(?string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'rejection_reason' => $reason,
            'rejected_at' => now(),
        ]);
    }
}
