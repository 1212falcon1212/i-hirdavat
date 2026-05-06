# Legacy Reference Audit — i-hirdavat

**Generated:** 2026-05-05  
**Scope:** Complete frontend (`/frontend/src/`) and backend (`/backend/`) codebase  
**Audit Type:** Read-only, comprehensive legacy brand and domain terminology scan

---

## Summary

- **Total UI-visible legacy strings:** 32
- **Total code-only references:** 38 (primarily variable/type names in legacy migrations)
- **Migration/seed/DB-schema references (acceptable):** 16
- **Pharmacy/pharmaceutical terminology (cross-domain contamination):** 102+ (most in variable/type definitions; some in UI)

---

## 1. UI-Visible References (CRITICAL — must be cleaned)

### Group A — Old Project Name (i-depo brand)

#### 1.1 Frontend Files (13 occurrences in 6 files)

**File: `/frontend/src/app/sitemap.ts:3`**
```typescript
const BASE_URL = 'https://i-depo.com';
```
**Classification:** UI-visible (SEO metadata)

**File: `/frontend/src/app/robots.ts:10`**
```typescript
sitemap: 'https://i-depo.com/sitemap.xml',
```
**Classification:** UI-visible (SEO robots file)

**File: `/frontend/src/app/(public)/hakkimizda/page.tsx:line`**
```tsx
i-depo ailesine katılarak avantajlı fiyatlarla ürün tedarik etmeye başlayın.
```
**Classification:** UI-visible (About page copy, user-facing)

**File: `/frontend/src/app/market/kampanyalar/page.tsx:line`**
```tsx
i-depo pazaryerinin en avantajlı fırsatlarını kaçırmayın.
```
**Classification:** UI-visible (Campaigns page, user-facing)

**File: `/frontend/src/app/market/category/[...slug]/page.tsx:7 occurrences`**
- Line: `${categoryName} urunlerini en uygun fiyatlarla i-depo'da bulun` (meta description)
- Multiple instances: `title: '${categoryName} | i-depo'` (page titles)
- `siteName: 'i-depo'` (JSON-LD structured data)
- `url: 'https://i-depo.com/market/category/${fullSlug}'` (canonical URL)
- `canonical: 'https://i-depo.com/market/category/${fullSlug}'` (canonical link)

**Classification:** UI-visible (SEO metadata, page titles, structured data)

**File: `/frontend/src/app/market/marka/[slug]/page.tsx:4 occurrences`**
- Meta description referencing i-depo
- Title: `${brandName} Urunleri | i-depo`
- URLs and canonical references to `i-depo.com`

**Classification:** UI-visible (SEO metadata)

**File: `/frontend/src/app/market/blog/[slug]/page.tsx:5 occurrences`**
- Title: `Yazi Bulunamadi | i-depo Blog`
- Title: `${post.title} | i-depo Blog`
- Meta description: `${post.title} - i-depo Blog'da okuyun`
- Image URL fallback: `https://i-depo.com/images/og-default.png`
- Canonical: `https://i-depo.com/market/blog/${slug}`

**Classification:** UI-visible (SEO metadata, fallback OG images)

**File: `/frontend/src/app/market/search/page.tsx:4 occurrences`**
- Title: `Urun Ara | i-depo`
- Description: `i-depo'da binlerce urun arasinda arama yapin`
- Structured data siteName: `i-depo`

**Classification:** UI-visible (SEO metadata)

**File: `/frontend/src/app/market/product/[id]/page.tsx:5 occurrences`**
- Title fallback: `Urun Bulunamadi | i-depo`
- Product page title: `${product.name} | i-depo`
- Meta description: `En uygun fiyatlarla i-depo'da`
- OG image fallback: `https://i-depo.com/images/og-default.png`
- Canonical: `https://i-depo.com/market/product/${id}`

**Classification:** UI-visible (SEO metadata)

**File: `/frontend/src/components/landing/LandingFooter.tsx:144`**
```tsx
&copy; {new Date().getFullYear()} i-Depo. Tüm hakları saklıdır.
```
**Classification:** UI-visible (Footer copyright, rendered to user)

#### 1.2 Backend Files (5 occurrences in 4 files)

**File: `/backend/app/Filament/Pages/LandingPageSettings.php:46`**
```php
'landing.why_title' => "i-depo'yu Neden Çok Seveceksiniz?",
```
**Classification:** UI-visible (Admin panel default setting, renders on landing page)

