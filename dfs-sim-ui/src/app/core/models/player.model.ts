export type PlayerPosition =
  | 'PG'
  | 'SG'
  | 'SF'
  | 'PF'
  | 'C'
  | 'G'
  | 'F'
  | 'UTIL';

export interface Player {
  id: string;
  name: string;
  positions: PlayerPosition[];
  team: string;
  salary: number;
  minutes?: number | null;
  fpts?: number | null;
  ownership?: number | null;
  stddev?: number | null;
  fieldFpts?: number | null;
}
