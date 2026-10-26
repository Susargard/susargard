import type { ImageMetadata } from 'astro';

export type ThemePreset = 'paper' | 'sage' | 'terracotta' | 'ink' | 'stone' | 'clay';

export interface ThemeDecor {
  image?: ImageMetadata;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: number;
  opacity: number;
}

export interface Theme {
  preset?: ThemePreset;
  background?: {
    color?: string;
    image?: ImageMetadata;
  };
  overlay?: number;
  text?: 'auto' | 'light' | 'dark';
  accent?: string;
  decor?: ThemeDecor;
}

export interface ResolvedTheme {
  preset: ThemePreset;
  tone: 'light' | 'dark';
  backgroundImage?: ImageMetadata;
  overlay: number;
  decor?: ThemeDecor;
  style: string;
}

interface Palette {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  line: string;
  surface: string;
}

const palettes: Record<ThemePreset, Palette> = {
  paper: {
    bg: '#f5f0e6',
    fg: '#26231f',
    muted: '#6f675b',
    accent: '#a65c3f',
    line: 'rgba(38, 35, 31, 0.14)',
    surface: 'rgba(255, 255, 255, 0.34)',
  },
  sage: {
    bg: '#e7eae0',
    fg: '#232a24',
    muted: '#5f695d',
    accent: '#5f705b',
    line: 'rgba(35, 42, 36, 0.15)',
    surface: 'rgba(255, 255, 255, 0.28)',
  },
  terracotta: {
    bg: '#f0e1d6',
    fg: '#32231c',
    muted: '#7a5f52',
    accent: '#a9503a',
    line: 'rgba(50, 35, 28, 0.15)',
    surface: 'rgba(255, 255, 255, 0.3)',
  },
  stone: {
    bg: '#e6e3d9',
    fg: '#2a2925',
    muted: '#6a665c',
    accent: '#6d735f',
    line: 'rgba(42, 41, 37, 0.15)',
    surface: 'rgba(255, 255, 255, 0.26)',
  },
  clay: {
    bg: '#efe4d8',
    fg: '#32241d',
    muted: '#7b6052',
    accent: '#b06a4b',
    line: 'rgba(50, 36, 29, 0.15)',
    surface: 'rgba(255, 255, 255, 0.3)',
  },
  ink: {
    bg: '#23211d',
    fg: '#f4eee2',
    muted: '#b8ae9e',
    accent: '#d9a06b',
    line: 'rgba(244, 238, 226, 0.18)',
    surface: 'rgba(255, 255, 255, 0.06)',
  },
};

function normalizeHex(hex: string): string | null {
  const value = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return null;
}

function luminance(hex: string): number {
  const normalized = normalizeHex(hex);
  if (!normalized) return 0.9;
  const channels = [1, 3, 5].map((offset) => parseInt(normalized.slice(offset, offset + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastPair(hex: string) {
  const light = luminance(hex) > 0.5;
  return light
    ? {
        fg: '#26231f',
        muted: '#665f54',
        line: 'rgba(38, 35, 31, 0.16)',
        surface: 'rgba(255, 255, 255, 0.34)',
        tone: 'dark' as const,
      }
    : {
        fg: '#f4eee2',
        muted: '#c3b9a8',
        line: 'rgba(244, 238, 226, 0.2)',
        surface: 'rgba(255, 255, 255, 0.07)',
        tone: 'light' as const,
      };
}

export function resolveTheme(theme?: Theme, fallback: ThemePreset = 'paper'): ResolvedTheme {
  const preset = theme?.preset ?? fallback;
  const palette = { ...palettes[preset] };
  const customBg = theme?.background?.color;
  const backgroundImage = theme?.background?.image;

  // Если задан свой цвет — подбираем читаемый текст. Если только картинка —
  // оставляем палитру пресета, поверх неё работает затемнение.
  if (customBg) {
    const pair = contrastPair(customBg);
    palette.bg = customBg;
    palette.fg = pair.fg;
    palette.muted = pair.muted;
    palette.line = pair.line;
    palette.surface = pair.surface;
  }

  if (theme?.text === 'light') {
    palette.fg = '#f7f2e8';
    palette.muted = '#cec4b4';
    palette.line = 'rgba(247, 242, 232, 0.22)';
    palette.surface = 'rgba(255, 255, 255, 0.08)';
  } else if (theme?.text === 'dark') {
    palette.fg = '#26231f';
    palette.muted = '#665f54';
    palette.line = 'rgba(38, 35, 31, 0.16)';
    palette.surface = 'rgba(255, 255, 255, 0.34)';
  }

  if (theme?.accent) {
    const accent = normalizeHex(theme.accent);
    if (accent) palette.accent = accent;
  }

  const tone: 'light' | 'dark' =
    theme?.text === 'light' ? 'light' : theme?.text === 'dark' ? 'dark' : customBg ? contrastPair(customBg).tone : preset === 'ink' ? 'light' : 'dark';

  const overlay = Math.min(90, Math.max(0, theme?.overlay ?? (backgroundImage ? 28 : 0)));

  const style = [
    `--theme-bg:${palette.bg}`,
    `--theme-fg:${palette.fg}`,
    `--theme-muted:${palette.muted}`,
    `--theme-accent:${palette.accent}`,
    `--theme-line:${palette.line}`,
    `--theme-surface:${palette.surface}`,
    `--theme-overlay:${overlay / 100}`,
    `--theme-tone:${tone}`,
  ].join(';');

  return {
    preset,
    tone,
    backgroundImage,
    overlay,
    decor: theme?.decor,
    style,
  };
}

export const themePresetLabels: Record<ThemePreset, string> = {
  paper: 'Бумага',
  sage: 'Шалфей',
  terracotta: 'Терракота',
  stone: 'Камень',
  clay: 'Глина',
  ink: 'Тёмная',
};
