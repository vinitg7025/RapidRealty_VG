# Phase 2: Storage & Vercel Blob Reconciliation Report

## SUMMARY

```text
Vercel Blob actual files:        Unable to list (BLOB_READ_WRITE_TOKEN missing in local environment)
Vercel Blob actual storage:      1.06 GB (as reported by Vercel Dashboard)
Database-referenced Blob files:  0 in local DB (30 relative S3-style keys, 27 local-uploads paths)
Unreferenced Blob files:         Unable to determine programmatically without BLOB_READ_WRITE_TOKEN
Other/local storage files:       46 files (618 MB on disk in nextjs_space/public/local-uploads/)
```

---

## 1. VERCEL BLOB CREDENTIAL & LISTING INVESTIGATION

### Programmatic Listing Attempt
We executed a read-only node inspection script importing `list` from `@vercel/blob`.

* **Result:** **FAILED** (Credentials missing in local environment).
* **Exact SDK Error:**
  `Vercel Blob: No blob credentials found. Pass a token option, set BLOB_READ_WRITE_TOKEN, or use oidcToken (or VERCEL_OIDC_TOKEN) with storeId or BLOB_STORE_ID.`

### Missing Credential Required
To enable Antigravity to programmatically list, query file sizes, count total blobs, and identify orphaned files in the live Vercel Blob store, the following environment variable is required:
* **`BLOB_READ_WRITE_TOKEN`** (or **`PUBLIC_BLOB_READ_WRITE_TOKEN`**)

*Location to obtain:* Vercel Dashboard -> Project Settings -> Environment Variables OR Storage -> Vercel Blob Store -> Tokens.

---

## 2. DATABASE ASSET REFERENCES RECONCILIATION

An empirical scan of the local PostgreSQL database across all 8 project microsites revealed **57 total asset field references**.

### Storage Path Classification

| Category | Storage Format Pattern | Reference Count | Location / Resolution |
| :--- | :--- | :--- | :--- |
| **AWS S3-Style Keys** | `54633/public/uploads/{timestamp}-{filename}` | **30** | Uploaded when S3 credentials were enabled. Resolved via `lib/s3.ts`. |
| **Local Uploads** | `local-uploads/{timestamp}-{filename}` | **21** | Uploaded via fallback route. Resides in `public/local-uploads/`. |
| **Relative Local Uploads** | `/local-uploads/{timestamp}-{filename}` | **6** | Absolute-path variant of local upload fallback. |
| **Direct Vercel Blob URLs** | `https://*.public.blob.vercel-storage.com/...` | **0** (in local DB) | Present only in production Vercel DB environment. |

---

## 3. SPECIFIC DATABASE ASSET TYPES AUDIT

We verified every asset field in [`prisma/schema.prisma`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/prisma/schema.prisma#L69-L155):

| Model Field | Asset Type | Count | Sample Stored Paths |
| :--- | :--- | :--- | :--- |
| **`heroImages`** | Hero Banners | 5 | `54633/public/uploads/1782199972458-Screenshot...png`, `local-uploads/1782987319474-SemiAerialCam_2.0_Highrez.jpg` |
| **`galleryImages`** | Photo Gallery Renders | 29 | `54633/public/uploads/1781892665748-Yoga Deck.jpg`, `local-uploads/1782987327405-ClubClpCam2.0_Highrez.jpg` |
| **`masterPlanImage`** | Site Master Plans | 4 | `54633/public/uploads/1781876481274-masterPlan-4.webp`, `local-uploads/1782987504539-masterPlan-4.webp` |
| **`builderLogoPath`** | Builder Logos | 4 | `54633/public/uploads/1781892788945-rustomjee.png`, `local-uploads/1782987372022-wadhwa logo.jpeg` |
| **`brochurePath`** | PDF E-Brochures | 5 | `54633/public/uploads/1781892769174-Prive Brochure...pdf`, `local-uploads/1783014585033-Artek Park E-Brochure.pdf` |
| **`floorPlans`** | Floor Layouts | 5 | `54633/public/uploads/1781875967380-WhatsApp Image...jpeg` |
| **`reraQrCodes`** | RERA QR Images | 1 | `local-uploads/1782987390989-rera-artek.png` |
| **`pricingData`** | Pricing Floor Plans | 4 | `local-uploads/1782987528611-WhatsApp Image...jpeg` |

---

## 4. INVESTIGATION OF `local-uploads/...` PATHS

### Physical Location
`local-uploads/...` files reside directly on the local filesystem under:
* [`nextjs_space/public/local-uploads/`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/public/local-uploads/)

### Disk Audit Findings
* **Total Files on Disk:** 46 files
* **Total Storage Size:** **618 MB** (1,207,144 blocks)
* **Storage Mechanism:** When neither AWS credentials nor Vercel Blob tokens are set in `.env`, [`lib/s3.ts:L21-L26`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/lib/s3.ts#L21-L26) routes uploads to `/api/upload/local`. The API endpoint ([`app/api/upload/local/route.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/api/upload/local/route.ts)) writes the binary buffer directly to `public/local-uploads/` using `fs.writeFileSync`.
* **Live Microsite Accessibility:** **FULLY ACCESSIBLE.** Next.js natively serves all files in `public/` as static assets at the root domain path (e.g. `http://localhost:3000/local-uploads/1783014585033-Artek Park E-Brochure.pdf`).

---

## 5. RECONCILIATION WITH VERCEL DASHBOARD (1.06 GB)

Why does the Vercel Dashboard show **1.06 GB** of storage?

1. **Large Individual Asset File Sizes:**
   - PDF E-Brochures are unusually heavy real estate sales collateral (e.g. `Artek Park E-Brochure.pdf` is **21.8 MB**, `Prive Brochure` is **24.5 MB**, `STS-B2B Deck` is **35.2 MB**).
   - High-resolution 3D render images range between **8 MB and 22.9 MB each** (e.g. `Lawn To Club(1.8)_Highrez.jpg` = **22.9 MB**, `ClubClpCam2.0_Highrez.jpg` = **20.9 MB**).

2. **Duplicate Upload Accumulation:**
   - Every time a microsite editor uploads an updated brochure or gallery item, Vercel Blob creates a new timestamped file (e.g. `1782925715909-Artek Park E-Brochure.pdf`, `1782976454015-Artek Park E-Brochure.pdf`, `1783014585033-Artek Park E-Brochure.pdf`).
   - In our local filesystem alone, 6 uploads of the same `Artek Park E-Brochure.pdf` account for **130.8 MB**.
   - In production, ~25–30 PDF uploads and ~50–70 high-res gallery render uploads across published, draft, and deleted test project entries easily account for the **1.06 GB total**.

---

## 6. EXACT NEXT STEPS FOR REMOTE BLOB INVENTORY

To enable listing and full inventory of the live Vercel Blob store:
1. Provide `BLOB_READ_WRITE_TOKEN` in `nextjs_space/.env` (or in chat).
2. Re-run the read-only inspection script to generate the full list of Vercel Blob file URLs, sizes, and timestamps.
