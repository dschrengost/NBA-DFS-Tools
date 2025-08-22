import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { AssetsService } from './assets.service';

@Component({
  selector: 'app-assets-list',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="toolbar">
      <button type="button" (click)="scan()">Scan</button>
      <button type="button" (click)="normalize()" [disabled]="!selected">Normalize Projections</button>
      <button type="button" (click)="openSnapshot()">Open Snapshot Folder</button>
    </div>
    <ag-grid-angular
      style="width:100%;height:400px;"
      class="ag-theme-alpine"
      [rowData]="service.assets()"
      [columnDefs]="columnDefs"
      rowSelection="single"
      (selectionChanged)="onSelection($event)"
    ></ag-grid-angular>
  `,
  styles: [
    `.toolbar { display:flex; gap:8px; margin-bottom:8px; }`
  ]
})
export class AssetsListComponent implements OnInit {
  columnDefs: ColDef[] = [
    { headerName: 'name', field: 'path', flex: 1 },
    { headerName: 'size', field: 'size', width: 100 },
    { headerName: 'modified', field: 'mtime', width: 120 },
    { headerName: 'type', field: 'typeGuess', width: 140 },
    { headerName: 'checksum', field: 'checksum', hide: true }
  ];
  selected: any;

  constructor(public service: AssetsService) {}

  ngOnInit(): void {
    this.scan();
  }

  scan(): void {
    this.service.load();
  }

  onSelection(event: any) {
    this.selected = event.api.getSelectedRows()[0];
  }

  normalize() {
    if (this.selected) {
      console.log('normalize', this.selected);
    }
  }

  openSnapshot() {
    console.log('open snapshot');
  }
}
