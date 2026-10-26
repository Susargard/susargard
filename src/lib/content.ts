import { getCollection, type CollectionEntry } from 'astro:content';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Добавляет базовый путь GitHub Pages к внутренней ссылке. */
export function withBase(path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (BASE && (normalized === BASE || normalized.startsWith(`${BASE}/`))) return normalized;
  return `${BASE}${normalized}`;
}

/** Ссылка на файл из public/files или внешний адрес. */
export function fileUrl(file: string | undefined, slug: string, externalUrl?: string): string | undefined {
  if (externalUrl) return externalUrl;
  if (!file) return undefined;
  if (/^https?:\/\//.test(file)) return file;
  if (file.startsWith('/')) return withBase(file);
  return withBase(`/files/${slug}/${file}`);
}

export async function getSettings() {
  const entries = await getCollection('settings');
  const entry = entries[0];
  if (!entry) throw new Error('Не найден файл настроек src/content/settings/site.yaml');
  return entry.data;
}

export type SiteSettings = Awaited<ReturnType<typeof getSettings>>;

export async function getPage(id: string) {
  const entries = await getCollection('pages');
  const entry = entries.find((item) => item.id === id);
  if (!entry) throw new Error(`Не найдена страница src/content/pages/${id}.md`);
  return entry;
}

export async function getSections() {
  const entries = await getCollection('sections');
  return entries.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'ru'),
  );
}

export type ProjectEntry = CollectionEntry<'projects'>;
export type SectionEntry = CollectionEntry<'sections'>;

/** В dev-режиме и в демо-сборке показываем черновики, в продакшене — нет. */
export function isVisible(entry: ProjectEntry): boolean {
  return (
    !entry.data.draft ||
    import.meta.env.DEV ||
    import.meta.env.PUBLIC_SHOW_DRAFTS === 'true'
  );
}

export async function getProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection('projects');
  return entries
    .filter(isVisible)
    .sort(
      (a, b) =>
        a.data.order - b.data.order ||
        Number(b.data.year?.slice(0, 4) ?? 0) - Number(a.data.year?.slice(0, 4) ?? 0) ||
        a.data.title.localeCompare(b.data.title, 'ru'),
    );
}

export function projectsOf(entries: ProjectEntry[], section: string): ProjectEntry[] {
  return entries.filter((entry) => entry.data.section === section);
}

export function featuredProjects(entries: ProjectEntry[], limit = 6): ProjectEntry[] {
  const featured = entries.filter((entry) => entry.data.featured);
  return (featured.length ? featured : entries).slice(0, limit);
}

export function sectionUrl(section: string): string {
  return withBase(`/${section}/`);
}

export function projectUrl(section: string, id: string): string {
  return withBase(`/${section}/${id}/`);
}

export function formatYear(year?: string): string | undefined {
  if (!year) return undefined;
  return year.replace(/\s*—\s*/g, ' — ');
}

export function formatBytes(bytes?: number): string | undefined {
  if (bytes === undefined || Number.isNaN(bytes)) return undefined;
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function fileExtension(path?: string): string | undefined {
  if (!path) return undefined;
  const match = /\.([a-z0-9]+)(?:\?|#|$)/i.exec(path);
  return match?.[1]?.toUpperCase();
}