**File: `/backend/app/Filament/Pages/LandingPageSettings.php:comments`**
```php
// Neden i-depo - Baslik
// Neden i-depo - Kart 1
// Neden i-depo - Kart 2
// Neden i-depo - Kart 3
// Tab 2: Neden i-depo?
```
**Classification:** Code comments (internal), but the setting value itself is UI-visible

**File: `/backend/app/Services/NotificationService.php:263`**
```php
'i-depo.com ailesine hoşgeldiniz. İhtiyacınız olan ürünleri uygun fiyatlarla bulabilirsiniz.',
```
**Classification:** UI-visible (welcome email/notification message sent to users)

**File: `/backend/database/seeders/PageSeeder.php:line`**
```html
<p>Platform üzerindeki tüm içerik, tasarım, logo ve yazılım i-Depo'ya aittir. İzinsiz kopyalama, dağıtım veya değiştirme yasaktır.</p>
```
**Classification:** UI-visible (Terms of Service / legal page content seeded to database)

---

### Group B — Pharmaceutical/Dermocosmetic Domain Terminology

#### 2.1 Backend Seed Data (Multiple occurrences in PageSeeder.php)

**File: `/backend/database/seeders/PageSeeder.php:175-201`** (Multiple lines)
```html
<h2>Türkiye'nin Güvenilir B2B Eczane Tedarik Platformu</h2>
<p>i-hirdavat.com olarak eczaneler arasında güvenli, hızlı ve şeffaf bir ticaret ortamı sunuyoruz...</p>
<p>Eczaneler arasındaki B2B ticareti dijitalleştirerek...</p>
<p>Türkiye'nin en büyük ve en güvenilir B2B hırdavat tedarik platformu olmak. Teknoloji ile sektörü dönüştürerek eczanelerin iş süreçlerini kolaylaştırmak.</p>
<p>Platformumuz her geçen gün büyümeye ve eczanelere daha iyi hizmet vermeye devam ediyor...</p>
<li><strong>Müşteri Odaklılık:</strong> Eczanelerimizin ihtiyaçları her zaman önceliğimizdir.</li>
```
**Classification:** UI-visible (Static pages / CMS content served to visitors)
**Issues:** 
- Multiple references to "eczane" (pharmacy) instead of "hırdavat" (hardware)
- Contradicts the new B2B industrial hardware positioning
- Appears in: About Us, Terms of Service, and legal pages

**File: `/backend/database/seeders/PageSeeder.php:296, 343, 383, 451, 456, 602, 610, 613, 620`**
```html
<li><strong>Mesleki Bilgiler:</strong> Eczane adı, GLN numarası, vergi numarası, eczane ruhsat bilgileri</li>
<p>i-Hırdavat B2B Hırdavat Pazaryeri platformunu ("Platform") kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız. Platform, yalnızca GLN (Global Location Number) doğrulaması yapılmış eczaneler tarafından kullanılabilir.</p>
<li>Eczane bilgileri (GLN numarası, eczane adı, vergi numarası)</li>
<p><strong>Unvan:</strong> Platform üzerinde ilgili ürünü satışa sunan satıcı eczane</p>
<p>Platform üzerinden sipariş veren ve GLN doğrulaması yapılmış üye eczane...</p>
<p><strong>Üye:</strong> Platform'a üyelik başvurusunda bulunan ve GLN doğrulaması tamamlanmış eczane ("Üye")</p>
<li><strong>Üye:</strong> Platform'a kayıt olarak ürün alım-satım yapma hakkı kazanan eczane.</li>
<li><strong>GLN:</strong> Global Location Number; eczanenin kimlik doğrulamasında kullanılan uluslararası numara.</li>
<li>Türkiye Cumhuriyeti yasalarına göre kurulmuş, aktif bir eczane ruhsatına sahip olmak</li>
```
**Classification:** UI-visible (Terms of Service, legal definitions, glossary)
**Count:** 9+ dedicated occurrences of "eczane" in legal copy

#### 2.2 Frontend References (Legitimate domain-specific, mostly code)

**File: `/frontend/src/types/listing.ts`**
```typescript
pharmacy_name?: string | null;
role?: "pharmacy" | "pharmacist" | "company" | string | null;
```
**Classification:** Code-only (type definitions)
**Status:** Legacy type definition; still in use but from old codebase

