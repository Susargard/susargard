import { stat } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Превращает публичный URL в путь внутри папки public (только на этапе сборки). */
function toPublicPath(url: string): string {
  let path = url;
  if (BASE && path.startsWith(`${BASE}/`)) path = path.slice(BASE.length);
  if (!path.startsWith('/')) path = `/${path}`;
  return join(process.cwd(), 'public', path);
}

export async function fileSize(url?: string): Promise<number | undefined> {
  if (!url || /^https?:\/\//.test(url)) return undefined;
  try {
    const info = await stat(toPublicPath(url));
    return info.size;
  } catch {
    return undefined;
  }
}
