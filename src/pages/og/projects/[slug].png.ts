import type { APIContext } from 'astro';
import { getProjects } from '../../../lib/content';
import { renderOg, ogResponse } from '../../../lib/og';

export async function getStaticPaths() {
  const projects = await getProjects();
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

export async function GET({ props }: APIContext) {
  const { project } = props as { project: Awaited<ReturnType<typeof getProjects>>[number] };
  const png = await renderOg({
    kicker: `PROJECT · ${project.data.status.toUpperCase()}`,
    title: project.data.title,
    subtitle: project.data.hook,
  });
  return ogResponse(png);
}
