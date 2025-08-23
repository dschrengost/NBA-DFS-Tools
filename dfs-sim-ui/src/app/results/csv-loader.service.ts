import { Injectable, signal } from '@angular/core';
import Papa from 'papaparse';
import { Dataset, DatasetMeta, ColumnSpec } from './types';
import { computeChecksum, schemaSignature, sniffDelimiter, detectHeaders, inferFileType } from './csv-utils';

@Injectable({ providedIn: 'root' })
export class CsvLoaderService {
  readonly loading = signal(false);
  readonly progress = signal(0);

  async loadLocalFile(file: File): Promise<Dataset> {
    const text = await file.text();
    return this.parseCsv(text, file.name);
  }

  async loadHttpUrl(url: string): Promise<Dataset> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    const text = await res.text();
    return this.parseCsv(text, url);
  }

  private parseCsv(text: string, filename: string): Dataset {
    const delimiter = sniffDelimiter(text);
    const headerRes = detectHeaders(text, delimiter);
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, delimiter });
    const rows = parsed.data as any[];
    const headers = headerRes.headers;
    const columns: ColumnSpec[] = headers.map(h => ({ field: h, headerName: h }));
    const checksum = computeChecksum(text);
    const schemaSig = schemaSignature(headers);
    const meta: DatasetMeta = {
      filename,
      rowCount: rows.length,
      checksum,
      schemaSignature: schemaSig,
      fileType: inferFileType(headers, filename)
    };
    return { rows, columns, meta };
  }
}
