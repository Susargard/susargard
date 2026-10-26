export function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function worksLabel(count: number): string {
  return `${count} ${plural(count, 'работа', 'работы', 'работ')}`;
}

export function imagesLabel(count: number): string {
  return `${count} ${plural(count, 'изображение', 'изображения', 'изображений')}`;
}

export function documentsLabel(count: number): string {
  return `${count} ${plural(count, 'документ', 'документа', 'документов')}`;
}
