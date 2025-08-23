import { ColumnSpec } from '../types';

export interface ReferenceRow {
  player_id: string;
  name: string;
  team: string;
  pos: string;
}

export function buildReferenceMap(refRows: ReferenceRow[]): Record<string, ReferenceRow> {
  const map: Record<string, ReferenceRow> = {};
  for (const r of refRows) {
    map[r.player_id] = r;
  }
  return map;
}

export function enrichRows(rows: any[], ref: Record<string, ReferenceRow>): any[] {
  return rows.map(r => {
    const found = ref[r.player_id];
    return found ? { ...r, name: found.name, team: found.team, pos: found.pos } : r;
  });
}

export function mergeColumns(cols: ColumnSpec[]): ColumnSpec[] {
  return [
    ...cols,
    { field: 'name', headerName: 'Name' },
    { field: 'team', headerName: 'Team' },
    { field: 'pos', headerName: 'Pos' }
  ];
}
