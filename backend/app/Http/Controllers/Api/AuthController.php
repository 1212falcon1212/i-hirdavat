<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user (hardware seller or corporate buyer).
     * VKN (tax_number) + MERSİS + Ticaret Sicil validation runs in RegisterRequest.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $role = $validated['role'] ?? User::ROLE_SELLER;

        $user = DB::transaction(function () use ($validated, $role) {
            $userData = [
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'seller_name' => $validated['seller_name'] ?? $validated['pharmacy_name'] ?? null,
                'nickname' => $validated['nickname'],
                'phone' => $validated['phone'] ?? null,
                'whatsapp_number' => $validated['whatsapp_number'] ?? null,
                'website' => $validated['website'] ?? null,
                'sector_type' => $validated['sector_type'] ?? null,
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'district' => $validated['district'] ?? null,
                'tax_number' => $validated['tax_number'],
                'tax_office' => $validated['tax_office'] ?? null,
                'mersis_no' => $validated['mersis_no'] ?? null,
                'trade_registry_no' => $validated['trade_registry_no'] ?? null,
                'trade_name' => $validated['trade_name'] ?? null,
                'kep_address' => $validated['kep_address'] ?? null,
                'role' => $role,
                'is_verified' => true,
                'verified_at' => now(),
            ];

            return User::create($userData);
        });

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Kayıt başarılı.',
            'user' => $this->userPayload($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and return token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Geçersiz e-posta veya şifre.',
                'error_code' => 'INVALID_CREDENTIALS',
            ], 401);
        }

        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Hesabınız henüz doğrulanmamış.',
                'error_code' => 'NOT_VERIFIED',
            ], 403);
        }

        if ($validated['revoke_others'] ?? false) {
            $user->tokens()->delete();
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Giriş başarılı.',
            'user' => $this->userPayload($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Çıkış başarılı.',
        ]);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Tüm cihazlardan çıkış yapıldı.',
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->userPayload($request->user()),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mevcut şifre yanlış.',
                'error_code' => 'INVALID_CURRENT_PASSWORD',
            ], 400);
        }

        $user->update(['password' => Hash::make($validated['new_password'])]);

        return response()->json([
            'success' => true,
            'message' => 'Şifreniz başarıyla değiştirildi.',
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nickname' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
            'website' => 'nullable|string|max:255',
            'sector_type' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'trade_name' => 'nullable|string|max:255',
            'kep_address' => 'nullable|string|max:255',
            'mersis_no' => 'nullable|string|regex:/^\d{16}$/',
            'tax_number' => 'nullable|string|regex:/^\d{10}$/',
            'tax_office' => 'nullable|string|max:100',
            'trade_registry_no' => 'nullable|string|max:30',
        ]);

        $user = $request->user();

        // Lock mandatory identity fields once set
        $lockedFields = ['trade_name', 'tax_number', 'tax_office', 'mersis_no', 'trade_registry_no', 'kep_address', 'address', 'city', 'district'];
        foreach ($lockedFields as $field) {
            if (!empty($user->{$field}) && isset($validated[$field])) {
                unset($validated[$field]);
            }
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil bilgileriniz güncellendi.',
            'user' => $this->userPayload($user),
        ]);
    }

    public function deactivateAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'password' => 'required|string',
            'reason' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Şifre yanlış.',
                'error_code' => 'INVALID_PASSWORD',
            ], 400);
        }

        $user->update([
            'is_verified' => false,
            'deactivated_at' => now(),
            'deactivation_reason' => $validated['reason'] ?? null,
        ]);

        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hesabınız devre dışı bırakıldı.',
        ]);
    }

    /**
     * Shared user payload shape for API responses.
     *
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'email' => $user->email,
            'seller_name' => $user->seller_name,
            'nickname' => $user->nickname,
            'display_name' => $user->display_name,
            'phone' => $user->phone,
            'whatsapp_number' => $user->whatsapp_number,
            'website' => $user->website,
            'sector_type' => $user->sector_type,
            'address' => $user->address,
            'city' => $user->city,
            'district' => $user->district,
            'trade_name' => $user->trade_name,
            'kep_address' => $user->kep_address,
            'mersis_no' => $user->mersis_no,
            'tax_number' => $user->tax_number,
            'tax_office' => $user->tax_office,
            'trade_registry_no' => $user->trade_registry_no,
            'is_verified' => $user->is_verified,
            'role' => $user->role,
            'created_at' => $user->created_at,
        ];
    }
}
