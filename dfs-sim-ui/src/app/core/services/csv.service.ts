import { Injectable } from '@angular/core';
import Papa from 'papaparse';

type ParseResult<T> = { data: T[] };

@Injectable({ providedIn: 'root' })
export class CsvService {
  parse<T>(input: File | string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(input, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result: ParseResult<T>) => resolve(result.data as T[]),
        error: (err: unknown) => reject(err as Error)
      });
    });
  }
}
