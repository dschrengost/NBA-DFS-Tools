import { Injectable } from '@angular/core';
import { CsvService } from './csv.service';
import { Player, PlayerPosition } from '../models/player.model';
import { PlayerIdsCsvService } from './player-ids-csv.service';

const POSITIONS: PlayerPosition[] = ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL'];

function parseNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(String(val).replace(/[$,%]/g, ''));
  return isNaN(num) ? null : num;
}

function parsePositions(raw: unknown): PlayerPosition[] {
  if (!raw) return [];
  const parts = String(raw)
    .split(/[/,]/)
    .map(p => p.trim().toUpperCase())
    .filter(p => POSITIONS.includes(p as PlayerPosition));
  return Array.from(new Set(parts)) as PlayerPosition[];
}

@Injectable({ providedIn: 'root' })
export class PlayerCsvService {
  constructor(private csv: CsvService, private ids: PlayerIdsCsvService) {}

  async parse(file: File | string = '/assets/dk_data/projections.csv'): Promise<Player[]> {
    const [rows, idMap] = await Promise.all([
      this.csv.parse<Record<string, unknown>>(file),
      this.ids.load(),
    ]);

    const players: Player[] = [];
    for (const r of rows) {
      const name = (r['Name'] ?? r['name'] ?? '') as string;
      const positions = parsePositions(r['Position'] ?? r['position']);
      const team = (r['Team'] ?? r['team'] ?? '') as string;
      const salary = parseNumber(r['Salary'] ?? r['salary']);
      if (!name || !team || !salary || !positions.length) continue;

      const player: Player = {
        id: (r['ID'] ?? r['id'] ?? '').toString(),
        name,
        positions,
        team,
        salary,
        minutes: parseNumber(r['Minutes']) ?? null,
        fpts: parseNumber(r['Fpts']) ?? null,
        ownership: (() => {
          const own = parseNumber(r['own%'] ?? r['Ownership']);
          if (own == null) return null;
          return own > 1 ? own / 100 : own;
        })(),
        stddev: parseNumber(r['stddev']) ?? null,
        fieldFpts: parseNumber(r['fieldFpts']) ?? null,
      };

      if (!player.id) {
        const key = name.toLowerCase().trim().replace(/\s+/g, ' ');
        const id = idMap[key];
        if (id) player.id = id;
      }

      players.push(player);
    }

    return players;
  }
}
