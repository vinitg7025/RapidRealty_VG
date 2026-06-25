-- Enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEAM_MEMBER');
CREATE TYPE "MicrositeStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- User
CREATE TABLE "User" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "name"      TEXT,
    "email"     TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "role"      "UserRole" NOT NULL DEFAULT 'TEAM_MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Account
CREATE TABLE "Account" (
    "id"                TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId"            TEXT NOT NULL,
    "type"              TEXT NOT NULL,
    "provider"          TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token"     TEXT,
    "access_token"      TEXT,
    "expires_at"        INTEGER,
    "token_type"        TEXT,
    "scope"             TEXT,
    "id_token"          TEXT,
    "session_state"     TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- Session
CREATE TABLE "Session" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "sessionToken" TEXT NOT NULL,
    "userId"       TEXT NOT NULL,
    "expires"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- VerificationToken
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token"      TEXT NOT NULL,
    "expires"    TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Microsite
CREATE TABLE "Microsite" (
    "id"                 TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "slug"               TEXT NOT NULL,
    "status"             "MicrositeStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById"        TEXT NOT NULL,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,
    "projectName"        TEXT NOT NULL,
    "builderName"        TEXT NOT NULL,
    "location"           TEXT NOT NULL,
    "city"               TEXT NOT NULL DEFAULT '',
    "possessionDate"     TEXT NOT NULL DEFAULT '',
    "projectDescription" TEXT NOT NULL DEFAULT '',
    "reraNumber"         TEXT NOT NULL DEFAULT '',
    "projectType"        TEXT NOT NULL DEFAULT '',
    "priceRangeMin"      TEXT NOT NULL DEFAULT '',
    "priceRangeMax"      TEXT NOT NULL DEFAULT '',
    "projectHighlights"  TEXT NOT NULL DEFAULT '[]',
    "builderDescription" TEXT NOT NULL DEFAULT '',
    "builderExperience"  TEXT NOT NULL DEFAULT '',
    "builderProjects"    TEXT NOT NULL DEFAULT '',
    "heroImages"         TEXT NOT NULL DEFAULT '[]',
    "galleryImages"      TEXT NOT NULL DEFAULT '[]',
    "masterPlanImage"    TEXT NOT NULL DEFAULT '',
    "builderLogoPath"    TEXT NOT NULL DEFAULT '',
    "brochurePath"       TEXT NOT NULL DEFAULT '',
    "pricingData"        TEXT NOT NULL DEFAULT '[]',
    "connectivityData"   TEXT NOT NULL DEFAULT '[]',
    "amenities"          TEXT NOT NULL DEFAULT '[]',
    "floorPlans"         TEXT NOT NULL DEFAULT '[]',
    "faqs"               TEXT NOT NULL DEFAULT '[]',
    "legalInfo"          TEXT NOT NULL DEFAULT '',
    "reraQrCodes"        TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Microsite_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Microsite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id")
);
CREATE UNIQUE INDEX "Microsite_slug_key" ON "Microsite"("slug");
CREATE INDEX "Microsite_status_idx" ON "Microsite"("status");
CREATE INDEX "Microsite_createdById_idx" ON "Microsite"("createdById");

-- Lead
CREATE TABLE "Lead" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "micrositeId" TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "phone"       TEXT NOT NULL,
    "email"       TEXT NOT NULL DEFAULT '',
    "message"     TEXT NOT NULL DEFAULT '',
    "source"      TEXT NOT NULL DEFAULT 'inquiry_form',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Lead_micrositeId_fkey" FOREIGN KEY ("micrositeId") REFERENCES "Microsite"("id") ON DELETE CASCADE
);
CREATE INDEX "Lead_micrositeId_idx" ON "Lead"("micrositeId");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");