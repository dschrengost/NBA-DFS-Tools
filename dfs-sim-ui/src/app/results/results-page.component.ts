import { Component, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsvLoaderService } from './csv-loader.service';
import { CsvGridComponent } from './grid/csv-grid.component';
import { ColumnSpec, DatasetMeta } from './types';
import { pivotVariants } from './grid/variant-pivot';
import { buildReferenceMap, enrichRows, mergeColumns } from './grid/enrich-join';

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [CommonModule, CsvGridComponent],
  templateUrl: './results-page.component.html',
  styleUrls: ['./results-page.component.scss']
})
export class ResultsPageComponent {
  rows = signal<any[]>([]);
  columns = signal<ColumnSpec[]>([]);
  meta = signal<DatasetMeta | null>(null);
  view = signal<'raw' | 'pivot'>('raw');
  error = signal<string | null>(null);
  warning = signal<string | null>(null);
  stats = signal<{ count: number; meanFpts: number; medianFpts: number; meanOwn: number; minSalary: number; maxSalary: number } | null>(null);
  private rawRows: any[] = [];
  private rawCols: ColumnSpec[] = [];
  @ViewChild(CsvGridComponent) grid?: CsvGridComponent;

  canPivot = computed(() => this.meta()?.fileType === 'variants');

  constructor(private loader: CsvLoaderService) {}

  async onFileSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;
    await this.loadDataset(file);
  }

  async onUrlLoad(input: HTMLInputElement) {
    if (!input.value) return;
    try {
      const data = await this.loader.loadHttpUrl(input.value);
      this.applyDataset(data.rows, data.columns, data.meta);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load URL');
    }
  }

  private async loadDataset(file: File) {
    try {
      const data = await this.loader.loadLocalFile(file);
      this.applyDataset(data.rows, data.columns, data.meta);
      if (data.meta.rowCount > 100000) {
        this.warning.set('Large file may impact performance.');
      } else {
        this.warning.set(null);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load file');
    }
  }

  private applyDataset(rows: any[], cols: ColumnSpec[], meta: DatasetMeta) {
    this.rawRows = rows;
    this.rawCols = cols;
    this.rows.set(rows);
    this.columns.set(cols);
    this.meta.set(meta);
    this.view.set('raw');
    this.computeStats();
  }

  togglePivot() {
    if (this.view() === 'pivot') {
      this.rows.set(this.rawRows);
      this.columns.set(this.rawCols);
      this.view.set('raw');
    } else if (this.canPivot()) {
      const pivoted = pivotVariants(this.rawRows);
      this.rows.set(pivoted.rows);
      this.columns.set(pivoted.columns);
      this.view.set('pivot');
    }
  }

  async onReferenceSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const ref = await this.loader.loadLocalFile(file);
    const map = buildReferenceMap(ref.rows as any);
    const joined = enrichRows(this.rawRows, map);
    this.rawRows = joined;
    this.rows.set(joined);
    this.rawCols = mergeColumns(this.rawCols);
    this.columns.set(this.rawCols);
    this.computeStats();
  }

  exportCsv() {
    this.grid?.export();
  }

  saveView() {
    this.grid?.saveState();
  }

  private computeStats() {
    if (this.meta()?.fileType !== 'projections') {
      this.stats.set(null);
      return;
    }
    const rows = this.rawRows;
    const count = rows.length;
    const fpts = rows.map((r: any) => Number(r.fpts) || 0).sort((a, b) => a - b);
    const ownVals = rows.map((r: any) => Number(r.own) || 0);
    const salaryVals = rows.map((r: any) => Number(r.salary) || 0);
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    const median = (arr: number[]) => arr[Math.floor(arr.length / 2)] || 0;
    this.stats.set({
      count,
      meanFpts: mean(fpts),
      medianFpts: median(fpts),
      meanOwn: mean(ownVals),
      minSalary: Math.min(...salaryVals),
      maxSalary: Math.max(...salaryVals)
    });
  }
}
