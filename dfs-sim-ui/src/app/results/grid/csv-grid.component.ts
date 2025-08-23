import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { DatasetMeta } from '../types';

@Component({
  selector: 'app-csv-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="grid-wrapper">
      <ag-grid-angular
        #agGrid
        class="ag-theme-alpine"
        [rowData]="rows"
        [columnDefs]="columnDefs"
        (gridReady)="onGridReady($event)"
        rowHeight="32">
      </ag-grid-angular>
    </div>
  `,
  styles: [`
    .grid-wrapper { height: 100%; width: 100%; }
    ag-grid-angular { height: 100%; width: 100%; }
  `]
})
export class CsvGridComponent implements AfterViewInit {
  @Input() rows: any[] = [];
  @Input() columnDefs: ColDef[] = [];
  @Input() meta?: DatasetMeta;
  @ViewChild('agGrid') agGrid?: AgGridAngular;

  ngAfterViewInit(): void {
    this.restoreState();
  }

  onGridReady(evt: GridReadyEvent) {
    this.restoreState();
  }

  saveState(): void {
    if (!this.meta || !this.agGrid) return;
    const state = this.agGrid.api.getColumnState();
    localStorage.setItem(this.storageKey(), JSON.stringify(state));
  }

  restoreState(): void {
    if (!this.meta || !this.agGrid) return;
    const stateStr = localStorage.getItem(this.storageKey());
    if (stateStr) {
      const state = JSON.parse(stateStr);
      this.agGrid.api.applyColumnState({ state, applyOrder: true });
    }
  }

  export(): void {
    this.agGrid?.api.exportDataAsCsv();
  }

  private storageKey(): string {
    return `csv-view-${this.meta!.checksum}-${this.meta!.schemaSignature}`;
  }
}
