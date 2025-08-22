import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Asset {
  path: string;
  size: number;
  mtime: number;
  typeGuess: string;
  checksum: string;
}

@Injectable({ providedIn: 'root' })
export class AssetsService {
  readonly assets = signal<Asset[]>([]);

  constructor(private http: HttpClient) {}

  /** Load assets from backend and cache in a signal. */
  load(root: string = 'dk_data'): void {
    this.http.get<Asset[]>(`/assets?root=${root}`).subscribe((data) => this.assets.set(data));
  }

  /** Request mapping preview or suggestions from backend. */
  normalizePreview(file_path: string, source_name?: string, mapping?: Record<string, string>) {
    return this.http.post<any>('/normalize/projections', { file_path, source_name, mapping });
  }

  /** Commit a normalized snapshot. */
  commit(
    file_path: string,
    mapping: Record<string, string>,
    player_resolutions?: Record<number, string>,
    source_name?: string,
  ) {
    return this.http.post<any>('/normalize/projections/commit', {
      file_path,
      mapping,
      player_resolutions,
      source_name,
    });
  }

  getMappings(root: string = 'dk_data') {
    return this.http.get<any[]>(`/mappings?root=${root}`);
  }

  saveMapping(profile: any, root: string = 'dk_data') {
    return this.http.post(`/mappings?root=${root}`, profile);
  }

  getPlayers(root: string = 'dk_data') {
    return this.http.get<any[]>(`/players/dk?root=${root}`);
  }
}

