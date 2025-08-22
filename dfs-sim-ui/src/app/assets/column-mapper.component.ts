import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetsService } from './assets.service';

const CANONICAL = [
  'player_id',
  'player_name',
  'team',
  'positions',
  'salary',
  'fpts',
  'ceil',
  'floor',
  'own',
];

@Component({
  selector: 'app-column-mapper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="needsMapping(); else preview">
      <div *ngFor="let h of headers">
        <label>{{h}}
          <select [(ngModel)]="mapping[h]">
            <option value=""></option>
            <option *ngFor="let c of canonical" [value]="c">{{c}}</option>
          </select>
        </label>
      </div>
      <button type="button" (click)="apply()">Apply Mapping</button>
    </div>
    <ng-template #preview>
      <pre>{{previewRows() | json}}</pre>
    </ng-template>
  `,
})
export class ColumnMapperComponent implements OnInit {
  @Input() filePath!: string;
  headers: string[] = [];
  mapping: Record<string, string> = {};
  canonical = CANONICAL;
  needsMapping = signal(true);
  previewRows = signal<any[]>([]);

  constructor(private service: AssetsService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.service.normalizePreview(this.filePath).subscribe((res) => {
      this.mapping = { ...(res.suggested_mapping || {}) };
      this.headers = Object.keys(res.suggested_mapping || {});
      this.previewRows.set(res.preview_rows || []);
      this.needsMapping.set(res.needs_mapping);
    });
  }

  apply(): void {
    this.service
      .normalizePreview(this.filePath, undefined, this.mapping)
      .subscribe((res) => {
        this.previewRows.set(res.preview_rows || []);
        this.needsMapping.set(res.needs_mapping);
      });
  }
}
