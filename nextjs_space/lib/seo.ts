export function slugify(text: string): string {
  return (text ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function cleanBuilderName(name: string): string {
  return (name ?? '')
    .replace(/\b(realty|realtors|group|developers|builders|builder|real estate|properties|homes|constructions|infrastructure|infra|holdings|ventures|projects|limited|ltd|pvt|private)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateMicrositeSlugs(builderName: string, projectName: string) {
  const cleanedBuilder = cleanBuilderName(builderName);
  const builderSlug = slugify(cleanedBuilder || builderName);
  
  // Clean project name: remove the builder's cleaned name and its individual words
  let cleanedProject = projectName;
  
  const builderWords = cleanedBuilder.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  for (const word of builderWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanedProject = cleanedProject.replace(regex, '');
  }
  
  // Also remove common builder terms from the project name just in case
  cleanedProject = cleanBuilderName(cleanedProject);
  
  const projectSlug = slugify(cleanedProject || projectName);
  
  return {
    builderSlug,
    projectSlug,
    fullSlug: builderSlug && projectSlug ? `${builderSlug}/${projectSlug}` : (builderSlug || projectSlug)
  };
}

export function generateImageAltText(
  projectName: string,
  imageType: 'hero' | 'gallery' | 'masterPlan' | 'floorPlan' | 'logo',
  imagePathOrConfig?: string
): string {
  const project = projectName || 'Project';
  
  if (imageType === 'masterPlan') {
    return `${project} Master Plan`;
  }
  if (imageType === 'logo') {
    return `${project} Builder Logo`;
  }
  if (imageType === 'floorPlan') {
    const config = imagePathOrConfig ? imagePathOrConfig.trim() : '';
    return `${project} ${config ? config + ' ' : ''}Floor Plan`;
  }
  
  // For hero and gallery images, check the filename/path
  const path = imagePathOrConfig || '';
  const filename = path.split('/').pop()?.toLowerCase() || '';
  
  if (filename.includes('pool') || filename.includes('swimming')) {
    return `${project} Swimming Pool`;
  }
  if (filename.includes('gym') || filename.includes('fitness') || filename.includes('workout')) {
    return `${project} Gym`;
  }
  if (filename.includes('club') || filename.includes('clubhouse')) {
    return `${project} Clubhouse`;
  }
  if (filename.includes('lobby') || filename.includes('entrance')) {
    return `${project} Lobby`;
  }
  if (filename.includes('garden') || filename.includes('park') || filename.includes('lawn') || filename.includes('landscape')) {
    return `${project} Garden`;
  }
  if (filename.includes('interior') || filename.includes('living') || filename.includes('bedroom') || filename.includes('kitchen') || filename.includes('flat') || filename.includes('show')) {
    return `${project} Interior View`;
  }
  if (filename.includes('master') && filename.includes('plan')) {
    return `${project} Master Plan`;
  }
  if (filename.includes('exterior') || filename.includes('elevation') || filename.includes('facade') || filename.includes('outside') || filename.includes('rendering') || filename.includes('view')) {
    return `${project} Exterior View`;
  }
  
  // Default fallback based on type
  if (imageType === 'hero') {
    return `${project} Exterior View`;
  }
  return `${project} Gallery Image`;
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "11 Estates",
    "url": "https://www.11estates.in",
    "logo": "https://www.11estates.in/og-image.png"
  };
}

export function generateBreadcrumbSchema(builderName: string, builderSlug: string, projectName: string, projectSlug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.11estates.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": builderName,
        "item": `https://www.11estates.in/${builderSlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": projectName,
        "item": `https://www.11estates.in/${builderSlug}/${projectSlug}`
      }
    ]
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;
  const filteredFaqs = faqs.filter(f => f.question?.trim() && f.answer?.trim());
  if (filteredFaqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question.trim(),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.trim()
      }
    }))
  };
}

