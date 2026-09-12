# Phase 2: Cloudflare R2 Rollback Procedure

**Platform:** 11 Estates Microsite Engine  
**Objective:** Provide a fast, safe, and zero-downtime rollback mechanism if Cloudflare R2 experiences a production issue.

---

## EMERGENCY ROLLBACK STEPS

If Cloudflare R2 needs to be temporarily bypassed in production:

### Option A: Environment Variable Override (Zero Code Deployment Required)

1. Log into **Vercel Dashboard** -> **Project Settings** -> **Environment Variables**.
2. Remove or unset the following environment variables:
   - `R2_ENDPOINT`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
3. Ensure `BLOB_READ_WRITE_TOKEN` (or `PUBLIC_BLOB_READ_WRITE_TOKEN`) remains set.
4. Redeploy the application on Vercel (or trigger a new build).
5. **Effect:** The storage abstraction layer in [`lib/s3.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/lib/s3.ts#L36-L45) and [`lib/upload-helper.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/lib/upload-helper.ts#L43-L65) will automatically detect the absence of R2 credentials and revert all NEW CMS uploads to Vercel Blob.

---

### Option B: Local Development Rollback

If developing locally and wishing to revert to disk uploads (`public/local-uploads/`):
1. In `nextjs_space/.env`, comment out or remove `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `BLOB_READ_WRITE_TOKEN`.
2. Restart the local dev server (`npm run dev`).
3. All new uploads will automatically route to `/api/upload/local` and save to `public/local-uploads/`.

---

## IMPACT OF ROLLBACK ON EXISTING ASSETS

* **Existing Vercel Blob Assets:** Continue rendering without interruption.
* **Existing R2 Assets:** Continue serving cleanly via `https://assets.11estates.in/...` or R2 public endpoints as long as the bucket and DNS remain active.
* **Database Records:** Unaffected. No database migrations or rollbacks are needed.
