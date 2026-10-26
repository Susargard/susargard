// Генерирует абстрактные демонстрационные изображения для локального просмотра.
// На публичном сайте демо-проекты скрыты (draft: true).
// Запуск: node scripts/generate-demo-art.mjs
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const rnd = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function painting({ w, h, bg, palette, seed, label = 'DEMO', mood = 'light' }) {
  const r = (n) => rnd(seed * 13 + n * 7.31);
  const blobs = Array.from({ length: 7 }, (_, i) => {
    const cx = (0.12 + r(i) * 0.76) * w;
    const cy = (0.1 + r(i + 20) * 0.8) * h;
    const rx = (0.1 + r(i + 40) * 0.34) * w;
    const ry = (0.08 + r(i + 60) * 0.3) * h;
    const color = palette[i % palette.length];
    const opacity = (0.28 + r(i + 80) * 0.42).toFixed(2);
    const rotate = (r(i + 100) * 44 - 22).toFixed(1);
    return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${color}" opacity="${opacity}" transform="rotate(${rotate} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
  }).join('\n');

  const strokes = Array.from({ length: 5 }, (_, i) => {
    const y = (0.18 + i * 0.16) * h;
    const amp = (0.02 + r(i + 200) * 0.08) * h;
    const x1 = (0.06 + r(i + 210) * 0.2) * w;
    const x2 = (0.7 + r(i + 220) * 0.24) * w;
    const c1 = x1 + (x2 - x1) * 0.33;
    const c2 = x1 + (x2 - x1) * 0.66;
    const ink = mood === 'dark' ? '#efe7d8' : '#2a2722';
    return `<path d="M${x1.toFixed(1)} ${y.toFixed(1)} C ${c1.toFixed(1)} ${(y - amp).toFixed(1)}, ${c2.toFixed(1)} ${(y + amp).toFixed(1)}, ${x2.toFixed(1)} ${(y - amp * 0.3).toFixed(1)}" fill="none" stroke="${ink}" stroke-opacity="${(0.18 + r(i + 230) * 0.2).toFixed(2)}" stroke-width="${(1.2 + r(i + 240) * 2.2).toFixed(1)}" stroke-linecap="round"/>`;
  }).join('\n');

  const motifSize = Math.min(w, h) * 0.18;
  const mx = w * 0.82;
  const my = h * 0.84;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer>
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="${(Math.min(w, h) / 900).toFixed(2)}"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <g filter="url(#soft)">${blobs}</g>
  ${strokes}
  <g transform="translate(${mx} ${my})" opacity="0.5">
    <circle r="${motifSize * 0.62}" fill="none" stroke="${palette[0]}" stroke-width="1.2"/>
    <path d="M0 ${-motifSize * 0.55} C ${motifSize * 0.3} ${-motifSize * 0.2}, ${motifSize * 0.18} ${motifSize * 0.22}, 0 ${motifSize * 0.55}" fill="none" stroke="${palette[0]}" stroke-width="1.2"/>
    <path d="M0 ${-motifSize * 0.55} C ${-motifSize * 0.3} ${-motifSize * 0.2}, ${-motifSize * 0.18} ${motifSize * 0.22}, 0 ${motifSize * 0.55}" fill="none" stroke="${palette[0]}" stroke-width="1.2"/>
  </g>
  <text x="${(w * 0.06).toFixed(1)}" y="${(h * 0.955).toFixed(1)}" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.max(11, w / 75)}" letter-spacing="${Math.max(3, w / 250)}" fill="${mood === 'dark' ? '#efe7d8' : '#2a2722'}" fill-opacity="0.45">${label}</text>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.55"/>
</svg>`;
}

async function renderSvg(relPath, svg) {
  const out = join(root, relPath);
  await mkdir(dirname(out), { recursive: true });
  await sharp(Buffer.from(svg)).webp({ quality: 84 }).toFile(out);
  console.log('✓', relPath);
}

const sets = {
  graphika: {
    seed: 3,
    bg: '#f2ece0',
    palette: ['#2b2823', '#9a6a4a', '#c8b79b', '#6f6659'],
    mood: 'light',
  },
  illustration: {
    seed: 31,
    bg: '#eeddd2',
    palette: ['#b45f45', '#7c8b6f', '#f5efe3', '#5e4a40'],
    mood: 'light',
  },
  restoration: {
    seed: 57,
    bg: '#e5e4d9',
    palette: ['#6e7b72', '#948a79', '#f2efe5', '#4f564f'],
    mood: 'light',
  },
};

for (const [slug, cfg] of Object.entries(sets)) {
  const dir = `src/content/projects/demo-${slug}`;
  await renderSvg(
    `${dir}/cover.webp`,
    painting({ w: 1200, h: 1500, bg: cfg.bg, palette: cfg.palette, seed: cfg.seed, mood: cfg.mood }),
  );
  await renderSvg(
    `${dir}/01.webp`,
    painting({ w: 1600, h: 1100, bg: cfg.bg, palette: cfg.palette, seed: cfg.seed + 5, mood: cfg.mood }),
  );
  await renderSvg(
    `${dir}/02.webp`,
    painting({ w: 1200, h: 1500, bg: cfg.bg, palette: cfg.palette, seed: cfg.seed + 9, mood: cfg.mood }),
  );
}

await renderSvg(
  'src/content/projects/demo-restoration/before.webp',
  painting({ w: 1600, h: 1100, bg: '#d9d5c7', palette: ['#948a79', '#b8b1a1', '#6f6a5e'], seed: 71, label: 'BEFORE', mood: 'light' }),
);
await renderSvg(
  'src/content/projects/demo-restoration/after.webp',
  painting({ w: 1600, h: 1100, bg: '#e5e4d9', palette: ['#6e7b72', '#f2efe5', '#7f8b7f'], seed: 73, label: 'AFTER', mood: 'light' }),
);

// Обложка для соцсетей
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f5f0e6"/>
  <circle cx="1020" cy="110" r="190" fill="#b46b4f" opacity="0.12"/>
  <circle cx="1080" cy="520" r="240" fill="#7c8b6f" opacity="0.14"/>
  <path d="M80 500 C 300 430, 500 540, 760 460 S 1080 500, 1140 450" fill="none" stroke="#26231f" stroke-opacity="0.16" stroke-width="2"/>
  <text x="80" y="190" font-family="Georgia, 'Times New Roman', serif" font-size="46" letter-spacing="8" fill="#26231f" fill-opacity="0.55">SUSARGARD</text>
  <text x="80" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="82" fill="#26231f">Арина Смирнова</text>
  <text x="80" y="370" font-family="Arial, sans-serif" font-size="28" letter-spacing="2" fill="#26231f" fill-opacity="0.65">графика · иллюстрация · реставрация</text>
  <text x="80" y="545" font-family="Arial, sans-serif" font-size="22" letter-spacing="4" fill="#26231f" fill-opacity="0.4">ПЯТИГОРСК</text>
</svg>`;
await renderSvg('public/images/site/og-default.webp', ogSvg);
await sharp(Buffer.from(ogSvg))
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(join(root, 'public/images/site/og-default.jpg'));
console.log('✓ public/images/site/og-default.jpg');

// Минимальный валидный PDF для демонстрации блока «Файлы»
const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 78 >> stream
BT /F1 24 Tf 72 760 Td (Susargard - demo document) Tj ET
BT /F1 12 Tf 72 720 Td (This PDF is a placeholder for the files block.) Tj ET
endstream endobj
trailer << /Root 1 0 R >>
%%EOF`;
const pdfPath = join(root, 'public/files/demo-restoration/opis-rabot.pdf');
await mkdir(dirname(pdfPath), { recursive: true });
await writeFile(pdfPath, pdf, 'utf8');
console.log('✓ public/files/demo-restoration/opis-rabot.pdf');

console.log('Готово.');
