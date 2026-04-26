<?php

namespace App\Models;

use App\Mail\PasswordResetMail;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser, HasName
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Role constants
     */
    public const ROLE_SUPER_ADMIN = 'super-admin';

    public const ROLE_SELLER = 'seller';

    public const ROLE_COMPANY = 'company';

    // Backward compatibility — legacy pharmacy/pharmacist values map to 'seller'
    public const ROLE_PHARMACY = 'pharmacy';

    public const ROLE_PHARMACIST = 'pharmacist';

    public const AVAILABLE_ROLES = [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_SELLER,
        self::ROLE_COMPANY,
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'email',
        'password',
        'seller_name',
        'nickname',
        'phone',
        'whatsapp_number',
        'website',
        'sector_type',
        'address',
        'city',
        'district',
        'trade_name',
        'kep_address',
        'mersis_no',
        'tax_number',
        'tax_office',
        'trade_registry_no',
        'role',
        'is_verified',
        'verified_at',
        'verification_status',
        'rejection_reason',
        'documents',
        'approved_at',
        'approved_by',
        'contract_signed_at',
        'contract_ip',
        'contract_user_agent',
        'deactivated_at',
        'deactivation_reason',
        'seller_score',
        'seller_total_orders',
        'seller_review_count',
        'paytr_utoken',
        'fcm_token',
        'fcm_token_updated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'contract_signed_at' => 'datetime',
            'fcm_token_updated_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'documents' => 'array',
            'seller_score' => 'float',
        ];
    }

    /**
     * Verification status labels in Turkish
     */
    public const VERIFICATION_STATUS_LABELS = [
        'pending' => 'Onay Bekliyor',
        'approved' => 'Onaylandı',
        'rejected' => 'Reddedildi',
    ];

    /**
     * Şifre sıfırlama bildirimi için özel e-posta gönderir
     */
    public function sendPasswordResetNotification($token): void
    {
        Mail::to($this->email)->send(new PasswordResetMail($this, $token));
    }

    /**
     * Get the name for Filament panel
     */
    public function getFilamentName(): string
    {
        return $this->seller_name ?? $this->email;
    }

    /**
     * Get display name (nickname if set, otherwise seller_name)
     * Used for public-facing display on the site.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->nickname ?: ($this->seller_name ?? $this->email);
    }

    /**
     * Backward-compat accessor — `$user->pharmacy_name` still works after the
     * `pharmacy_name → seller_name` column rename migration.
     */
    public function getPharmacyNameAttribute(): ?string
    {
        return $this->attributes['seller_name'] ?? null;
    }

    /**
     * Backward-compat mutator — code that still writes `$user->pharmacy_name = …`
     * maps to the new seller_name column.
     */
    public function setPharmacyNameAttribute(?string $value): void
    {
        $this->attributes['seller_name'] = $value;
    }

    /**
     * Check if user can access Filament panel
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'super-admin';
    }

    /**
     * Check if user is a super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super-admin';
    }

    /**
     * Check if user is a seller (hardware seller / bayi).
     * Accepts legacy 'pharmacy' / 'pharmacist' values for backward compatibility.
     */
    public function isSeller(): bool
    {
        return in_array($this->role, [
            self::ROLE_SELLER,
            self::ROLE_PHARMACY,
            self::ROLE_PHARMACIST,
        ], true);
    }

    /**
     * Legacy alias — isPharmacy() now maps to isSeller() semantics.
     */
    public function isPharmacy(): bool
    {
        return $this->isSeller();
    }

    /**
     * Check if user is a company (firma).
     */
    public function isCompany(): bool
    {
        return $this->role === self::ROLE_COMPANY;
    }

    /**
     * Legacy alias for isPharmacy() / isSeller().
     */
    public function isPharmacist(): bool
    {
        return $this->isSeller();
    }

    /**
     * Check if user can buy products
     * - Pharmacies can always buy
     * - Companies can only buy from pharmacies they have approved links with
     */
    public function canBuy(): bool
    {
        return $this->isPharmacy();
    }

    /**
     * Check if user can buy from a specific seller
     * - Pharmacies can buy from any seller (but not from themselves)
     * - Companies can only buy from pharmacies they have approved links with
     */
    public function canBuyFrom(User $seller): bool
    {
        // Can't buy from yourself
        if ($this->id === $seller->id) {
            return false;
        }

        // Pharmacies can buy from anyone
        if ($this->isPharmacy()) {
            return true;
        }

        // Companies can only buy from pharmacies they have approved links with
        if ($this->isCompany()) {
            return $this->hasApprovedLinkWith($seller);
        }

        return false;
    }

    /**
     * Check if company has an approved link with a pharmacy
     */
    public function hasApprovedLinkWith(User $pharmacy): bool
    {
        if (! $this->isCompany() || ! $pharmacy->isPharmacy()) {
            return false;
        }

        return $this->sentLinkRequests()
            ->where('seller_id', $pharmacy->id)
            ->where('status', CompanyPharmacyLink::STATUS_APPROVED)
            ->exists();
    }

    /**
     * Get link requests sent by this company
     */
    public function sentLinkRequests(): HasMany
    {
        return $this->hasMany(CompanyPharmacyLink::class, 'company_id');
    }

    /**
     * Get link requests received by this pharmacy
     */
    public function receivedLinkRequests(): HasMany
    {
        return $this->hasMany(CompanyPharmacyLink::class, 'seller_id');
    }

    /**
     * Get approved pharmacy links for this company
     */
    public function approvedPharmacyLinks(): HasMany
    {
        return $this->sentLinkRequests()->where('status', CompanyPharmacyLink::STATUS_APPROVED);
    }

    /**
     * Get approved company links for this pharmacy
     */
    public function approvedCompanyLinks(): HasMany
    {
        return $this->receivedLinkRequests()->where('status', CompanyPharmacyLink::STATUS_APPROVED);
    }

    /**
     * Get pending link requests for this pharmacy
     */
    public function pendingLinkRequests(): HasMany
    {
        return $this->receivedLinkRequests()->where('status', CompanyPharmacyLink::STATUS_PENDING);
    }

    /**
     * Check if user can sell products (pharmacies and companies can sell)
     */
    public function canSell(): bool
    {
        return $this->isPharmacy() || $this->isCompany();
    }

    /**
     * Check if user is approved
     */
    public function isApproved(): bool
    {
        return $this->verification_status === 'approved';
    }

    /**
     * Check if user is pending approval
     */
    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    /**
     * Get all offers by this user (seller)
     */
    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class, 'seller_id');
    }

    /**
     * Get only active offers
     */
    public function activeOffers(): HasMany
    {
        return $this->offers()->where('status', 'active');
    }

    /**
     * Get user's wallet
     */
    public function wallet(): HasOne
    {
        return $this->hasOne(SellerWallet::class, 'seller_id');
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(SellerBankAccount::class, 'seller_id');
    }

    public function defaultBankAccount(): HasOne
    {
        return $this->hasOne(SellerBankAccount::class, 'seller_id')->where('is_default', true);
    }

    /**
     * Get user's addresses
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class);
    }

    /**
     * Get user's orders as buyer
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get order items where user is seller
     */
    public function sellerOrderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'seller_id');
    }

    /**
     * Get verification status label
     */
    public function getVerificationStatusLabelAttribute(): string
    {
        return self::VERIFICATION_STATUS_LABELS[$this->verification_status] ?? $this->verification_status;
    }

    /**
     * Approve this user
     */
    public function approve(int $approvedBy): void
    {
        $this->update([
            'verification_status' => 'approved',
            'is_verified' => true,
            'verified_at' => now(),
            'approved_at' => now(),
            'approved_by' => $approvedBy,
            'rejection_reason' => null,
        ]);
    }

    /**
     * Reject this user
     */
    public function reject(string $reason, int $rejectedBy): void
    {
        $this->update([
            'verification_status' => 'rejected',
            'is_verified' => false,
            'rejection_reason' => $reason,
            'approved_by' => $rejectedBy,
        ]);
    }

    /**
     * Scope for pending users
     */
    public function scopePending($query)
    {
        return $query->where('verification_status', 'pending');
    }

    /**
     * Scope for sellers only (includes legacy pharmacy/pharmacist roles for backward compat).
     */
    public function scopeSellers($query)
    {
        return $query->whereIn('role', [self::ROLE_SELLER, self::ROLE_PHARMACY, self::ROLE_PHARMACIST]);
    }

    /**
     * Legacy alias — scopePharmacies() now maps to scopeSellers().
     */
    public function scopePharmacies($query)
    {
        return $this->scopeSellers($query);
    }

    /**
     * Scope for companies only
     */
    public function scopeCompanies($query)
    {
        return $query->where('role', self::ROLE_COMPANY);
    }

    /**
     * Backward compatibility - alias for scopePharmacies()
     */
    public function scopePharmacists($query)
    {
        return $this->scopePharmacies($query);
    }

    /**
     * Get seller documents
     */
    public function sellerDocuments(): HasMany
    {
        return $this->hasMany(SellerDocument::class);
    }

    /**
     * Alias for sellerDocuments
     */
    public function documents(): HasMany
    {
        return $this->sellerDocuments();
    }

    /**
     * Check if user has all required documents uploaded
     */
    public function hasRequiredDocuments(): bool
    {
        $requiredTypes = SellerDocument::REQUIRED_TYPES;
        $uploadedTypes = $this->sellerDocuments()->pluck('type')->toArray();

        return count(array_intersect($uploadedTypes, $requiredTypes)) === count($requiredTypes);
    }

    /**
     * Check if all required documents are approved
     */
    public function getDocumentsApprovedAttribute(): bool
    {
        $requiredTypes = SellerDocument::REQUIRED_TYPES;
        $approvedTypes = $this->sellerDocuments()
            ->where('status', 'approved')
            ->pluck('type')
            ->toArray();

        return count(array_intersect($approvedTypes, $requiredTypes)) === count($requiredTypes);
    }

    /**
     * Check if user can access the platform (documents approved or is super-admin)
     */
    public function canAccessPlatform(): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->documents_approved;
    }

    /**
     * Get user's ERP integrations
     */
    public function integrations(): HasMany
    {
        return $this->hasMany(UserIntegration::class);
    }

    /**
     * Get user's notifications
     */
    public function userNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class);
    }

    /**
     * Get campaigns created by this seller
     */
    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'seller_id');
    }

    /**
     * Get coupons created by this seller
     */
    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class, 'seller_id');
    }

    /**
     * Get reviews received as seller
     */
    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'seller_id');
    }

    /**
     * Get reviews given as buyer
     */
    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'buyer_id');
    }

    /**
     * Get seller rating based on approved reviews
     */
    public function getSellerRatingAttribute(): array
    {
        return Review::getSellerRatings($this->id);
    }

    /**
     * Get overall seller score (0-10 scale, cached in DB).
     * Returns null for new sellers.
     */
    public function getSellerScoreAttribute(): ?float
    {
        return $this->attributes['seller_score'] ?? null;
    }

    /**
     * Check if seller can create campaigns (requires rating >= 7)
     */
    public function canCreateCampaign(): bool
    {
        // Allow new sellers (null score)
        if ($this->seller_score === null) {
            return true;
        }

        return $this->seller_score >= 7;
    }
}
