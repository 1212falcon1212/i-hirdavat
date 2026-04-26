# Contract System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two contract types to the B2B Pharmacy platform: (1) Registration contract — dynamic PDF generation, download+sign+upload+admin review, and (2) Per-order sales contract — auto-generated Farmazon-style PDF with buyer/seller/product details.

**Architecture:** Extends existing `contracts` table and `LegalController`. Registration contract uses DomPDF + Blade template with user profile data as dynamic fields. Sales contract generates on-demand from order+user data. Trade info fields (KEP, MERSIS, tax) already exist on `seller_bank_accounts` — we'll read from there. New `sozlesme` document type for signed uploads.

**Tech Stack:** Laravel 12, DomPDF (barryvdh/laravel-dompdf — already installed), Blade templates, Next.js 16, React 19, TypeScript

**Existing Infrastructure:**
- `contracts` table: id, user_id, type, version, ip_address, approved_at, metadata (JSON)
- `Contract` model: user_id, type, version, ip_address, metadata
- `LegalController`: getDocument(), approveContract(), generateB2BContract() (stub)
- `seller_bank_accounts`: tax_id, tax_office, kep_address, mersis_number (billing fields)
- `SellerDocument` model: type enum with approve/reject flow, Filament admin resource
- `resources/views/legal/b2b-contract.blade.php`: basic skeleton template

---

### Task 1: Migration — Add trade fields to users table + contract tracking columns

**Files:**
- Create: `backend/database/migrations/2026_02_25_000001_add_trade_and_contract_fields_to_users.php`
- Modify: `backend/app/Models/User.php`

