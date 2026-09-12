# Phase 2: Cloudflare R2 Asset Storage Implementation Report

**Platform:** 11 Estates Microsite Engine  
**Objective:** Migrate asset upload storage provider from Vercel Blob to Cloudflare R2 (`11estates-assets`) using the Cloudflare R2 Public URL (`R2_PUBLIC_URL`) without changing DNS, copying legacy files, breaking database records, or altering Phase 1 SSR/ISR performance.

---

## 1. WHAT CHANGED

1. **Storage Provider Configuration ([`lib/aws-config.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/lib/aws-config.ts)):**
   - Configured `S3Client` to initialize with Cloudflare R2 environment variables (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_REGION`).
   - Defaulted `bucketName` to `11estates-assets` (overrideable via `R2_BUCKET_NAME`).

2. **Presigned Upload & Path Formatting ([`lib/s3.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/lib/s3.ts)):**
   - Updated `generatePresignedUploadUrl` to generate clean, collision-free R2 key hierarchies:  
     `projects/{builderSlug}/{projectSlug}/{assetType}/{timestamp}-{safeFilename}`
   - Configured direct S3/R2 presigned `PUT` upload URLs using `@aws-sdk/s3-request-presigner`.
   - Updated `getFileUrl` to dynamically prepend `R2_PUBLIC_URL` for R2 asset resolution while maintaining 100% backward compatibility for legacy Vercel Blob URLs and local disk storage fallback paths.

3. **Client Upload Pipeline ([`lib/upload-helper.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/lib/upload-helper.ts)):**
   - Refactored `uploadFileToS3` to request presigned R2 upload configurations from `/api/upload/presigned`.
   - Enabled direct client-to-R2 `PUT` uploads (bypassing Vercel server payload limits, supporting 50 MB PDFs and images).
   - Preserved metadata creation in PostgreSQL (`FileMetadata` model).
   - Retained Vercel Blob and localhost disk fallbacks.

4. **Next.js Image Whitelist ([`next.config.js`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/next.config.js)):**
   - Added `**.r2.dev` and `**.r2.cloudflarestorage.com` to `images.remotePatterns`.

---

## 2. WHAT DID NOT CHANGE

* **Zero DNS Changes:** Name.com, nameservers, Vercel domains, and DNS records remain completely untouched.
* **Zero File Deletions:** No Vercel Blob files were copied, modified, or deleted.
* **Zero Database Data Loss:** PostgreSQL database records, schema, project info, slugs, pricing, FAQs, and configurations remain untouched.
* **Zero Downtime / URL Alteration:** Live microsite URLs (`11estates.in/<builder>/<project>`), creator app URL (`app.11estates.in`), domain routing, visual UI, and layouts are completely unchanged.
* **SSR / ISR Architecture:** Phase 1 server-side rendering, React `cache()` deduplication, and ISR revalidation (`revalidatePath`) remain active.
* **Vercel Blob Integration Code:** Retained in full for backward compatibility during the transition period.

---

## 3. R2 ARCHITECTURE & DYNAMIC URL RESOLUTION

```text
CMS Client (app.11estates.in)
   │
   ├─ 1. POST /api/upload/presigned (fileName, contentType, builderSlug, projectSlug, assetType)
   │     │
   │     ▼
   │  Returns: { uploadUrl: presigned R2 PUT URL, cloud_storage_path, publicUrl }
   │
   ├─ 2. Direct PUT -> Cloudflare R2 (https://<account_id>.r2.cloudflarestorage.com)
   │
   └─ 3. Save Project -> PostgreSQL (stores object key/path in Microsite model)
         │
         ▼
   Public Visitor / Googlebot (11estates.in/<builder>/<project>)
         │
         └─ Reads static HTML -> getFileUrl() prepends R2_PUBLIC_URL -> Images/PDFs served directly
```

---

## 4. ENVIRONMENT VARIABLES REQUIRED

### On Vercel (Production & Preview) & Local `.env`:

```env
# Cloudflare R2 Production Storage Credentials
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<your_r2_access_key_id>
R2_SECRET_ACCESS_KEY=<your_r2_secret_access_key>
R2_BUCKET_NAME=11estates-assets
R2_PUBLIC_URL=https://pub-f601bae63a234850b10d7626498e8414.r2.dev
```

*Note: Never commit actual secret keys to source control.*

---

## 5. FUTURE CUSTOM DOMAIN SWITCH PROCEDURE

To switch from the Cloudflare R2 Public URL (`https://pub-f601bae63a234850b10d7626498e8414.r2.dev`) to a custom domain (`https://assets.11estates.in`) in the future:

1. Connect `assets.11estates.in` in Cloudflare R2 Bucket Settings.
2. In Vercel Project Settings -> Environment Variables, change:
   ```env
   R2_PUBLIC_URL=https://assets.11estates.in
   ```
3. Trigger a redeploy.
4. **Result:** ALL R2 assets will immediately serve from `https://assets.11estates.in` **without any code rewrites or database migrations**.

---

## 6. TESTING VERIFICATION COMPLETED

- [x] **Code compilation:** Next.js production build (`npm run build`) completed with 0 errors.
- [x] **No Hardcoded Domain Strings:** Codebase verified via `grep_search` to contain 0 hardcoded `assets.11estates.in` or `pub-*.r2.dev` strings.
- [x] **Direct Presigned R2 URL Generation:** Verified R2 key creation and presigning.
- [x] **PDF & Image Handling:** Supported direct client-to-R2 upload up to 50 MB limit.
- [x] **Backward Compatibility:** Verified legacy Vercel Blob URLs and `local-uploads/` paths continue to resolve cleanly.
- [x] **Phase 1 SSR/ISR Verification:** Confirmed static page generation (16/16 pages) and initial HTML integrity.

---

## 7. MANUAL MIGRATION CHECKLIST FOR THE 4 LIVE MICROSITES

To migrate the 4 live microsites to R2:

1. **Narang Realty (`narang-realty`)**
   - [ ] Open project in CMS (`/dashboard/microsites`).
   - [ ] Reupload Builder Logo, Hero Banner, Master Plan, Brochure PDF, and Gallery images.
   - [ ] Click **Save Project**.
   - [ ] Visit public microsite `11estates.in/narang-realty` and inspect asset URLs (verify `https://pub-f601bae63a234850b10d7626498e8414.r2.dev` domain).

2. **Rustomjee Prive (`rustomjee-prive`)**
   - [ ] Open project in CMS.
   - [ ] Reupload assets & click **Save Project**.

3. **Artek Park (`artek-park`)**
   - [ ] Open project in CMS.
   - [ ] Reupload assets & click **Save Project**.

4. **Artek Park 2 (`wadhwa-group/artek-park-2`)**
   - [ ] Open project in CMS.
   - [ ] Reupload assets & click **Save Project**.
