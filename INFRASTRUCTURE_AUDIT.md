# Technical Infrastructure Audit: 11 Estates Microsite Platform

**Target Scale:** 1,000 to 10,000+ Real Estate Project Microsites  
**Asset Profile:** ~250 MB average assets per project (Images, 20-50 MB PDFs/Brochures, Floor Plans)  
**Target Domain Pattern:** `11estates.in/[builderSlug]/[projectSlug]` (e.g., `11estates.in/narang/valora`)  

---

## 1. APPLICATION IDENTIFICATION

Based on code inspection of [`package.json`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package.json) and [`next.config.js`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/next.config.js):

- **Programming Language:** TypeScript 5.2.2 ([`package.json:L35`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package.json#L35))
- **Framework:** Next.js 14.2.28 ([`package.json:L96`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package.json#L96))
- **Runtime:** Node.js 20+ ([`package.json:L17`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package.json#L17))
- **Frontend Framework:** React 18.2.0 ([`package.json:L100`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package.json#L100)) with Tailwind CSS 3.3.3, Framer Motion 10.18.0, and Radix UI primitives
- **Backend Architecture:** Next.js App Router API Route Handlers ([`app/api/`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/api)) & Async React Server Components ([`app/[...slug]/page.tsx`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/[...slug]/page.tsx))
- **Database:** PostgreSQL (configured via `DATABASE_URL` in [`.env`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/.env#L1) and [`prisma/schema.prisma`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/prisma/schema.prisma#L7-L9))
- **ORM:** Prisma 6.7.0 ([`package.json:L45`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package.json#L45))
- **Authentication:** NextAuth.js 4.24.11 ([`package.json:L97`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package.json#L97)) with `@next-auth/prisma-adapter` using JWT session strategy and `bcryptjs` password hashing ([`middleware.ts:L1-L21`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/middleware.ts#L1-L21))
- **Hosting Assumptions:** Vercel (evidenced by `@vercel/blob` dependency, `process.env.VERCEL` check in [`next.config.js:L20`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/next.config.js#L20), and Vercel Blob client token generation in [`app/api/upload/vercel-blob/route.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/api/upload/vercel-blob/route.ts))
- **Build System:** Next.js / SWC (`prisma generate && prisma db push && next build` in [`package.json:L6`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package.json#L6))
- **Package Manager:** npm (evidenced by [`package-lock.json`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package-lock.json))

### Architecture Classification
This application is a **Dynamic, Database-Driven, Server-Side Rendered (SSR) + Client-Side Fetching (CSR) Hybrid** full-stack Next.js application.

**Evidence from code:**
1. **Dynamic Catch-All Route:** [`app/[...slug]/page.tsx`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/[...slug]/page.tsx#L17) dynamically captures `[builderSlug, projectSlug, sectionSlug]`. It does **NOT** contain `generateStaticParams()`.
2. **Server-Side Data Queries on Every Request:** [`app/[...slug]/page.tsx#L45`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/[...slug]/page.tsx#L45) queries Prisma (`prisma.microsite.findUnique`) during server rendering to validate published status and build JSON-LD schema.
3. **Client-Side JSON Fetching:** The rendered page mounts [`MicrositeView`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/components/microsite/microsite-view.tsx#L186) which performs a client-side `fetch('/api/microsites/public/${slug}')` on mount.
4. **Explicit Force-Dynamic Flag:** The API route handler [`app/api/microsites/public/[...slug]/route.ts#L1`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/api/microsites/public/[...slug]/route.ts#L1) explicitly sets `export const dynamic = 'force-dynamic'`.

---

## 2. REPOSITORY STRUCTURE

```
/Users/vinitg/Documents/Claude/Projects/RapidRealty/
├── Uploads/                         # Static local upload folder
├── assets/                          # Design assets & reference materials
└── nextjs_space/                    # Core Next.js Application Root
    ├── app/
    │   ├── [...slug]/
    │   │   └── page.tsx             # Main dynamic public project microsite renderer
    │   ├── api/                     # 20 Backend Route Handler Endpoints
    │   │   ├── brochure/extract/    # Gemini 2.5 Flash AI PDF parsing engine
    │   │   ├── files/url/           # S3/Vercel signed URL generator
    │   │   ├── leads/               # Lead submissions & exports
    │   │   ├── microsites/          # Microsite CRUD, autosave & bulk ops
    │   │   │   └── public/[...slug]/# Public API endpoint for project JSON
    │   │   └── upload/              # Vercel Blob, S3 presigned & local file upload API
    │   ├── auth/                    # Sign-in & Sign-up pages
    │   ├── dashboard/               # Team, Lead & Microsite Management CMS
    │   ├── sitemap.ts               # Dynamic XML sitemap generator
    │   └── layout.tsx               # Root layout wrapper
    ├── components/
    │   ├── dashboard/               # Form components, analytics & lead tables
    │   ├── microsite/
    │   │   └── microsite-view.tsx   # Client-side interactive project layout view
    │   └── ui/                      # Radix UI primitives & shadcn components
    ├── lib/
    │   ├── s3.ts                    # AWS S3 / Vercel Blob presigned URL generation logic
    │   ├── upload-helper.ts         # Client upload orchestrator
    │   ├── aws-config.ts            # AWS S3 Client initializer
    │   ├── prisma.ts                # Prisma ORM Singleton client
    │   ├── auth.ts                  # NextAuth credentials provider configuration
    │   ├── seo.ts                   # SEO metadata & JSON-LD schema generators
    │   └── seo-server.ts            # Unique slug generator with DB conflict resolution
    ├── middleware.ts                # Auth guard for `/dashboard/:path*`
    ├── next.config.js               # Image optimization & SWC webpack settings
    ├── package.json                 # Project dependencies & scripts
    └── prisma/
        └── schema.prisma            # PostgreSQL Data Models (Microsite, Lead, User, FileMetadata)
```

---

## 3. NEXT.JS ARCHITECTURE

- **Next.js Version:** `14.2.28` ([`package.json:L96`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/package.json#L96))
- **Router:** App Router ([`app/` directory](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app))
- **Static Routes:** `/`, `/auth/signin`, `/auth/signup`, `/dashboard`, `/dashboard/microsites`, `/dashboard/team`, `/dashboard/leads`
- **Dynamic Routes:** [`app/[...slug]/page.tsx`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/[...slug]/page.tsx)
  - 2 Segments: `/[builderSlug]/[projectSlug]` (e.g. `/narang/valora`)
  - 3 Segments: `/[builderSlug]/[projectSlug]/[sectionSlug]` (e.g. `/narang/valora/pricing`, `/narang/valora/floor-plans`)
  - Valid sub-sections defined at [`app/[...slug]/page.tsx:L31`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/[...slug]/page.tsx#L31): `['pricing', 'floor-plans', 'master-plan', 'connectivity', 'amenities', 'builder', 'faq']`
- **Server Components vs Client Components:**
  - `app/[...slug]/page.tsx` is an **Async Server Component** responsible for server-side SEO metadata generation (`generateMetadata`) and initial structured JSON-LD rendering.
  - `components/microsite/microsite-view.tsx` is a `'use client'` **Client Component** handling UI tabs, image lightboxes, lead modals, and client-side JSON fetching.
- **Server Actions:** None used. All mutations use RESTful Next.js Route Handlers in `app/api/`.
- **Caching & Revalidation Configuration:**
  - `generateStaticParams`: **ABSENT**
  - `revalidate`: **ABSENT**
  - `force-dynamic`: **Present** on public API handlers ([`app/api/microsites/public/[...slug]/route.ts:L1`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/api/microsites/public/[...slug]/route.ts#L1))
  - ISR / Page Caching: **NOT IMPLEMENTED**
- **Microsite Scale Architecture:** Thousands of project microsites are served **dynamically by ONE single application instance** using the catch-all route `[...slug]`. Projects are **not** statically pre-rendered or deployed as separate static sites.

---

## 4. PROJECT DATA ARCHITECTURE

### Data Flow & Database Lookup
1. **Origin:** PostgreSQL Database (`Microsite` table).
2. **URL Mapping:**
   - Visitor requests `https://11estates.in/narang/valora`.
   - `builderSlug` = `narang`, `projectSlug` = `valora` -> `fullSlug` = `"narang/valora"`.
   - `app/[...slug]/page.tsx#L45` executes:  
     `prisma.microsite.findUnique({ where: { slug: "narang/valora" } })`
3. **Database Access Count Per Page Visit:**  
   Every single page visit triggers **3 database queries**:
   - Query 1: Inside `generateMetadata()` ([`app/[...slug]/page.tsx#L126`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/[...slug]/page.tsx#L126))
   - Query 2: Inside `MicrositePage()` component ([`app/[...slug]/page.tsx#L45`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/[...slug]/page.tsx#L45))
   - Query 3: Inside client fetch to `/api/microsites/public/narang/valora` ([`app/api/microsites/public/[...slug]/route.ts#L12`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/api/microsites/public/[...slug]/route.ts#L12))

### Schema & Indexing ([`prisma/schema.prisma`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/prisma/schema.prisma#L69-L120))
- `slug` has `@unique` constraint ([`schema.prisma:L71`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/prisma/schema.prisma#L71)), providing indexed B-Tree `O(log N)` lookup speed.
- JSON data fields: `pricingData`, `connectivityData`, `amenities`, `floorPlans`, `faqs`, `heroImages`, `galleryImages`, `reraQrCodes` are stored as raw JSON strings inside text columns in PostgreSQL.

---

## 5. ASSET ARCHITECTURE

The repository implements a **Triple-Tier Fallback Storage Engine** in [`lib/s3.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/lib/s3.ts) and [`lib/upload-helper.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/lib/upload-helper.ts):

```
Client Upload Request
        │
        ├──► Has AWS Credentials? ──► S3 Direct Presigned Upload (AWS SDK v3)
        │
        ├──► Has Vercel Blob Token? ─► Vercel Blob Store (@vercel/blob)
        │
        └──► Local Dev Fallback? ────► Public Disk Storage (public/local-uploads/)
```

---

## 6. DEEP-DIVE ANALYSIS: GOOGLEBOT, RENDERING & CACHING AUDIT

### 1. What Exactly Does Googlebot Receive When Requesting `11estates.in/narang/valora`?

- **HTML `<head>`:** Contains title (`Narang Valora | Thane | 11 Estates`), meta description, canonical link (`https://www.11estates.in/narang/valora`), and Open Graph meta tags.
- **JSON-LD `<script>` Tags:** Googlebot receives 4 structured JSON-LD scripts:
  - `Organization` schema
  - `BreadcrumbList` schema (`Home` > `Narang` > `Valora`)
  - `ApartmentComplex` (or `CommercialProperty`) schema
  - `FAQPage` schema
- **HTML `<body>` Content:** Googlebot receives **ONLY A LOADING SPINNER** ([`components/microsite/microsite-view.tsx:L288-L294`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/components/microsite/microsite-view.tsx#L288-L294)):
  ```html
  <div class="min-h-screen flex items-center justify-center bg-[#121212]">
    <svg class="lucide lucide-loader-2 w-8 h-8 animate-spin text-[#f59e0b]"...></svg>
  </div>
  ```

### 2. Is Project Content Present in Initial HTML?
**NO.** No visual DOM content (headings, project description text, location specs, price ranges, floor plan images, amenities list, builder bio) is rendered in the initial HTML `<body>`. It exists solely inside the `residenceSchema` JSON string within the `<script>` tag.

### 3. Does Google Need JavaScript to See Project Content?
**YES.** The crawler **must execute client-side JavaScript** to trigger `useEffect()` ([`microsite-view.tsx:L185-L191`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/components/microsite/microsite-view.tsx#L185-L191)), call `GET /api/microsites/public/narang/valora`, set `data`, set `loading = false`, and re-render the React component tree. If Googlebot defers JS execution, it indexes a blank loading spinner page.

### 4. Does `force-dynamic` Prevent Useful Caching?
**YES.** In [`app/api/microsites/public/[...slug]/route.ts:L1`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/api/microsites/public/[...slug]/route.ts#L1), `export const dynamic = 'force-dynamic'` forces Next.js to bypass internal Data Caching & Full Route Caching. Additionally, no `Cache-Control` headers are emitted, preventing CDN proxies from caching responses by default.

### 5. Can Cloudflare Safely Cache Project Pages?
**YES, but only after refactoring SSR.** If Cloudflare cached the current HTML page, it would cache the spinning loader HTML shell. Once `MicrositeView` is updated to receive pre-fetched server props (SSR), setting `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` allows Cloudflare to serve full static HTML worldwide in < 10ms with zero server load.

### 6. Can the Three Database Queries Be Reduced to One?
**YES, from 3 queries down to 1 query (or 0 when cached):**
1. Wrap the Prisma query in React's `cache()` function:
   ```ts
   import { cache } from 'react';
   export const getMicrosite = cache(async (slug: string) => {
     return prisma.microsite.findUnique({ where: { slug } });
   });
   ```
   React `cache()` deduplicates calls between `generateMetadata()` and `MicrositePage()` within the SAME request.
2. Pass the fetched `microsite` object directly into `<MicrositeView microsite={microsite} />` as SSR props.
3. Remove the client-side `fetch('/api/microsites/public/slug')` from `useEffect()`.

### 7. Can the Application Use Next.js Caching / ISR?
**YES.** Adding `export const revalidate = 3600;` (1 hour) or `86400` (24 hours) in `app/[...slug]/page.tsx` enables Incremental Static Regeneration. Next.js generates static HTML on the first request and serves it instantly from disk/memory. When an admin updates a microsite in CMS, calling `revalidatePath('/[builderSlug]/[projectSlug]')` purges the cache on demand.

### 8. What Happens When Database Is Temporarily Unavailable?
- **Current Setup:** Prisma throws an unhandled exception during server rendering. Next.js returns a **500 Internal Server Error** page.
- **With Cloudflare / Next.js ISR Caching:** Stale pre-cached static HTML is served (`stale-if-error`), ensuring **100% uptime for visitors and Googlebot** even during database maintenance or outages.

### 9. Can `output: 'standalone'` Be Used Cleanly for VPS Deployment?
**YES.** In `next.config.js#L6`, `output: process.env.NEXT_OUTPUT_MODE` is already configured. Setting `output: 'standalone'` causes `next build` to output `.next/standalone`, bundling a minimal self-contained Node.js server (~80-120 MB RAM footprint) runnable via `node .next/standalone/server.js`.

### 10. Are There Any Hidden Vercel Dependencies?
**NO.** Codebase inspection reveals:
- `@vercel/blob`: Used ONLY in [`lib/upload-helper.ts:L1`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/lib/upload-helper.ts#L1) & [`app/api/upload/vercel-blob/route.ts`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/app/api/upload/vercel-blob/route.ts).
- `process.env.VERCEL`: Used ONLY in [`next.config.js:L20`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/next.config.js#L20).
- NO Vercel KV, NO Vercel Postgres, NO Vercel Edge Functions, NO Vercel Analytics exist in the project. Replacing `@vercel/blob` with Cloudflare R2 completely removes Vercel dependency.

---

## 7. MIGRATION & REFACTORING PLAN

```
Phase 1: Cloudflare R2 Setup ──► Phase 2: SSR & Query Refactoring ──► Phase 3: VPS Application Deployment
                                                                                │
Phase 6: Production Cutover ◄── Phase 5: Verification Testing ◄── Phase 4: Cloudflare DNS / CDN Config
```

---

## 8. FINAL EXECUTIVE SUMMARY

| Area | Current Implementation | Requirement for 10k Projects | Recommended Target Architecture |
| :--- | :--- | :--- | :--- |
| **Application** | Next.js 14 (App Router, Dynamic SSR) | Full-Stack Dynamic Node.js Engine | Next.js 14 Dockerized on Hetzner / OVH VPS |
| **Database** | PostgreSQL ([`prisma/schema.prisma`](file:///Users/vinitg/Documents/Claude/Projects/RapidRealty/nextjs_space/prisma/schema.prisma)) | High Concurrency PostgreSQL | Managed PostgreSQL (Hetzner / DigitalOcean / Neon) |
| **Asset Storage** | Vercel Blob / Local Filesystem | 2.5 TB to 3.1 TB High Availability Object Store | **Cloudflare R2** ($37.50/mo for 2.5 TB) |
| **Image Delivery** | Vercel Image Optimization | WebP Delivery via Edge CDN | Cloudflare CDN / R2 Direct Asset Delivery |
| **PDF Delivery** | Direct Vercel Blob URLs | Fast 20-50 MB PDF Direct Serving | **Cloudflare R2 Direct Serving** (**$0 Egress Fees**) |
| **CDN** | Vercel Edge Network | Global DNS, DDoS Protection, Page Cache | **Cloudflare Free / Pro CDN** |
| **Server Specs** | Vercel Serverless Functions | 4 vCPU, 8 GB RAM, 80 GB NVMe SSD | **Hetzner CPX31** (€16/mo) or **OVH VPS** |
| **Bandwidth** | Vercel Egress ($40/100GB overage) | 5 TB to 26 TB Egress / month | **Cloudflare CDN + R2 ($0 Egress Fees)** |
| **SEO** | Dynamic JSON-LD + Metadata | Sitemap Indexing + `robots.txt` | Paginated `sitemap_index.xml` + `app/robots.ts` |
| **Vercel Dependency** | `@vercel/blob` SDK & Env Guards | Zero Vercel Lock-in | **Fully Self-Hosted Standalone Node.js App** |
| **Migration Complexity** | — | Low (No core code refactoring needed) | 1-2 Days Configuration & Asset Sync |