**Step 1: Create the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Trade info fields (for contracts)
            $table->string('trade_name', 255)->nullable()->after('city');
            $table->string('kep_address', 255)->nullable()->after('trade_name');
            $table->string('mersis_no', 20)->nullable()->after('kep_address');
            $table->string('tax_number', 20)->nullable()->after('mersis_no');
            $table->string('tax_office', 100)->nullable()->after('tax_number');

            // Contract tracking
            $table->timestamp('contract_signed_at')->nullable()->after('approved_by');
            $table->string('contract_ip', 45)->nullable()->after('contract_signed_at');
            $table->text('contract_user_agent')->nullable()->after('contract_ip');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'trade_name', 'kep_address', 'mersis_no',
                'tax_number', 'tax_office',
                'contract_signed_at', 'contract_ip', 'contract_user_agent',
            ]);
        });
    }
};
```

**Step 2: Update User model $fillable**

Add to `$fillable` array in `backend/app/Models/User.php`:
```php
'trade_name',
'kep_address',
'mersis_no',
'tax_number',
'tax_office',
'contract_signed_at',
'contract_ip',
'contract_user_agent',
```

Add to `casts()`:
```php
'contract_signed_at' => 'datetime',
```

**Step 3: Run migration**

```bash
cd backend && php artisan migrate
```

**Step 4: Commit**

```bash
git add backend/database/migrations/2026_02_25_000001_add_trade_and_contract_fields_to_users.php backend/app/Models/User.php
git commit -m "feat: add trade info and contract tracking fields to users table"
```

---

### Task 2: Add `sozlesme` document type to SellerDocument

**Files:**
- Modify: `backend/app/Models/SellerDocument.php`

**Step 1: Add sozlesme to TYPE_LABELS**

In `SellerDocument.php`, add `'sozlesme' => 'Üyelik Sözleşmesi'` to the `TYPE_LABELS` constant.

**Step 2: Do NOT add to REQUIRED_TYPES yet**

The registration contract will be required, but we'll handle that separately since the template isn't ready yet. For now, just add the type label so it's available for uploads.

**Step 3: Commit**

```bash
git add backend/app/Models/SellerDocument.php
git commit -m "feat: add sozlesme document type to SellerDocument"
```

---

### Task 3: Backend — Registration contract PDF generation endpoint

**Files:**
- Modify: `backend/app/Http/Controllers/Api/LegalController.php`
- Create: `backend/resources/views/legal/registration-contract.blade.php`
- Modify: `backend/routes/api.php`

**Step 1: Create the Blade template for registration contract**

Create `backend/resources/views/legal/registration-contract.blade.php`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; line-height: 1.6; color: #333; }
        h1 { text-align: center; font-size: 18px; margin-bottom: 30px; }
        h2 { font-size: 14px; margin-top: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .header img { max-width: 150px; }
        .party-info { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; }
        .party-info strong { display: block; margin-bottom: 5px; font-size: 13px; }
        .signature-area { margin-top: 60px; display: flex; }
        .signature-box { width: 45%; display: inline-block; text-align: center; padding-top: 40px; border-top: 1px solid #333; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        table td { padding: 4px 8px; border: 1px solid #ddd; }
        table td:first-child { font-weight: bold; width: 35%; background: #f9f9f9; }
        .footer { margin-top: 40px; font-size: 10px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>B2B ECZANE PAZARYERI UYELIK SOZLESMESI</h1>
        <p>Sozlesme No: {{ $contract_number }}</p>
        <p>Tarih: {{ $date }}</p>
    </div>

    <div class="party-info">
        <strong>PLATFORM BILGILERI</strong>
        <table>
            <tr><td>Unvan</td><td>i-Depo B2B Eczane Pazaryeri</td></tr>
            <tr><td>Adres</td><td>Istanbul, Turkiye</td></tr>
            <tr><td>Web</td><td>www.i-depo.com</td></tr>
        </table>
    </div>

    <div class="party-info">
        <strong>UYE BILGILERI</strong>
        <table>
            <tr><td>Eczane / Sirket Adi</td><td>{{ $pharmacy_name }}</td></tr>
            <tr><td>Ticari Unvan</td><td>{{ $trade_name }}</td></tr>
            <tr><td>Yetkili Kisi</td><td>{{ $authorized_person }}</td></tr>
            <tr><td>GLN Numarasi</td><td>{{ $gln_code }}</td></tr>
            <tr><td>Vergi No</td><td>{{ $tax_number }}</td></tr>
            <tr><td>Vergi Dairesi</td><td>{{ $tax_office }}</td></tr>
            <tr><td>Adres</td><td>{{ $address }}, {{ $city }}</td></tr>
            <tr><td>Telefon</td><td>{{ $phone }}</td></tr>
            <tr><td>E-posta</td><td>{{ $email }}</td></tr>
        </table>
    </div>

    {{-- Contract body text will be replaced when user provides template --}}
    <h2>1. SOZLESMENIN KONUSU</h2>
    <p>Isbu sozlesme, i-Depo B2B Eczane Pazaryeri platformu ile uye arasindaki hak ve yukumlulukleri duzenler.</p>

    <h2>2. TARAFLARIN YUKUMLULUKLERI</h2>
    <p>Uye, platform uzerinde gercek ve dogru bilgiler vermekle yukumludur. Platform, guvenli bir ticaret ortami saglamakla yukumludur.</p>

    <h2>3. KOMISYON VE UCRETLER</h2>
    <p>Platform uzerinden gerceklestirilen satislardan belirlenen oranda komisyon alinir.</p>

    <h2>4. GIZLILIK</h2>
    <p>Taraflar, karsilikli olarak elde ettikleri bilgileri gizli tutmakla yukumludur.</p>

    <h2>5. SOZLESME SURESI</h2>
    <p>Bu sozlesme, imzalandigi tarihte yururluge girer ve taraflardan biri fesih bildiriminde bulunana kadar gecerlidir.</p>

    <h2>6. UYUSMAZLIK COZUMU</h2>
    <p>Bu sozlesmeden dogan uyusmazliklarda Istanbul Mahkemeleri ve Icra Daireleri yetkilidir.</p>

    <div style="margin-top: 60px;">
        <table style="border: none;">
            <tr style="border: none;">
                <td style="border: none; width: 50%; text-align: center; padding-top: 40px;">
                    <div style="border-top: 1px solid #333; width: 200px; margin: 0 auto; padding-top: 8px;">
                        <strong>PLATFORM</strong><br>
                        i-Depo B2B Eczane Pazaryeri
                    </div>
                </td>
                <td style="border: none; width: 50%; text-align: center; padding-top: 40px;">
                    <div style="border-top: 1px solid #333; width: 200px; margin: 0 auto; padding-top: 8px;">
                        <strong>UYE</strong><br>
                        {{ $pharmacy_name }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Bu sozlesme {{ $date }} tarihinde elektronik ortamda olusturulmustur.</p>
    </div>
</body>
</html>
```

