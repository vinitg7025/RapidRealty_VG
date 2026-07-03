import MicrositeView from '@/components/microsite/microsite-view';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';

// Reserve known paths
const RESERVED_SLUGS = ['dashboard', 'auth', 'api', '_next', 'favicon.ico'];

export default async function MicrositePage({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams: { preview?: string };
}) {
  const slugParts = params?.slug ?? [];
  const fullSlug = slugParts.join('/');
  const isPreview = searchParams?.preview === 'true';

  if (!fullSlug || RESERVED_SLUGS.includes(slugParts[0])) {
    notFound();
  }

  // Check if microsite exists and is published (or is being previewed)
  const microsite = await prisma.microsite.findUnique({
    where: { slug: fullSlug },
    select: { id: true, status: true, projectName: true },
  });

  if (!microsite || (microsite.status !== 'PUBLISHED' && !isPreview)) {
    const redirectRecord = await prisma.slugRedirect.findUnique({
      where: { oldSlug: fullSlug },
    });
    if (redirectRecord) {
      redirect(`/${redirectRecord.newSlug}`);
    }
    notFound();
  }

  return <MicrositeView slug={fullSlug} projectName={microsite.projectName} />;
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const fullSlug = (params?.slug ?? []).join('/');
  const microsite = await prisma.microsite.findUnique({
    where: { slug: fullSlug },
    select: { projectName: true, builderName: true, location: true, city: true },
  });

  if (!microsite) return { title: 'Not Found' };

  return {
    title: `${microsite.projectName} by ${microsite.builderName} | 11 Estates`,
    description: `${microsite.projectName} in ${microsite.location}${microsite.city ? `, ${microsite.city}` : ''} by ${microsite.builderName}. Get the best deal with 11 Estates.`,
  };
}
