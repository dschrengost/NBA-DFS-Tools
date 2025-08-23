import { DatasetMeta } from "./types";
export function sniffDelimiter(sample: string): string {
  const candidates = [',', '\t', ';', '|'];
  const counts = candidates.map(d => ({ d, c: (sample.split(d).length - 1) }));
  counts.sort((a, b) => b.c - a.c);
  return counts[0].d;
}

export function computeChecksum(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function schemaSignature(headers: string[]): string {
  return headers.join('|');
}

export function inferFileType(headers: string[], filename = ''): DatasetMeta['fileType'] {
  const lower = filename.toLowerCase();
  if (headers.includes('lineup_id') && headers.includes('player_id')) {
    return 'variants';
  }
  if (headers.includes('fpts') && headers.includes('salary')) {
    return 'projections';
  }
  if (lower.includes('optimizer')) {
    return 'optimizer';
  }
  return 'unknown';
}

export interface HeaderResult {
  headers: string[];
}

export function detectHeaders(text: string, delimiter: string): HeaderResult {
  const firstLine = text.split(/\r?\n/)[0];
  const headers = firstLine.split(delimiter).map(h => h.trim());
  return { headers };
}