**Step 2: Add registration contract download endpoint to LegalController**

Add to `LegalController.php`:

```php
/**
 * Generate and download the registration contract PDF for the authenticated user.
 */
public function downloadRegistrationContract(Request $request)
{
    $user = $request->user();

    $data = [
        'contract_number' => 'UYE-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
        'date' => now()->format('d.m.Y'),
        'pharmacy_name' => $user->pharmacy_name ?? '-',
        'trade_name' => $user->trade_name ?? $user->pharmacy_name ?? '-',
        'authorized_person' => $user->nickname ?? $user->pharmacy_name ?? '-',
        'gln_code' => $user->gln_code ?? '-',
        'tax_number' => $user->tax_number ?? '-',
        'tax_office' => $user->tax_office ?? '-',
        'address' => $user->address ?? '-',
        'city' => $user->city ?? '-',
        'phone' => $user->phone ?? '-',
        'email' => $user->email,
    ];

    $pdf = app('dompdf.wrapper')->loadView('legal.registration-contract', $data);

    return $pdf->download('uyelik-sozlesmesi.pdf');
}
```

**Step 3: Add upload signed contract endpoint**

Add to `LegalController.php`:

```php
/**
 * Upload a signed registration contract.
 */
public function uploadSignedContract(Request $request)
{
    $request->validate([
        'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
    ]);

    $user = $request->user();

    // Check if already has an approved contract
    $existing = $user->sellerDocuments()->where('type', 'sozlesme')->where('status', 'approved')->first();
    if ($existing) {
        return response()->json([
            'success' => false,
            'error' => 'Onaylanmis bir sozlesmeniz zaten mevcut.',
        ], 422);
    }

    // Delete old pending/rejected contract uploads
    $oldDocs = $user->sellerDocuments()->where('type', 'sozlesme')->get();
    foreach ($oldDocs as $doc) {
        \Storage::disk('public')->delete($doc->file_path);
        $doc->delete();
    }

    // Store new file
    $file = $request->file('file');
    $path = $file->store('documents/' . $user->id, 'public');

    $document = \App\Models\SellerDocument::create([
        'user_id' => $user->id,
        'type' => 'sozlesme',
        'file_path' => $path,
        'original_name' => $file->getClientOriginalName(),
        'mime_type' => $file->getMimeType(),
        'file_size' => $file->getSize(),
    ]);

    // Record contract metadata on user
    $user->update([
        'contract_signed_at' => now(),
        'contract_ip' => $request->ip(),
        'contract_user_agent' => $request->userAgent(),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Sozlesme yuklendi. Admin onayindan sonra aktif olacaktir.',
        'document' => [
            'id' => $document->id,
            'type' => $document->type,
            'type_label' => $document->type_label,
            'original_name' => $document->original_name,
            'status' => $document->status,
            'status_label' => $document->status_label,
            'created_at' => $document->created_at->format('d.m.Y H:i'),
        ],
    ]);
}
```

**Step 4: Add routes**

In `backend/routes/api.php`, inside the authenticated group:

```php
// Contract routes
Route::get('/contracts/registration/download', [LegalController::class, 'downloadRegistrationContract']);
Route::post('/contracts/registration/upload', [LegalController::class, 'uploadSignedContract']);
```

