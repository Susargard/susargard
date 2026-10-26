import type { SiteSettings } from './content';

export interface ContactLink {
  key: string;
  label: string;
  value: string;
  href: string;
  external: boolean;
}

function stripAt(value: string): string {
  return value.trim().replace(/^@/, '');
}

function externalHref(value: string): string {
  if (/^https?:\/\//.test(value)) return value;
  return `https://${value}`;
}

export function instagramHandle(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(externalHref(url));
    const handle = parsed.pathname.split('/').filter(Boolean)[0];
    return handle ? `@${handle}` : undefined;
  } catch {
    return undefined;
  }
}

export function contactLinks(settings: SiteSettings): ContactLink[] {
  const links: ContactLink[] = [];

  if (settings.email) {
    links.push({
      key: 'email',
      label: 'Почта',
      value: settings.email,
      href: `mailto:${settings.email}`,
      external: false,
    });
  }

  if (settings.telegram) {
    const username = stripAt(settings.telegram);
    links.push({
      key: 'telegram',
      label: 'Telegram',
      value: `@${username}`,
      href: /^https?:\/\//.test(settings.telegram)
        ? settings.telegram
        : `https://t.me/${username}`,
      external: true,
    });
  }

  if (settings.instagram) {
    links.push({
      key: 'instagram',
      label: 'Instagram',
      value: instagramHandle(settings.instagram) ?? 'Профиль',
      href: externalHref(settings.instagram),
      external: true,
    });
  }

  if (settings.behance) {
    links.push({
      key: 'behance',
      label: 'Behance',
      value: 'Портфолио',
      href: externalHref(settings.behance),
      external: true,
    });
  }

  if (settings.vk) {
    links.push({
      key: 'vk',
      label: 'VK',
      value: settings.vk.replace(/^https?:\/\/(www\.)?vk\.com\//, '@'),
      href: externalHref(settings.vk),
      external: true,
    });
  }

  return links;
}
