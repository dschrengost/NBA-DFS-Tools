import { Injectable } from '@angular/core';
import { CsvService } from './csv.service';

function normalize(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

@Injectable({ providedIn: 'root' })
export class PlayerIdsCsvService {
  constructor(private csv: CsvService) {}

  async load(file: File | string = '/assets/dk_data/player_ids.csv'): Promise<Record<string, string>> {
    const rows = await this.csv.parse<Record<string, unknown>>(file);
    const map: Record<string, string> = {};
    for (const r of rows) {
      const name = (r['name'] ?? r['Name'] ?? r['player'] ?? r['Player'] ?? '') as string;
      const id = (r['id'] ?? r['ID'] ?? r['dk_id'] ?? r['DKID'] ?? r['player_id'] ?? '') as string;
      if (!name || !id) continue;
      map[normalize(name)] = id.toString();
    }
    return map;
  }
}
