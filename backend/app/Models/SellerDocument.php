<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerDocument extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Document type labels in Turkish.
     * Enum key'leri migration'dan geldiği için aynı — sadece label'lar hırdavat B2B için uyumlu.
     */
    public const TYPE_LABELS = [
        'ruhsat' => 'Faaliyet Belgesi',
        'oda_kaydi' => 'Oda Kayıt Belgesi (Ticaret / Sanayi)',
        'kimlik' => 'Kimlik Fotokopisi',
        'vergi_levhasi' => 'Vergi Levhası',
        'imza_sirkusu' => 'İmza Sirküleri',
        'ticaret_sicili' => 'Ticaret Sicil Gazetesi',
        'sozlesme' => 'Üyelik Sözleşmesi',
        'diger' => 'Diğer',
    ];

    /**
     * Status labels in Turkish
     */
    public const STATUS_LABELS = [
        'pending' => 'Bekliyor',
        'approved' => 'Onaylandı',
        'rejected' => 'Reddedildi',
    ];

    /**
     * Required document types for sellers (bayi / hardware vendor).
     */
    public const REQUIRED_TYPES = ['vergi_levhasi', 'imza_sirkusu'];

    /**
     * Required document types for corporate buyers (company).
     */
    public const REQUIRED_TYPES_COMPANY = ['vergi_levhasi', 'kimlik'];

    /**
     * Get required types based on user role.
     */
    public static function getRequiredTypes(string $role): array
    {
        if ($role === 'company') {
            return self::REQUIRED_TYPES_COMPANY;
        }
        return self::REQUIRED_TYPES;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getTypeLabelAttribute(): string
    {
        return self::TYPE_LABELS[$this->type] ?? $this->type;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }

    /**
     * Approve this document
     */
    public function approve(int $reviewerId): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'rejection_reason' => null,
        ]);
    }

    /**
     * Reject this document
     */
    public function reject(string $reason, int $reviewerId): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Scope for pending documents
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved documents
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Get file URL
     */
    public function getFileUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }
}
