<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSellerRole
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated user has seller capabilities.
     * In this B2B hardware context, all verified sellers (bayi) can sell.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // User must be authenticated
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Kimlik doğrulama gerekli.',
                'error' => 'unauthenticated',
            ], 401);
        }

        // Super admins always have access
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // User must be a seller (bayi)
        if (!$user->isSeller()) {
            return response()->json([
                'success' => false,
                'message' => 'Bu islemi yapmak icin bayi olmaniz gerekmektedir.',
                'error' => 'not_seller',
            ], 403);
        }

        // User must be verified/approved
        if (!$user->isApproved()) {
            return response()->json([
                'success' => false,
                'message' => 'Hesabiniz henuz onaylanmamis. Satis yapabilmek icin hesabinizin onaylanmasi gerekmektedir.',
                'error' => 'not_approved',
                'verification_status' => $user->verification_status,
            ], 403);
        }

        // User must have all required documents approved
        if (!$user->documents_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Satis yapabilmek icin tum gerekli belgelerin onaylanmasi gerekmektedir.',
                'error' => 'documents_not_approved',
                'has_required_documents' => $user->hasRequiredDocuments(),
            ], 403);
        }

        return $next($request);
    }
}
