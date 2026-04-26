<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyPharmacyLink;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyPharmacyLinkController extends Controller
{
    /**
     * Get list of pharmacies that company can send request to
     * (For companies to browse pharmacies)
     */
    public function listPharmacies(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCompany()) {
            return response()->json([
                'message' => 'Sadece firmalar bu işlemi yapabilir'
            ], 403);
        }

        $query = User::pharmacies()
            ->where('verification_status', 'approved')
            ->select('id', 'seller_name', 'nickname', 'city');

        // Search by name, nickname, city, or VKN (tax_number)
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('seller_name', 'like', "%{$search}%")
                    ->orWhere('nickname', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('tax_number', 'like', "%{$search}%");
            });
        }

        $pharmacies = $query->paginate(20);

        // Add link status for each pharmacy
        $pharmacyIds = $pharmacies->pluck('id')->toArray();
        $existingLinks = $user->sentLinkRequests()
            ->whereIn('seller_id', $pharmacyIds)
            ->get()
            ->keyBy('seller_id');

        $pharmacies->getCollection()->transform(function ($pharmacy) use ($existingLinks) {
            $link = $existingLinks->get($pharmacy->id);
            $pharmacy->link_status = $link ? $link->status : null;
            $pharmacy->link_id = $link ? $link->id : null;
            return $pharmacy;
        });

        return response()->json($pharmacies);
    }

    /**
     * Send a link request to a pharmacy
     * (For companies)
     */
    public function sendRequest(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCompany()) {
            return response()->json([
                'message' => 'Sadece firmalar istek gönderebilir'
            ], 403);
        }

        $validated = $request->validate([
            'pharmacy_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:500',
        ]);

        // Check if pharmacy exists and is a pharmacy
        $pharmacy = User::find($validated['pharmacy_id']);
        if (!$pharmacy || !$pharmacy->isPharmacy()) {
            return response()->json([
                'message' => 'Geçersiz bayi'
            ], 400);
        }

        // Check if link already exists
        $existingLink = CompanyPharmacyLink::where('company_id', $user->id)
            ->where('seller_id', $pharmacy->id)
            ->first();

        if ($existingLink) {
            if ($existingLink->status === CompanyPharmacyLink::STATUS_PENDING) {
                return response()->json([
                    'message' => 'Bu bayiye zaten bekleyen bir isteğiniz var'
                ], 400);
            }
            if ($existingLink->status === CompanyPharmacyLink::STATUS_APPROVED) {
                return response()->json([
                    'message' => 'Bu bayi ile zaten bağlantınız var'
                ], 400);
            }
            // If rejected, allow re-sending
            $existingLink->update([
                'status' => CompanyPharmacyLink::STATUS_PENDING,
                'message' => $validated['message'] ?? null,
                'rejection_reason' => null,
                'rejected_at' => null,
            ]);
            $link = $existingLink;
        } else {
            $link = CompanyPharmacyLink::create([
                'company_id' => $user->id,
                'seller_id' => $pharmacy->id,
                'message' => $validated['message'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'İstek başarıyla gönderildi',
            'link' => $link->load('seller:id,seller_name,city'),
        ]);
    }

    /**
     * Get company's sent requests
     * (For companies)
     */
    public function mySentRequests(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCompany()) {
            return response()->json([
                'message' => 'Sadece firmalar bu işlemi yapabilir'
            ], 403);
        }

        $links = $user->sentLinkRequests()
            ->with('seller:id,seller_name,nickname,city,tax_number')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($links);
    }

    /**
     * Cancel a pending request
     * (For companies)
     */
    public function cancelRequest(Request $request, CompanyPharmacyLink $link): JsonResponse
    {
        $user = $request->user();

        if ($link->company_id !== $user->id) {
            return response()->json([
                'message' => 'Bu istek size ait değil'
            ], 403);
        }

        if (!$link->isPending()) {
            return response()->json([
                'message' => 'Sadece bekleyen istekler iptal edilebilir'
            ], 400);
        }

        $link->delete();

        return response()->json([
            'message' => 'İstek iptal edildi'
        ]);
    }

    /**
     * Get pharmacy's received requests
     * (For pharmacies)
     */
    public function myReceivedRequests(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPharmacy()) {
            return response()->json([
                'message' => 'Sadece bayiler bu işlemi yapabilir'
            ], 403);
        }

        $status = $request->query('status'); // pending, approved, rejected, or null for all

        $query = $user->receivedLinkRequests()
            ->with('company:id,seller_name,nickname,email,phone');

        if ($status) {
            $query->where('status', $status);
        }

        $links = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($links);
    }

    /**
     * Approve a link request
     * (For pharmacies)
     */
    public function approveRequest(Request $request, CompanyPharmacyLink $link): JsonResponse
    {
        $user = $request->user();

        if ($link->seller_id !== $user->id) {
            return response()->json([
                'message' => 'Bu istek size ait değil'
            ], 403);
        }

        if (!$link->isPending()) {
            return response()->json([
                'message' => 'Bu istek zaten işlem görmüş'
            ], 400);
        }

        $link->approve();

        return response()->json([
            'message' => 'İstek onaylandı',
            'link' => $link->load('company:id,seller_name,email'),
        ]);
    }

    /**
     * Reject a link request
     * (For pharmacies)
     */
    public function rejectRequest(Request $request, CompanyPharmacyLink $link): JsonResponse
    {
        $user = $request->user();

        if ($link->seller_id !== $user->id) {
            return response()->json([
                'message' => 'Bu istek size ait değil'
            ], 403);
        }

        if (!$link->isPending()) {
            return response()->json([
                'message' => 'Bu istek zaten işlem görmüş'
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $link->reject($validated['reason'] ?? null);

        return response()->json([
            'message' => 'İstek reddedildi',
            'link' => $link,
        ]);
    }

    /**
     * Revoke an approved link
     * (For pharmacies)
     */
    public function revokeLink(Request $request, CompanyPharmacyLink $link): JsonResponse
    {
        $user = $request->user();

        if ($link->seller_id !== $user->id) {
            return response()->json([
                'message' => 'Bu bağlantı size ait değil'
            ], 403);
        }

        if (!$link->isApproved()) {
            return response()->json([
                'message' => 'Sadece onaylanmış bağlantılar iptal edilebilir'
            ], 400);
        }

        $link->delete();

        return response()->json([
            'message' => 'Bağlantı iptal edildi'
        ]);
    }

    /**
     * Get count of pending requests for pharmacy (for badge)
     */
    public function pendingCount(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPharmacy()) {
            return response()->json(['count' => 0]);
        }

        $count = $user->pendingLinkRequests()->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get list of approved seller (pharmacy) IDs for a company
     * Lightweight endpoint for cart/buy permission checks
     */
    public function approvedSellerIds(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCompany()) {
            return response()->json(['seller_ids' => []]);
        }

        $sellerIds = $user->sentLinkRequests()
            ->where('status', \App\Models\CompanyPharmacyLink::STATUS_APPROVED)
            ->pluck('seller_id')
            ->toArray();

        return response()->json(['seller_ids' => $sellerIds]);
    }
}