**Step 5: Commit**

```bash
git add backend/app/Http/Controllers/Api/LegalController.php backend/resources/views/legal/registration-contract.blade.php backend/routes/api.php
git commit -m "feat: registration contract PDF generation and signed upload endpoints"
```

---

### Task 4: Backend — Sales contract PDF (per-order)

**Files:**
- Modify: `backend/app/Http/Controllers/Api/LegalController.php`
- Replace: `backend/resources/views/legal/b2b-contract.blade.php`
- Modify: `backend/routes/api.php`

**Step 1: Rewrite the b2b-contract Blade template (Farmazon-style)**

Replace `backend/resources/views/legal/b2b-contract.blade.php`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; line-height: 1.5; color: #333; margin: 20px; }
        h1 { text-align: center; font-size: 16px; margin-bottom: 5px; }
        .subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 30px; }
        h2 { font-size: 13px; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 8px 0 15px; }
        .info-table td { padding: 4px 8px; border: 1px solid #ddd; font-size: 11px; }
        .info-table td:first-child { font-weight: bold; width: 30%; background: #f5f5f5; }
        .product-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        .product-table th { background: #2d5e3a; color: #fff; padding: 6px 8px; font-size: 10px; text-align: left; }
        .product-table td { padding: 5px 8px; border: 1px solid #ddd; font-size: 10px; }
        .product-table tr:nth-child(even) { background: #f9f9f9; }
        .total-row td { font-weight: bold; background: #f0f0f0 !important; }
        .terms { font-size: 10px; line-height: 1.4; }
        .terms p { margin: 4px 0; }
        .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
    </style>
</head>
<body>
    <h1>MESAFELI SATIS SOZLESMESI</h1>
    <div class="subtitle">Sozlesme No: {{ $contract_number }} | Tarih: {{ $date }}</div>

    <h2>1. SATICI BILGILERI</h2>
    <table class="info-table">
        <tr><td>Ticari Unvan</td><td>{{ $seller_trade_name }}</td></tr>
        <tr><td>MERSIS No</td><td>{{ $seller_mersis }}</td></tr>
        <tr><td>Vergi No / Dairesi</td><td>{{ $seller_tax_number }} / {{ $seller_tax_office }}</td></tr>
        <tr><td>KEP Adresi</td><td>{{ $seller_kep }}</td></tr>
        <tr><td>Adres</td><td>{{ $seller_address }}</td></tr>
        <tr><td>Telefon</td><td>{{ $seller_phone }}</td></tr>
        <tr><td>E-posta</td><td>{{ $seller_email }}</td></tr>
    </table>

    <h2>2. ALICI BILGILERI</h2>
    <table class="info-table">
        <tr><td>Eczane / Sirket Adi</td><td>{{ $buyer_name }}</td></tr>
        <tr><td>Vergi No / Dairesi</td><td>{{ $buyer_tax_number }} / {{ $buyer_tax_office }}</td></tr>
        <tr><td>Adres</td><td>{{ $buyer_address }}</td></tr>
        <tr><td>Telefon</td><td>{{ $buyer_phone }}</td></tr>
        <tr><td>E-posta</td><td>{{ $buyer_email }}</td></tr>
    </table>

    <h2>3. SIPARIS DETAYI</h2>
    <table class="product-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 45%;">Urun Adi</th>
                <th style="width: 10%; text-align: center;">Adet</th>
                <th style="width: 20%; text-align: right;">Birim Fiyat</th>
                <th style="width: 20%; text-align: right;">Toplam</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item['name'] }}</td>
                <td style="text-align: center;">{{ $item['quantity'] }}</td>
                <td style="text-align: right;">{{ $item['unit_price'] }} TL</td>
                <td style="text-align: right;">{{ $item['total_price'] }} TL</td>
            </tr>
            @endforeach
            @if($shipping_cost > 0)
            <tr>
                <td colspan="4" style="text-align: right; font-weight: bold;">Kargo Ucreti</td>
                <td style="text-align: right;">{{ number_format($shipping_cost, 2, ',', '.') }} TL</td>
            </tr>
            @endif
            <tr class="total-row">
                <td colspan="4" style="text-align: right;">GENEL TOPLAM</td>
                <td style="text-align: right;">{{ $grand_total }} TL</td>
            </tr>
        </tbody>
    </table>

    <h2>4. ODEME BILGILERI</h2>
    <table class="info-table">
        <tr><td>Odeme Yontemi</td><td>{{ $payment_method }}</td></tr>
        <tr><td>Odeme Durumu</td><td>{{ $payment_status }}</td></tr>
    </table>

    <h2>5. TESLIMAT BILGILERI</h2>
    <table class="info-table">
        <tr><td>Teslimat Adresi</td><td>{{ $delivery_address }}</td></tr>
    </table>

    <h2>6. GENEL HUKUMLER</h2>
    <div class="terms">
        <p><strong>6.1.</strong> ALICI, siparis konusu urunun temel niteliklerini, satis fiyatini ve odeme seklini okuyup bilgi sahibi oldugunu kabul eder.</p>
        <p><strong>6.2.</strong> Siparis konusu urun, yasal 30 gunluk sureyi asmamak kaydiyla, her bir urun icin ALICI'nin yerlesim yerinin uzakligina bagli olarak ALICI'ya teslim edilir.</p>
        <p><strong>6.3.</strong> ALICI, urun tesliminden itibaren 14 gun icinde cayma hakkina sahiptir. Cayma hakki kullanildiginda iade masraflari ALICI'ya aittir.</p>
        <p><strong>6.4.</strong> SATICI, siparis konusu urunun saglam, eksiksiz ve siparise uygun olarak teslim edilmesinden sorumludur.</p>
        <p><strong>6.5.</strong> Isbu sozlesme elektronik ortamda taraflarca onaylanarak yururluge girmistir.</p>
        <p><strong>6.6.</strong> Uyusmazliklarin cozumunde Istanbul Mahkemeleri ve Icra Daireleri yetkilidir.</p>
    </div>

    <div class="footer">
        <p>Bu sozlesme {{ $date }} tarihinde i-Depo B2B Eczane Pazaryeri uzerinden elektronik ortamda olusturulmustur.</p>
        <p>Siparis No: {{ $order_number }} | Sozlesme No: {{ $contract_number }}</p>
    </div>
</body>
</html>
```

**Step 2: Rewrite generateB2BContract in LegalController**

Replace `generateB2BContract()` in `LegalController.php`:

```php
/**
 * Generate sales contract PDF for a specific order.
 * Accessible by both buyer and seller of the order.
 */
public function generateSalesContract(Request $request, int $orderId)
{
    $user = $request->user();
    $order = \App\Models\Order::with(['items.product', 'user', 'subOrders'])->findOrFail($orderId);

    // Authorization: buyer or seller of this order
    $isBuyer = $order->user_id === $user->id;
    $isSeller = $order->items->contains('seller_id', $user->id);

    if (!$isBuyer && !$isSeller && !$user->isSuperAdmin()) {
        return response()->json(['error' => 'Bu siparise erisim yetkiniz yok.'], 403);
    }

    // Determine seller (first seller if multi-seller, or specific seller)
    $sellerId = $isSeller ? $user->id : $order->items->first()?->seller_id;
    $seller = \App\Models\User::find($sellerId);
    $buyer = $order->user;

    // Get seller trade info from bank account (where trade fields live)
    $sellerBank = $seller ? \App\Models\SellerBankAccount::where('seller_id', $seller->id)->first() : null;

    // Filter items for this seller
    $sellerItems = $order->items->where('seller_id', $sellerId);

    $items = $sellerItems->map(fn($item) => [
        'name' => $item->product?->name ?? ('Urun #' . $item->product_id),
        'quantity' => $item->quantity,
        'unit_price' => number_format($item->unit_price, 2, ',', '.'),
        'total_price' => number_format($item->total_price, 2, ',', '.'),
    ])->values()->toArray();

    $subOrder = $order->subOrders->firstWhere('seller_id', $sellerId);
    $shippingCost = $subOrder?->shipping_cost ?? 0;
    $itemsTotal = $sellerItems->sum('total_price');
    $grandTotal = $itemsTotal + $shippingCost;

    $data = [
        'contract_number' => 'SS-' . $order->order_number,
        'order_number' => $order->order_number,
        'date' => $order->created_at->format('d.m.Y'),

        // Seller info
        'seller_trade_name' => $seller?->trade_name ?? $seller?->pharmacy_name ?? '-',
        'seller_mersis' => $sellerBank?->mersis_number ?? $seller?->mersis_no ?? '-',
        'seller_tax_number' => $sellerBank?->tax_id ?? $seller?->tax_number ?? '-',
        'seller_tax_office' => $sellerBank?->tax_office ?? $seller?->tax_office ?? '-',
        'seller_kep' => $sellerBank?->kep_address ?? $seller?->kep_address ?? '-',
        'seller_address' => $seller?->address ?? '-',
        'seller_phone' => $sellerBank?->phone ?? $seller?->phone ?? '-',
        'seller_email' => $seller?->email ?? '-',

        // Buyer info
        'buyer_name' => $buyer?->trade_name ?? $buyer?->pharmacy_name ?? '-',
        'buyer_tax_number' => $buyer?->tax_number ?? '-',
        'buyer_tax_office' => $buyer?->tax_office ?? '-',
        'buyer_address' => $order->shipping_address ?? $buyer?->address ?? '-',
        'buyer_phone' => $buyer?->phone ?? '-',
        'buyer_email' => $buyer?->email ?? '-',

        // Products
        'items' => $items,
        'shipping_cost' => $shippingCost,
        'grand_total' => number_format($grandTotal, 2, ',', '.'),

        // Payment
        'payment_method' => $order->payment_method === 'credit_card' ? 'Kredi Karti' : ($order->payment_method === 'bank_transfer' ? 'Havale/EFT' : ($order->payment_method ?? '-')),
        'payment_status' => $order->payment_status === 'paid' ? 'Odendi' : 'Bekliyor',

        // Delivery
        'delivery_address' => $order->shipping_address ?? $buyer?->address ?? '-',
    ];

    // Record contract generation in contracts table
    \App\Models\Contract::create([
        'user_id' => $user->id,
        'type' => 'b2b_sales',
        'version' => '1.0',
        'ip_address' => $request->ip(),
        'approved_at' => now(),
        'metadata' => [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'seller_id' => $sellerId,
            'buyer_id' => $buyer?->id,
            'total' => $grandTotal,
        ],
    ]);

    $pdf = app('dompdf.wrapper')->loadView('legal.b2b-contract', $data);

    return $pdf->download("satis-sozlesmesi-{$order->order_number}.pdf");
}
```

**Step 3: Update route**

In `backend/routes/api.php`, replace the existing b2b contract route:

```php
// Replace:
Route::get('/contract/b2b', [LegalController::class, 'generateB2BContract']);

// With (inside authenticated group):
Route::get('/orders/{orderId}/sales-contract', [LegalController::class, 'generateSalesContract']);
```

Keep the old route for backwards compatibility if needed, or remove if unused.

**Step 4: Commit**

```bash
git add backend/app/Http/Controllers/Api/LegalController.php backend/resources/views/legal/b2b-contract.blade.php backend/routes/api.php
git commit -m "feat: per-order sales contract PDF with Farmazon-style layout"
```

---

### Task 5: Backend — User profile trade info update endpoint

**Files:**
- Modify: `backend/app/Http/Controllers/Api/ProfileController.php` (or wherever profile update lives)
- Modify: `backend/routes/api.php`

**Step 1: Find and check existing profile update endpoint**

Search for `ProfileController` or `updateProfile` in the codebase. The trade fields need to be updatable from the user's profile/settings page.

**Step 2: Add trade fields to profile update validation**

In the profile update method, add these to validation:
```php
'trade_name' => 'nullable|string|max:255',
'kep_address' => 'nullable|string|max:255',
'mersis_no' => 'nullable|string|max:20',
'tax_number' => 'nullable|string|max:20',
'tax_office' => 'nullable|string|max:100',
```

And to the update call:
```php
$user->update($request->only([
    // ... existing fields
    'trade_name', 'kep_address', 'mersis_no', 'tax_number', 'tax_office',
]));
```

**Step 3: Return trade fields in profile/me response**

Ensure the user profile API response includes the new trade fields.

**Step 4: Commit**

```bash
git add backend/app/Http/Controllers/Api/ProfileController.php
git commit -m "feat: add trade info fields to user profile update"
```

---

### Task 6: Frontend — API types and contract endpoints

**Files:**
- Modify: `frontend/src/lib/api.ts`

**Step 1: Add contract-related types**

```typescript
export interface ContractDocument {
  id: number;
  type: string;
  type_label: string;
  original_name: string;
  status: 'pending' | 'approved' | 'rejected';
  status_label: string;
  created_at: string;
}
```

**Step 2: Add contractsApi methods**

```typescript
export const contractsApi = {
  downloadRegistration: () =>
    api.getBlob('/contracts/registration/download'),

  uploadSigned: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.postFormData<{ success: boolean; message: string; document: ContractDocument }>(
      '/contracts/registration/upload',
      formData
    );
  },

  downloadSalesContract: (orderId: number) =>
    api.getBlob(`/orders/${orderId}/sales-contract`),
};
```

**Step 3: Add trade fields to User interface**

If not already present, add to the User/profile interface:
```typescript
trade_name?: string;
kep_address?: string;
mersis_no?: string;
tax_number?: string;
tax_office?: string;
contract_signed_at?: string;
```

**Step 4: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat: add contract API types and methods to frontend"
```

---

### Task 7: Frontend — Registration contract section in documents page

**Files:**
- Modify: `frontend/src/app/documents/page.tsx`

**Step 1: Add contract section to documents page**

Above or below the existing document uploads, add a "Uyelik Sozlesmesi" section:

1. "Sozlesmeyi Indir" button → calls `contractsApi.downloadRegistration()` → downloads PDF
2. "Imzali Sozlesmeyi Yukle" file upload → calls `contractsApi.uploadSigned(file)`
3. Show current contract status if uploaded (pending/approved/rejected)
4. If approved, show green checkmark

Use the existing document upload pattern from this page for consistency.

**Step 2: Handle the blob download**

```typescript
const handleDownloadContract = async () => {
  try {
    const blob = await contractsApi.downloadRegistration();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uyelik-sozlesmesi.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    toast.error('Sozlesme indirilemedi');
  }
};
```

**Step 3: Commit**

```bash
git add frontend/src/app/documents/page.tsx
git commit -m "feat: add registration contract download and upload to documents page"
```

---

### Task 8: Frontend — Sales contract PDF link in order detail

**Files:**
- Modify: `frontend/src/app/market/hesabim/_tabs/OrdersTab.tsx`

**Step 1: Add sales contract download button to buyer order detail**

In the buyer order detail sidebar (around line 1825, after the delivery confirmation section), add:

```tsx
{/* Satis Sozlesmesi */}
{order.status !== 'pending' && order.status !== 'cancelled' && (
  <button
    onClick={async () => {
      try {
        const blob = await contractsApi.downloadSalesContract(order.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `satis-sozlesmesi-${order.order_number}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        toast.error('Sozlesme indirilemedi');
      }
    }}
    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
  >
    <FileText className="w-4 h-4" />
    <span>Satis Sozlesmesi</span>
  </button>
)}
```

**Step 2: Add same button to seller order detail**

In the seller order detail sidebar (around line 1240, near the invoice section), add the same pattern:

```tsx
{/* Satis Sozlesmesi */}
<button
  onClick={async () => {
    try {
      const blob = await contractsApi.downloadSalesContract(sellerOrderDetail.order_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `satis-sozlesmesi-${sellerOrderDetail.order_number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Sozlesme indirilemedi');
    }
  }}
  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
>
  <FileText className="w-4 h-4" />
  <span>Satis Sozlesmesi</span>
</button>
```

**Step 3: Add import for contractsApi**

```typescript
import { contractsApi } from '@/lib/api';
```

Also ensure `FileText` is imported from lucide-react.

**Step 4: Commit**

```bash
git add frontend/src/app/market/hesabim/_tabs/OrdersTab.tsx
git commit -m "feat: add sales contract PDF download to buyer and seller order detail"
```

---

### Task 9: Frontend — Trade info fields in seller profile/settings

**Files:**
- Check: `frontend/src/app/market/hesabim/_tabs/` for settings/profile tab
- Modify: the appropriate settings/profile component

**Step 1: Find the settings page**

Look for `SettingsTab.tsx` or `ProfileTab.tsx` or similar in hesabim tabs.

**Step 2: Add trade info form fields**

Add a "Ticari Bilgiler" section with fields:
- Ticari Unvan (trade_name)
- KEP Adresi (kep_address)
- MERSIS No (mersis_no)
- Vergi No (tax_number)
- Vergi Dairesi (tax_office)

Use the existing form pattern in the file. Save via profile update API.

**Step 3: Commit**

```bash
git add frontend/src/app/market/hesabim/_tabs/SettingsTab.tsx
git commit -m "feat: add trade info fields to seller profile settings"
```

---

### Task 10: Filament — Contract review in admin

**Files:**
- No new files needed — `SellerDocumentResource` already handles document review
- Just verify that `sozlesme` type appears correctly in filters and labels

**Step 1: Verify the sozlesme type works in Filament**

Since we added `sozlesme` to `SellerDocument::TYPE_LABELS`, it should automatically appear in:
- The type filter dropdown
- The type column display
- The approve/reject flow

**Step 2: Optional — Add contract_signed_at to UserResource**

In the Filament UserResource, consider showing `contract_signed_at` and `contract_ip` for audit purposes.

**Step 3: Commit (if changes needed)**

```bash
git add backend/app/Filament/Resources/UserResource.php
git commit -m "feat: show contract audit info in Filament admin"
```

---

### Task 11: Verification and final commit

**Step 1: PHP syntax check**

```bash
cd backend
php -l app/Http/Controllers/Api/LegalController.php
php -l app/Models/User.php
php -l app/Models/SellerDocument.php
```

**Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

**Step 3: Test endpoints with tinker**

```bash
cd backend && php artisan tinker
# Test PDF generation:
# $user = User::first();
# app(PDF::class)->loadView('legal.registration-contract', [...]);
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete contract system - registration + sales contracts"
```

---

## Summary of Changes

| Area | Files | Changes |
|------|-------|---------|
| **Migration** | 1 new | Add trade fields + contract tracking to users |
| **Model** | 2 modified | User fillable/casts, SellerDocument types |
| **Controller** | 1 modified | LegalController — 3 new methods |
| **Views** | 2 (1 new, 1 rewrite) | Registration + sales contract Blade templates |
| **Routes** | 1 modified | 3 new API routes |
| **Frontend API** | 1 modified | contractsApi methods + types |
| **Frontend Pages** | 3 modified | Documents page, OrdersTab, Settings/Profile |
| **Filament** | 0-1 modified | Optional UserResource audit fields |

**Note:** Registration contract template text is placeholder — user will provide actual text to replace sections 1-6 in `registration-contract.blade.php`.
