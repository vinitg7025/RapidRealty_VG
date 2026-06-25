import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  const dbDir = path.join(process.cwd(), 'database');

  console.log('Seeding Users...');
  const usersCsv = fs.readFileSync(path.join(dbDir, 'User.csv'), 'utf-8');
  const users = parse(usersCsv, { columns: true, skip_empty_lines: true });
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        name: user.name || null,
        email: user.email,
        password: user.password,
        role: user.role,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }

  console.log('Seeding Accounts...');
  const accountsCsv = fs.readFileSync(path.join(dbDir, 'Account.csv'), 'utf-8');
  const accounts = parse(accountsCsv, { columns: true, skip_empty_lines: true });
  for (const account of accounts) {
    await prisma.account.upsert({
      where: { id: account.id },
      update: {},
      create: {
        id: account.id,
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token || null,
        access_token: account.access_token || null,
        expires_at: account.expires_at ? parseInt(account.expires_at, 10) : null,
        token_type: account.token_type || null,
        scope: account.scope || null,
        id_token: account.id_token || null,
        session_state: account.session_state || null,
      },
    });
  }

  console.log('Seeding Sessions...');
  const sessionsCsv = fs.readFileSync(path.join(dbDir, 'Session.csv'), 'utf-8');
  const sessions = parse(sessionsCsv, { columns: true, skip_empty_lines: true });
  for (const session of sessions) {
    await prisma.session.upsert({
      where: { id: session.id },
      update: {},
      create: {
        id: session.id,
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: new Date(session.expires),
      },
    });
  }

  console.log('Seeding VerificationTokens...');
  const tokensCsv = fs.readFileSync(path.join(dbDir, 'VerificationToken.csv'), 'utf-8');
  const tokens = parse(tokensCsv, { columns: true, skip_empty_lines: true });
  for (const token of tokens) {
    await prisma.verificationToken.upsert({
      where: { token: token.token },
      update: {},
      create: {
        identifier: token.identifier,
        token: token.token,
        expires: new Date(token.expires),
      },
    });
  }

  console.log('Seeding Microsites...');
  const micrositesCsv = fs.readFileSync(path.join(dbDir, 'Microsite.csv'), 'utf-8');
  const microsites = parse(micrositesCsv, { columns: true, skip_empty_lines: true });
  for (const m of microsites) {
    await prisma.microsite.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        slug: m.slug,
        status: m.status,
        createdById: m.createdById,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
        projectName: m.projectName,
        builderName: m.builderName,
        location: m.location,
        city: m.city || '',
        possessionDate: m.possessionDate || '',
        projectDescription: m.projectDescription || '',
        reraNumber: m.reraNumber || '',
        projectType: m.projectType || '',
        priceRangeMin: m.priceRangeMin || '',
        priceRangeMax: m.priceRangeMax || '',
        projectHighlights: m.projectHighlights || '[]',
        builderDescription: m.builderDescription || '',
        builderExperience: m.builderExperience || '',
        builderProjects: m.builderProjects || '',
        heroImages: m.heroImages || '[]',
        galleryImages: m.galleryImages || '[]',
        masterPlanImage: m.masterPlanImage || '',
        builderLogoPath: m.builderLogoPath || '',
        brochurePath: m.brochurePath || '',
        pricingData: m.pricingData || '[]',
        connectivityData: m.connectivityData || '[]',
        amenities: m.amenities || '[]',
        floorPlans: m.floorPlans || '[]',
        faqs: m.faqs || '[]',
        legalInfo: m.legalInfo || '',
        reraQrCodes: m.reraQrCodes || '[]',
      },
    });
  }

  console.log('Seeding Leads...');
  const leadsCsv = fs.readFileSync(path.join(dbDir, 'Lead.csv'), 'utf-8');
  const leads = parse(leadsCsv, { columns: true, skip_empty_lines: true });
  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { id: lead.id },
      update: {},
      create: {
        id: lead.id,
        micrositeId: lead.micrositeId,
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        message: lead.message || '',
        source: lead.source || 'inquiry_form',
        createdAt: new Date(lead.createdAt),
      },
    });
  }

  console.log('CSV Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
