import { formatDimensions, formatMm } from '../units';
import type { Placement } from '../../types/domain';
import type { ExportLayoutOptions } from './contracts';
import { downloadBlob, downloadText, safeFilename } from './browser-download';

const PALETTE = [
  ['#f4d7bd', '#8b5a32'],
  ['#dce9df', '#496858'],
  ['#e8dded', '#695474'],
  ['#f5e9b9', '#796921'],
  ['#d8e6ef', '#486878'],
  ['#ecd8d4', '#7f5149'],
] as const;

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character] ?? character);
}

function labelFor(options: ExportLayoutOptions, placement: Placement): string {
  const definition = options.project.items.find((item) => item.id === placement.definitionId);
  if (!definition) return placement.instanceId;
  const ordinal = Number(placement.instanceId.split('__').at(-1));
  return definition.quantity > 1 && Number.isFinite(ordinal) ? `${definition.label} ${ordinal}` : definition.label;
}

export function buildLayoutSvg(options: ExportLayoutOptions): string {
  const { project, snapshot } = options;
  const space = project.space;
  const padding = Math.max(80, Math.min(space.widthMm, space.heightMm) * 0.18);
  const footerHeight = Math.max(160, space.heightMm * 0.28);
  const viewWidth = space.widthMm + padding * 2;
  const viewHeight = space.heightMm + padding * 2 + footerHeight;
  const fontSize = Math.max(16, Math.min(34, Math.min(space.widthMm, space.heightMm) * 0.045));
  const itemIndex = new Map(project.items.map((item, index) => [item.id, index]));
  const itemMarkup = snapshot.placements.map((placement) => {
    const palette = PALETTE[(itemIndex.get(placement.definitionId) ?? 0) % PALETTE.length] ?? PALETTE[0];
    const label = escapeXml(labelFor(options, placement));
    const size = escapeXml(`${formatMm(placement.widthMm, project.displayUnit)} × ${formatMm(placement.heightMm, project.displayUnit)}${placement.orientation === 'base-rotated' ? ' rotated' : ''}`);
    return `<g transform="translate(${placement.xMm} ${placement.yMm})"><rect width="${placement.widthMm}" height="${placement.heightMm}" rx="${Math.min(14, placement.widthMm * .05, placement.heightMm * .12)}" fill="${palette[0]}" stroke="${palette[1]}" stroke-width="3"/><text x="${placement.widthMm / 2}" y="${placement.heightMm / 2 - fontSize * .1}" text-anchor="middle" dominant-baseline="middle" font-size="${Math.min(fontSize, Math.max(10, placement.widthMm / 10))}" font-weight="700" fill="#17241f">${label}</text><text x="${placement.widthMm / 2}" y="${placement.heightMm / 2 + fontSize * .8}" text-anchor="middle" dominant-baseline="middle" font-size="${Math.min(fontSize * .62, Math.max(8, placement.widthMm / 14))}" fill="#41554d">${size}</text></g>`;
  }).join('');
  const unplaced = options.unplacedLabels.length ? escapeXml(`Not placed: ${options.unplacedLabels.join(', ')}`) : 'All requested objects are represented in this layout.';
  const title = escapeXml(project.name || 'ShelfSketch project');
  const subtitle = escapeXml(`${options.mode.replace('-', ' ')} layout · ${options.placedCount}/${options.requestedCount} placed · ${options.utilizationPercent}% front area used`);
  const dimensions = escapeXml(`Space: ${formatDimensions(space.widthMm, space.heightMm, space.depthMm, project.displayUnit)}`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${Math.round(1600 * viewHeight / viewWidth)}" viewBox="${-padding} ${-padding} ${viewWidth} ${viewHeight}" role="img" aria-labelledby="title desc"><title id="title">${title} layout</title><desc id="desc">${subtitle}. ${unplaced}</desc><rect x="${-padding}" y="${-padding}" width="${viewWidth}" height="${viewHeight}" fill="#fbfaf6"/><text x="0" y="${-padding * .55}" font-family="system-ui, sans-serif" font-size="${fontSize * 1.25}" font-weight="800" fill="#17241f">${title}</text><text x="0" y="${-padding * .15}" font-family="system-ui, sans-serif" font-size="${fontSize * .7}" fill="#41554d">${subtitle}</text><rect x="0" y="0" width="${space.widthMm}" height="${space.heightMm}" rx="${Math.min(18, space.widthMm * .02)}" fill="#fffdf8" stroke="#22352f" stroke-width="5"/>${itemMarkup}<text x="0" y="${space.heightMm + padding * .58}" font-family="system-ui, sans-serif" font-size="${fontSize * .72}" font-weight="700" fill="#17241f">${dimensions}</text><text x="0" y="${space.heightMm + padding * .98}" font-family="system-ui, sans-serif" font-size="${fontSize * .62}" fill="#41554d">${unplaced}</text><text x="0" y="${space.heightMm + padding * 1.42}" font-family="system-ui, sans-serif" font-size="${fontSize * .54}" fill="#53665f">ShelfSketch is a planning aid. Verify all physical measurements before purchasing or installing anything.</text></svg>`;
}

export function downloadLayoutSvg(options: ExportLayoutOptions): void {
  downloadText(buildLayoutSvg(options), `${safeFilename(options.project.name)}-${options.mode}.svg`, 'image/svg+xml;charset=utf-8');
}

export async function downloadLayoutPng(options: ExportLayoutOptions): Promise<void> {
  const svg = buildLayoutSvg(options);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = 'async';
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The SVG preview could not be rendered.'));
    });
    image.src = url;
    await loaded;
    const maxWidth = 2000;
    const scale = Math.min(1, maxWidth / Math.max(1, image.naturalWidth));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('PNG export is not supported by this browser.');
    context.fillStyle = '#fbfaf6';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pngBlob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('The browser could not create a PNG file.')), 'image/png', .95));
    downloadBlob(pngBlob, `${safeFilename(options.project.name)}-${options.mode}.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
