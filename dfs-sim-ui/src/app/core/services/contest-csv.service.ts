import { Injectable } from '@angular/core';
import { CsvService } from './csv.service';
import { ContestStructure, PayoutBucket } from '../models/contest.model';

function parseNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(String(val).replace(/[$,%]/g, '').trim());
  return isNaN(num) ? null : num;
}

@Injectable({ providedIn: 'root' })
export class ContestCsvService {
  constructor(private csv: CsvService) {}

  async load(file: File | string = '/assets/dk_data/contest_structure.csv'): Promise<ContestStructure[]> {
    const rows = await this.csv.parse<Record<string, unknown>>(file);
    const grouped: Record<string, { entries: number[]; buckets: PayoutBucket[] }> = {};

    for (const r of rows) {
      const id = (r['contest_id'] ?? r['Contest'] ?? r['Name'] ?? '') as string;
      if (!id) continue;
      const entries = parseNumber(r['entries'] ?? r['Entries']);
      const from = parseNumber(r['place_from'] ?? r['from'] ?? r['PlaceFrom']);
      const to = parseNumber(r['place_to'] ?? r['to'] ?? r['PlaceTo']);
      const amount = parseNumber(r['amount'] ?? r['payout'] ?? r['Amount'] ?? r['Payout']);
      if (from == null || to == null || amount == null) continue;

      if (!grouped[id]) {
        grouped[id] = { entries: [], buckets: [] };
      }
      if (entries != null) grouped[id].entries.push(entries);
      grouped[id].buckets.push({ from, to, amount });
    }

    const contests: ContestStructure[] = [];
    for (const [id, data] of Object.entries(grouped)) {
      data.buckets.sort((a, b) => a.from - b.from);
      const entries = data.entries.length ? Math.max(...data.entries) : 0;
      const contest: ContestStructure = {
        id,
        entries,
        buckets: data.buckets,
        minCash: data.buckets[0]?.amount ?? null,
      };
      contests.push(contest);
    }
    return contests;
  }
}