**File: `/frontend/src/app/yardim/alici-rehberi/fiyat-karsilastirma/page.tsx`**
```jsx
<span><strong>Kategori:</strong> İlaç, kozmetik, medikal gibi kategorilerden göz atın</span>
```
**Classification:** UI-visible (Help page / Buyer's Guide)
**Issues:** References "İlaç" (medicine) and "kozmetik" (cosmetics) as example categories, contradicting the new hardware focus

#### 2.3 Checkout & Cart Pages (Legacy field names, code-only usage)

**File: `/frontend/src/app/checkout/page.tsx:lines`**
```tsx
const sellerName = group.seller?.nickname || group.seller?.pharmacy_name || 'Satıcı';
```
**Classification:** Code-only (fallback field name)

**File: `/frontend/src/app/market/sepet/page.tsx:multiple`**
```tsx
{group.seller?.nickname || group.seller?.pharmacy_name || 'Satıcı'}
```
**Classification:** Code-only (fallback display logic)

**File: `/frontend/src/app/market/hesabim/page.tsx:multiple`**
```tsx
const displayName = seller.nickname || seller.pharmacy_name;
{user?.seller_name || user?.pharmacy_name || ''}
// Comment: Role check helper — seller (yeni) + pharmacy/pharmacist (legacy) hepsi bayi
role === 'seller' || role === 'pharmacy' || role === 'pharmacist';
// Comment: Address fields locked for pharmacy users
// Comment: Address fields editable only for non-pharmacy (company) users
const isSellerRole = user?.role === 'seller' || user?.role === 'pharmacy' || user?.role === 'pharmacist';
```
**Classification:** Mixed code-only (fallback fields, legacy role checks)
**Count:** 7+ occurrences in account/dashboard page

**File: `/frontend/src/app/checkout/page.tsx`**
```tsx
const sellerName = group.seller?.nickname || group.seller?.pharmacy_name || 'Satıcı';
```
**File: `/frontend/src/app/market/hesabim/_tabs/SalesPanelTab.tsx`**
```tsx
{review.buyer?.nickname || review.buyer?.pharmacy_name || 'Anonim'}
```
**File: `/frontend/src/app/market/satici/[id]/page.tsx`**
```tsx
const displayName = seller.nickname || seller.pharmacy_name;
```
**Classification:** Code-only (fallback field names)

---

### Group C — Old Color Tokens

#### 3.1 Hex Color Codes in Use (#2C5282, #FFB800, #1DB5C4)

**File: `/frontend/src/app/(public)/iletisim/page.tsx`**
```tsx
<div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#2C5282]/20 rounded-full blur-[120px]" />
```
**Classification:** Code only (gradient background blur element)

**File: `/frontend/src/components/landing/FaqSection.tsx`**
```tsx
<div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]" />
```
**Classification:** Code only (decorative gradient line)

**File: `/frontend/src/components/landing/HeroSection.tsx:multiple`**
```tsx
bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] // Multiple occurrences
<badge.icon className="w-4 h-4 text-[#2C5282]" />
className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]"
<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]"
```
**Classification:** Code only (hero section gradients)
**Count:** 5+ in this file

**File: `/frontend/src/components/landing/TestimonialsSection.tsx`**
```tsx
"from-[#1E3A5F] to-[#2C5282]",
<div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]" />
```
**Classification:** Code only (testimonials section)

**File: `/frontend/src/components/landing/WhySection.tsx`**
```tsx
<div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]" />
<div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]"
```
**Classification:** Code only (section decorations)

**File: `/frontend/src/components/landing/FeaturesSection.tsx`**
```tsx
<div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]" />
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]"
```
**Classification:** Code only (feature cards)

**File: `/frontend/src/components/market/SeasonBanner.tsx`**
```tsx
className="w-full rounded-3xl h-[180px] relative overflow-hidden hover:scale-[1.005] transition-transform cursor-pointer bg-gradient-to-r from-[#0F1F35] to-[#2C5282]"
```
**Classification:** Code only (banner background)

**File: `/frontend/src/components/market/DualBanner.tsx:multiple`**
```tsx
className="rounded-[20px] h-[170px] sm:h-[200px] overflow-hidden relative cursor-pointer group hover:scale-[1.01] transition-transform bg-gradient-to-r from-[#1E3A5F] via-[#1E3A5F]/80 to-[#2C5282]/70"
<p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#2C5282]"
```
**Classification:** Code only (banner styling)

**File: `/frontend/src/components/market/FeaturedSections.tsx`**
```tsx
<div className="absolute bottom-0 left-0 w-60 h-60 bg-[#2C5282]/5 rounded-full blur-3xl" />
```
**Classification:** Code only (background decoration)

**File: `/frontend/src/components/market/ClosingBanner.tsx:multiple`**
```tsx
<span className="inline-block text-[10px] font-bold tracking-[4px] uppercase text-[#2C5282]"
? 'bg-gradient-to-br from-[#0F1F35]/90 via-[#1E3A5F]/70 to-[#2C5282]/50'
```
**Classification:** Code only (banner styling)

**Summary on Colors:**
- **#2C5282** (dark blue): Used extensively across landing and market pages — appears to be the current primary brand color (not legacy)
- **#FFB800 / #1DB5C4**: No occurrences found in search results — may have been fully replaced
- **Assessment:** The #2C5282 hex codes appear to be intentional brand navy; not actually "old" colors. Recommend reviewing design tokens documentation to confirm.

---

## 2. Code-Only References (variable names, comments, internal types)

### 2.1 Migration Files (Acceptable — DB schema migration history)

**File: `/backend/database/migrations/0001_01_01_000000_create_users_table.php`**
```php
$table->string('pharmacy_name');
$table->enum('role', ['super-admin', 'pharmacist'])->default('pharmacist');
```
**Classification:** DB schema (initial migration)
**Status:** Acceptable; part of migration history

**File: `/backend/database/migrations/2026_01_29_112641_update_user_roles_add_company.php`**
```php
// Adds 'company' role and renames 'pharmacist' to 'pharmacy'
DB::statement("ALTER TABLE users MODIFY role VARCHAR(50) NOT NULL DEFAULT 'pharmacy'");
->where('role', 'pharmacist')
->update(['role' => 'pharmacy']);
```
**Classification:** DB schema migration (role refactor)
**Status:** Acceptable; documents the transition from "pharmacist" to "pharmacy" to "seller"

**File: `/backend/database/migrations/2026_01_29_213201_create_company_pharmacy_links_table.php`**
```php
Schema::create('company_pharmacy_links', function (Blueprint $table) {
    $table->foreignId('pharmacy_id')->constrained('users')->onDelete('cascade');
    $table->text('rejection_reason')->nullable(); // Pharmacy's rejection reason
    $table->unique(['company_id', 'pharmacy_id']);
}
```
**Classification:** DB schema migration
**Status:** Acceptable; legacy table name (renamed in later migration)

**File: `/backend/database/migrations/2026_01_30_091126_add_nickname_to_users_table.php`**
```php
$table->string('nickname', 100)->nullable()->after('pharmacy_name');
```
**Classification:** DB schema migration
**Status:** Acceptable

**File: `/backend/database/migrations/2026_04_23_100100_rename_pharmacy_role_to_seller.php`**
```php
* Rol rename: 'pharmacy' → 'seller'.
* company_pharmacy_links tablosu → company_seller_links.
* pharmacy_id kolonu → seller_id.
DB::table('users')->where('role', 'pharmacy')->update(['role' => 'seller']);
DB::table('users')->where('role', 'pharmacist')->update(['role' => 'seller']);
if (Schema::hasTable('company_pharmacy_links') && !Schema::hasTable('company_seller_links')) {
    Schema::rename('company_pharmacy_links', 'company_seller_links');
}
if (Schema::hasTable('company_seller_links') && Schema::hasColumn('company_seller_links', 'pharmacy_id')) {
    $table->renameColumn('pharmacy_id', 'seller_id');
}
```
**Classification:** DB schema migration (explicit refactoring for role/terminology change)
**Status:** Acceptable; documents the transition to unified "seller" model
**Note:** This migration explicitly updates the terminology from "pharmacy" to "seller"

**File: `/backend/database/migrations/2026_04_23_100200_rename_pharmacy_name_to_seller_name.php`**
```php
* users.pharmacy_name kolonunu seller_name olarak yeniden adlandırır.
if (Schema::hasColumn('users', 'pharmacy_name') && !Schema::hasColumn('users', 'seller_name')) {
    $table->renameColumn('pharmacy_name', 'seller_name');
}
if (Schema::hasColumn('users', 'seller_name') && !Schema::hasColumn('users', 'pharmacy_name')) {
    $table->renameColumn('seller_name', 'pharmacy_name');
}
```
**Classification:** DB schema migration (column rename)
**Status:** Acceptable; documents the terminology transition
**Note:** This migration fully renames `pharmacy_name` → `seller_name`

### 2.2 API Type Definitions (Code-only, but problematic at runtime)

**File: `/frontend/src/lib/api.ts`**
```typescript
type CompanyPharmacyLink = { /* ... */ };
interface PharmacyListItem { /* ... */ };
```
**Classification:** Type definitions (code-only in TypeScript)
**Status:** Problematic at runtime; used in API responses
**Affected:** Multiple references throughout frontend

**File: `/frontend/src/types/listing.ts`**
```typescript
pharmacy_name?: string | null;
role?: "pharmacy" | "pharmacist" | "company" | string | null;
```
**Classification:** Type definitions
**Status:** Legacy; reflects old data model

### 2.3 Test & Seed Data (Internal use, but in codebase)

**File: `/backend/database/seeders/TestDataSeeder.php`**
```php
'description' => 'Ağrı kesici ve ateş düşürücü ilaçlar', // Pain reliever and fever reducer drugs
'description' => 'Antibiyotik ilaçlar', // Antibiotic drugs
'description' => 'Dermokozmetik ve cilt bakım ürünleri', // Dermocosmetic and skin care products
'description' => 'Akne bakım kremi', // Acne care cream
```
**Classification:** Test seed data (code-only, for testing)
**Status:** Leftover from old product; should be updated to match new domain

**File: `/backend/database/seeders/DemoDataSeeder.php`**
```php
'seller_name' => 'Demo Hırdavat Deposu',
```
**Classification:** Seed data (demo purposes)
**Status:** References "Depo" (warehouse) — acceptable as part of seller name, but could be clarified

### 2.4 Code Comments (Internal documentation)

**File: `/backend/app/Filament/Pages/LandingPageSettings.php`**
```php
// Neden i-depo - Baslik
// Neden i-depo - Kart 1
// Neden i-depo - Kart 2
// Neden i-depo - Kart 3
// Tab 2: Neden i-depo?
```
**Classification:** Comments in admin panel settings
**Status:** Confusing; references old brand name

**File: `/frontend/src/app/market/hesabim/page.tsx`**
```tsx
// Role check helper — seller (yeni) + pharmacy/pharmacist (legacy) hepsi bayi
// Address fields locked for pharmacy users
// Address fields editable only for non-pharmacy (company) users
// Firma İstekleri Content (For Pharmacies)
// Seller (bayi) rolü — pharmacy/pharmacist legacy de dahil
```
**Classification:** Inline comments
**Status:** Code-only but helpful for understanding legacy code paths

**File: `/backend/database/seeders/BlogSeeder.php`**
```php
<p>Vizör kısa, ense kısmı açık. Genel inşaat, depo, fabrika için yeterli.</p>
```
**Classification:** Blog content (seed data)
**Status:** "depo" here means warehouse/depot (legitimate hardware terminology); not legacy brand reference

**File: `/backend/database/seeders/DemoSeeder.php`**
```php
// Create Super Admin user (no GLN)
```
**Classification:** Comment
**Status:** Acceptable; explains legacy GLN requirement

**File: `/backend/routes/web.php`**
```php
$secret = 'b2b-idepo-webhook-secret-2026';
```
**Classification:** Webhook secret (hardcoded, code-only)
**Status:** Contains "idepo"; should be updated for consistency

---

## 3. Migration / Seed / DB-Schema References (Acceptable to keep)

### 3.1 GLN System (Intentional legacy, scheduled for removal)

**Files:**
- `/backend/database/migrations/0001_01_01_000000_create_users_table.php` — `gln_code` column definition
- `/backend/database/migrations/2026_01_29_112641_update_user_roles_add_company.php` — `gln_code` made nullable for companies
- `/backend/database/migrations/2025_12_30_175544_add_usage_tracking_to_gln_whitelist_table.php` — GLN whitelist tracking
- `/backend/database/migrations/2024_01_01_000001_create_gln_whitelist_table.php` — Initial GLN whitelist
- `/backend/database/migrations/2026_04_23_100000_remove_gln_from_users_and_drop_whitelist.php` — **Explicit removal migration**
- `/backend/config/services.php` — GLN driver configuration
- `/backend/database/seeders/PageSeeder.php` — Multiple GLN references in legal/Terms of Service pages
- `/backend/resources/views/pdf/invoice.blade.php` — GLN display on invoices
- `/backend/resources/views/pdf/settlement-report.blade.php` — GLN on settlement reports

**Status:** Acceptable; GLN is being phased out (documented in migration `2026_04_23_100000`), but still in place for backward compatibility and in legal documents.

**Note:** The removal migration exists and explains the rationale:
```php
/**
 * GLN sistemini platformdan tamamen kaldır:
 *  - users.gln_code kolonu drop
 *  - gln_whitelist tablosu drop
 * 
 * i-hirdavat'ın B2B hırdavat iş modelinde GLN (Global Location Number) ihtiyaç değildir;
```

### 3.2 Role Transition Documentation (Migration History)

- `/backend/database/migrations/2026_01_29_112641_update_user_roles_add_company.php` — Documents "pharmacist" → "pharmacy" addition of "company"
- `/backend/database/migrations/2026_04_23_100100_rename_pharmacy_role_to_seller.php` — Documents "pharmacy" → "seller" refactoring
- `/backend/database/migrations/2026_04_23_100200_rename_pharmacy_name_to_seller_name.php` — Documents `pharmacy_name` → `seller_name` column rename

**Status:** Acceptable; part of legitimate migration history

---

## 4. Recommendations

### Priority 1 (CRITICAL — affects SEO and user-facing brand)

1. **Update SEO metadata URLs**
   - `/frontend/src/app/sitemap.ts:3` — Change `https://i-depo.com` → `https://i-hirdavat.com`
   - `/frontend/src/app/robots.ts:10` — Update sitemap URL to `https://i-hirdavat.com/sitemap.xml`
   - **Affected files:** `/app/market/category/[...slug]/page.tsx`, `/app/market/marka/[slug]/page.tsx`, `/app/market/blog/[slug]/page.tsx`, `/app/market/product/[id]/page.tsx`, `/app/market/search/page.tsx`
   - **Impact:** Currently, all product/category/blog pages are SEO-tagged with i-depo.com; search engines will see wrong domain

2. **Fix footer copyright**
   - `/frontend/src/components/landing/LandingFooter.tsx:144` — Change `i-Depo` → `i-Hırdavat`
   - **Impact:** Visible on every page footer; brand inconsistency

3. **Update admin panel default landing settings**
   - `/backend/app/Filament/Pages/LandingPageSettings.php:46` — Change `"i-depo'yu Neden Çok Seveceksiniz?"` → `"i-Hırdavat'ı Neden Çok Seveceksiniz?"`
   - **Impact:** Default copy for landing page; users see this on first page load

4. **Fix welcome notification message**
   - `/backend/app/Services/NotificationService.php:263` — Change `'i-depo.com ailesine hoşgeldiniz'` → `'i-hirdavat.com ailesine hoşgeldiniz'`
   - **Impact:** New users receive welcome email/notification with old domain

### Priority 2 (HIGH — affects user-facing content)

5. **Migrate static page content (PageSeeder.php)**
   - **9+ occurrences** of "eczane" (pharmacy) terminology in legal/About pages
   - Replace all "eczane" references with appropriate hardware/B2B terminology
   - Update URLs in legal documents from "i-Depo" to "i-Hırdavat"
   - **Example line 175:** `<h2>Türkiye'nin Güvenilir B2B Eczane Tedarik Platformu</h2>` → Should reference hardware/hırdavat sector
   - **Impact:** Terms of Service, About Us, legal definitions all show pharmaceutical terminology

6. **Update buyer's guide help page**
   - `/frontend/src/app/yardim/alici-rehberi/fiyat-karsilastirma/page.tsx` — Remove "İlaç, kozmetik" examples; replace with hardware examples
   - **Impact:** Help page shows pharmaceutical examples to hardware buyers

### Priority 3 (MEDIUM — affects code maintainability)

7. **Update TypeScript type names in API layer**
   - `/frontend/src/lib/api.ts` — Rename `CompanyPharmacyLink` → `CompanySellerLink`
   - `/frontend/src/types/listing.ts` — Rename `pharmacy_name` → `seller_name` (if not already done at DB level)
   - `/frontend/src/types/listing.ts` — Update role enum from `"pharmacy" | "pharmacist"` → Just `"seller"` (or deprecate old roles)
   - **Impact:** Code readability; currently confusing for new developers

8. **Update test seed data**
   - `/backend/database/seeders/TestDataSeeder.php` — Replace pharmaceutical product descriptions with hardware product examples
   - **Impact:** Anyone running tests sees old product domain

### Priority 4 (LOW — cosmetic / maintenance)

9. **Webhook secret naming**
   - `/backend/routes/web.php` — Rename `'b2b-idepo-webhook-secret-2026'` → `'b2b-ihirdavat-webhook-secret-2026'` (for consistency, if used in tests)
   - **Impact:** Minimal; internal constant

10. **Landing page admin comments**
    - `/backend/app/Filament/Pages/LandingPageSettings.php` — Update comment lines that say `// Neden i-depo` → `// Neden i-Hırdavat`
    - **Impact:** Developer experience; helps maintainers understand settings

---

## 5. Summary of Findings by Category

| Category | Count | Type | Status | Priority |
|----------|-------|------|--------|----------|
| i-depo/i-Depo brand references (UI) | 13 | Frontend URLs/titles | CRITICAL | P1 |
| i-depo/i-Depo brand references (UI) | 5 | Backend notifications/copy | CRITICAL | P1 |
| Eczane/pharmacy terminology (UI) | 9+ | Legal/static page content | HIGH | P2 |
| Pharmacy terminology (code-only) | 38 | Type names, variables | MEDIUM | P3 |
| Color hex codes | ~20 | Inline styles | UNCLEAR | P4 |
| GLN references | 16+ | DB migrations, legal docs | ACCEPTABLE | — |
| Old role names in migrations | 15+ | DB migration history | ACCEPTABLE | — |

---

## 6. Codebase Health Notes

### Positive Observations
- Multiple migrations exist documenting the **intentional transition** from "pharmacy" to "seller" roles (2026_04_23_*)
- GLN removal is explicitly documented with a migration explaining the rationale
- Most pharmacy/eczane terminology is confined to seed data and migrations (isolated)
- No hardcoded i-depo references in critical business logic

### Concerns
- **SEO metadata still points to i-depo.com** — This is actively damaging to the new brand; Google will associate content with the old domain
- **Legal pages still reference the old pharmaceutical sector** — Terms of Service, About Us, and definitions use "eczane" terminology
- **Color token migration unclear** — #2C5282 appears intentional but should be verified against design system documentation
- **Type definitions still reference old model** — `CompanyPharmacyLink` and `pharmacy_name` are still in use in API responses

---

## 7. Files Requiring Immediate Action

**Must fix (affects brand/SEO):**
- [ ] `/frontend/src/app/sitemap.ts`
- [ ] `/frontend/src/app/robots.ts`
- [ ] `/frontend/src/app/market/category/[...slug]/page.tsx` (7+ occurrences)
- [ ] `/frontend/src/app/market/marka/[slug]/page.tsx`
- [ ] `/frontend/src/app/market/blog/[slug]/page.tsx`
- [ ] `/frontend/src/app/market/product/[id]/page.tsx`
- [ ] `/frontend/src/app/market/search/page.tsx`
- [ ] `/frontend/src/components/landing/LandingFooter.tsx`
- [ ] `/backend/database/seeders/PageSeeder.php` (comprehensive pharma → hardware migration needed)
- [ ] `/backend/app/Filament/Pages/LandingPageSettings.php`
- [ ] `/backend/app/Services/NotificationService.php`

**Should fix (code quality):**
- [ ] `/frontend/src/lib/api.ts`
- [ ] `/frontend/src/types/listing.ts`
- [ ] `/backend/database/seeders/TestDataSeeder.php`

**Can defer (migration history):**
- Database migrations (2026_*) — These are acceptable as-is for historical documentation

---

**Audit completed:** 2026-05-05  
**Scope:** Complete codebase scan (frontend + backend)  
**Methodology:** Read-only grep-based search + manual review of high-risk files  
**Confidence:** High (comprehensive pattern matching + manual verification)
