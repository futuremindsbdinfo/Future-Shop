<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Allowed account roles. Enforced at the application layer via validation,
     * since Postgres enum constraints are impractical to alter.
     */
    public const ROLES = ['customer', 'vendor', 'admin', 'delivery'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'avatar',
        'is_active',
        'referral_code',
        'referred_by_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The vendor profile owned by this user (if any).
     */
    public function vendor(): HasOne
    {
        return $this->hasOne(Vendor::class);
    }

    /**
     * Orders placed by this user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Orders assigned to this user for delivery.
     */
    public function deliveryOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'delivery_user_id');
    }

    /**
     * Saved delivery addresses.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Wishlisted products.
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Customer reward / coupon credit wallet.
     */
    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    /**
     * Immutable wallet ledger entries for this user.
     */
    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * The user who referred this user (if any).
     */
    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    /**
     * Users that this user referred (via their referral_code).
     */
    public function referrals(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by_id');
    }

    /**
     * Generate a unique alphanumeric referral code (8 chars, ambiguity-resistant alphabet).
     */
    public static function generateReferralCode(): string
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 8));
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Auto-assign a referral_code to new users that don't have one.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (User $user) {
            if (empty($user->referral_code)) {
                $user->referral_code = static::generateReferralCode();
            }
        });
    }

    /**
     * Convenience role checks.
     */
    public function isVendor(): bool
    {
        return $this->role === 'vendor';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isDelivery(): bool
    {
        return $this->role === 'delivery';
    }
}
