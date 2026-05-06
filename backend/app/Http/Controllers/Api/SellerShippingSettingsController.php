<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Bayi-bazlı kargo ayarları (her bayinin kendi sabit kargo ücreti +
 * ücretsiz kargo eşiği). Sayfa: /market/hesabim?tab=ayarlarim&sub=kargo-ayarlari
 *
 * Veri kaynağı: users tablosu (shipping_flat_fee, free_shipping_threshold).
 * Platform fallback: commission.shipping_fallback_fee + commission.min_order_for_free_shipping_cap
 */
class SellerShippingSettingsController extends Controller
{
    /**
     * Bayinin kendi kargo ayarlarını döndür.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->canSell()) {
            return response()->json([
                'success' => false,
                'error' => 'Bu sayfaya yalnızca satıcı hesapları erişebilir.',
            ], 403);
        }

        $platformFallback = (float) Setting::getValue('commission.shipping_fallback_fee', 49.90);
        $platformCap = Setting::getValue('commission.min_order_for_free_shipping_cap', null);

        return response()->json([
            'success' => true,
            'data' => [
                'shipping_flat_fee' => $user->shipping_flat_fee !== null ? (float) $user->shipping_flat_fee : null,
                'free_shipping_threshold' => $user->free_shipping_threshold !== null ? (float) $user->free_shipping_threshold : null,
                'platform' => [
                    'fallback_fee' => $platformFallback,
                    'free_shipping_cap' => $platformCap !== null && $platformCap !== '' ? (float) $platformCap : null,
                ],
            ],
        ]);
    }

    /**
     * Bayi kargo ayarlarını güncelle.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->canSell()) {
            return response()->json([
                'success' => false,
                'error' => 'Bu sayfaya yalnızca satıcı hesapları erişebilir.',
            ], 403);
        }

        $validated = $request->validate([
            'shipping_flat_fee' => ['nullable', 'numeric', 'min:0', 'max:9999.99'],
            'free_shipping_threshold' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
        ]);

        $platformCap = Setting::getValue('commission.min_order_for_free_shipping_cap', null);
        $threshold = $validated['free_shipping_threshold'] ?? null;

        if ($threshold !== null && $platformCap !== null && $platformCap !== '' && (float) $threshold > (float) $platformCap) {
            return response()->json([
                'success' => false,
                'error' => 'Ücretsiz kargo eşiği platform üst sınırını ('
                    .number_format((float) $platformCap, 2, ',', '.')
                    .'₺) aşamaz.',
            ], 422);
        }

        $user->forceFill([
            'shipping_flat_fee' => $validated['shipping_flat_fee'] ?? null,
            'free_shipping_threshold' => $validated['free_shipping_threshold'] ?? null,
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Kargo ayarları kaydedildi.',
            'data' => [
                'shipping_flat_fee' => $user->shipping_flat_fee !== null ? (float) $user->shipping_flat_fee : null,
                'free_shipping_threshold' => $user->free_shipping_threshold !== null ? (float) $user->free_shipping_threshold : null,
            ],
        ]);
    }
}
