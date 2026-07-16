import { prisma } from './prisma';
import { generateMicrositeSlugs } from './seo';

export async function generateUniqueSlug(builderName: string, projectName: string, currentId?: string): Promise<string> {
  const { fullSlug } = generateMicrositeSlugs(builderName, projectName);
  
  if (!fullSlug) {
    return `project-${Date.now()}`;
  }
  
  let slug = fullSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.microsite.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    if (!existing || existing.id === currentId) {
      break;
    }
    
    // Append counter to project slug part
    const parts = fullSlug.split('/');
    if (parts.length === 2) {
      slug = `${parts[0]}/${parts[1]}-${counter}`;
    } else {
      slug = `${fullSlug}-${counter}`;
    }
    counter++;
  }
  return slug;
}
