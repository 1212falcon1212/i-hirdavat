# Contract System Design

**Date:** 2026-02-25
**Status:** Approved

---

## Overview

Two contract types for the B2B Pharmacy platform:

1. **Registration Contract** — Signed during seller onboarding
2. **Sales Contract** — Auto-generated per order

---

## Contract 1: Registration Contract

### Flow
1. Seller registers and reaches document upload step
2. System generates a personalized PDF contract (dynamic fields from user profile)
3. Seller downloads, prints, signs (wet signature), scans/photographs, uploads
4. System records: upload timestamp, IP address, user agent
5. Admin reviews uploaded signed contract in Filament panel
6. Admin approves or requests re-upload

### PDF Generation
- **Engine:** DomPDF via Laravel (barryvdh/laravel-dompdf)
- **Template:** Blade view with dynamic placeholders
- **Dynamic fields:** pharmacy_name, trade_name, tax_number, tax_office, address, authorized_person, date
- **Template source:** User will provide the actual contract text (pending)

### Document Storage
- New document type: `sozlesme` added to SellerDocument types
- Uploaded file stored in `seller-documents/` (existing pattern)
- PDF endpoint: `GET /api/contracts/registration/download`

### Audit Trail
- `contract_signed_at` timestamp
- `contract_ip` — IP address at upload time
- `contract_user_agent` — Browser info at upload time

---

## Contract 2: Sales Contract (Per-Order)

### Trigger
- Auto-generated when order is created (or on-demand when PDF is requested)
- Each order produces one sales contract

### Content (Farmazon-style)
Based on reference screenshots, the sales contract includes:

**Header:** Platform info, contract title, date

**Section 1 — Seller Info:**
- Trade name (ticari unvan)
- MERSIS number
- Tax number & office
- KEP address
- Address, phone, email

**Section 2 — Buyer Info:**
- Pharmacy name (ticari unvan)
- Tax number & office
- Address, phone, email

**Section 3 — Product Details (table):**
- Product name
- Quantity
- Unit price
- Total price
- Grand total

**Section 4 — Terms:**
- Standard sales terms (delivery, payment, returns, jurisdiction)

### PDF Generation
- **Engine:** DomPDF via Blade template
- **Endpoint:** `GET /api/orders/{id}/sales-contract`
- **Access:** Buyer and seller of the order (auth check)

### Display
- PDF download link shown in order detail page (both buyer and seller views)

---

## Database Changes

### New columns on `users` table
| Column | Type | Description |
|--------|------|-------------|
| `trade_name` | `varchar(255) nullable` | Ticari unvan |
| `kep_address` | `varchar(255) nullable` | KEP adresi |
| `mersis_no` | `varchar(20) nullable` | MERSIS numarasi |
| `tax_number` | `varchar(20) nullable` | Vergi numarasi |
| `tax_office` | `varchar(100) nullable` | Vergi dairesi |

### New columns on `seller_documents` or `users` table
| Column | Type | Description |
|--------|------|-------------|
| `contract_signed_at` | `timestamp nullable` | Contract upload time |
| `contract_ip` | `varchar(45) nullable` | IP at upload |
| `contract_user_agent` | `text nullable` | Browser info |

### New SellerDocument type
- `sozlesme` — Registration contract upload

---

## Architecture Summary

```
Registration Contract:
  User Profile Data → Blade Template → DomPDF → PDF Download
  User uploads signed copy → SellerDocument (type: sozlesme)
  Admin reviews in Filament → approve/reject

Sales Contract:
  Order + Buyer + Seller Data → Blade Template → DomPDF → PDF
  Shown as download link in order detail page
```

---

## Key Decisions

1. **DomPDF** for PDF generation — already available via Laravel ecosystem, no external service needed
2. **Blade templates** for contract content — easy to maintain, supports dynamic fields
3. **Per-order generation** — sales contract generated on-demand (not stored), fast enough with DomPDF
4. **All trade fields required** for sellers — KEP, MERSIS, tax info mandatory for sales contracts
5. **Registration contract template** — user will provide the actual text content
6. **PDF link in order detail** — not modal, not separate page, just a download link
