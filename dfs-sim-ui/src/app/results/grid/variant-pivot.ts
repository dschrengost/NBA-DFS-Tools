import { ColumnSpec } from '../types';

export interface PivotResult {
  rows: any[];
  columns: ColumnSpec[];
}

export function pivotVariants(rows: any[]): PivotResult {
  const grouped: Record<string, any[]> = {};
  for (const row of rows) {
    const id = row.lineup_id;
    if (!grouped[id]) grouped[id] = [];
    grouped[id].push(row);
  }
  const output: any[] = [];
  let maxPlayers = 0;
  for (const id of Object.keys(grouped)) {
    const players = grouped[id];
    players.sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));
    maxPlayers = Math.max(maxPlayers, players.length);
    const row: any = { lineup_id: id };
    players.forEach((p, idx) => {
      row[`P${idx + 1}`] = p.player_id;
    });
    output.push(row);
  }
  const columns: ColumnSpec[] = [{ field: 'lineup_id', headerName: 'Lineup' }];
  for (let i = 0; i < maxPlayers; i++) {
    columns.push({ field: `P${i + 1}`, headerName: `P${i + 1}` });
  }
  return { rows: output, columns };
}
