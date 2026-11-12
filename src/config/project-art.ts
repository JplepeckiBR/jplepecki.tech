import type { ProjectArt } from '../components/objects/ProjectSpecimen.astro';

/** Hand-drawn workbench objects per project slug. Projects not listed appear as a plain paper tag. */
const PROJECT_ART: Record<string, ProjectArt> = {
  'smart-vivarium': 'vivarium',
};

export function projectArt(slug: string): ProjectArt {
  return PROJECT_ART[slug] ?? 'tag';
}