export function generateResidenceSchema(
  projectName: string,
  builderName: string,
  location: string,
  city: string,
  projectDescription: string,
  projectType: string,
  pricingData: Array<{ config: string; area: string; price: string }>,
  builderSlug: string,
  projectSlug: string
) {
  const isCommercial = projectType === 'Commercial';
  const type = isCommercial ? 'CommercialProperty' : 'ApartmentComplex';
  const mainUrl = `https://www.11estates.in/${builderSlug}/${projectSlug}`;
  
  const offers = (pricingData ?? [])
    .filter(p => p.config?.trim() && p.price?.trim())
    .map(p => ({
      "@type": "Offer",
      "name": p.config.trim(),
      "price": p.price.trim(),
      "priceCurrency": "INR"
    }));
    
  const schema: any = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${mainUrl}#project`,
    "url": mainUrl,
    "name": projectName,
    "description": projectDescription || `Explore ${projectName} in ${location}, ${city} by ${builderName}.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location,
      "addressRegion": city || 'Mumbai',
      "addressCountry": "IN"
    }
  };
  
  if (offers.length > 0) {
    schema.offers = offers;
  }
  
  return schema;
}

export interface SeoMetadataInput {
  projectName: string;
  builderName: string;
  location: string;
  city?: string;
  sectionSlug?: string;
}

export function generateSectionMetadata(input: SeoMetadataInput) {
  const { projectName, builderName, location, city, sectionSlug } = input;
  const loc = location || city || '';
  
  let title = `${builderName} ${projectName} | ${loc} | 11 Estates`;
  let description = `Explore ${projectName} in ${loc}. Latest pricing, floor plans, amenities, brochure and expert guidance from 11 Estates.`;

  if (sectionSlug) {
    switch (sectionSlug) {
      case 'pricing':
        title = `${projectName} Price and Configurations | 11 Estates`;
        description = `Check out the price range, configurations, and pricing details for ${projectName} in ${loc} by ${builderName}. Get expert guidance from 11 Estates.`;
        break;
      case 'floor-plans':
        title = `${projectName} Floor Plans and Unit Layouts | 11 Estates`;
        description = `View floor plans, unit layouts, carpet areas, and configurations for ${projectName} in ${loc} by ${builderName}. Get details on 11 Estates.`;
        break;
      case 'master-plan':
        title = `${projectName} Master Plan | 11 Estates`;
        description = `Explore the master plan layout, tower placements, and layout design of ${projectName} in ${loc} by ${builderName}. Details on 11 Estates.`;
        break;
      case 'connectivity':
        title = `${projectName} Location and Connectivity | 11 Estates`;
        description = `Discover the location map, connectivity features, and nearby landmarks for ${projectName} in ${loc} by ${builderName} on 11 Estates.`;
        break;
      case 'amenities':
        title = `${projectName} Amenities | 11 Estates`;
        description = `Explore all the modern amenities, leisure facilities, and specifications of ${projectName} in ${loc} by ${builderName} on 11 Estates.`;
        break;
      case 'builder':
        title = `${projectName} by ${builderName} | Builder Details | 11 Estates`;
        description = `Read details about ${builderName}, their track record, expertise, and ongoing projects for ${projectName} in ${loc} on 11 Estates.`;
        break;
      case 'faq':
        title = `${projectName} FAQs | 11 Estates`;
        description = `Find answers to frequently asked questions about pricing, possession date, RERA, and location of ${projectName} in ${loc} on 11 Estates.`;
        break;
    }
  }

  // Truncate description to 160 characters if it's too long
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  return { title, description };
}

export const DEFAULT_SITE_URL = 'https://www.11estates.in';

export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  return siteUrl.replace(/\/+$/, '');
}

export function getCanonicalUrl(path: string): string {
  const baseUrl = getSiteUrl();
  if (!path || path === '/') return baseUrl;

  let cleanPath = path.split('?')[0].split('#')[0];
  cleanPath = cleanPath.replace(/^\/+|\/+$/g, '');
  return `${baseUrl}/${cleanPath}`;
}

export interface AlternateLink {
  rel: string;
  hrefLang: string;
  href: string;
}

export interface MetadataInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noindex?: boolean;
  alternates?: AlternateLink[];
}

import type { Metadata } from 'next';

export function constructMetadata(input: MetadataInput): Metadata {
  const { title, description, path, ogImage, noindex = false, alternates = [] } = input;
  const canonicalUrl = getCanonicalUrl(path);
  const siteUrl = getSiteUrl();
  const defaultOg = `${siteUrl}/og/11-estates-default.jpg`;
  const resolvedOg = ogImage || defaultOg;

  const alternateLanguages: Record<string, string> = {};
  alternates.forEach(alt => {
    alternateLanguages[alt.hrefLang] = alt.href;
  });

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      nocache: noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: resolvedOg,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      siteName: '11 Estates',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [resolvedOg],
    },
    other: {
      'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'g-verification-placeholder',
    }
  };
}


