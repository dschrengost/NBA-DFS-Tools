import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-snapshot-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="rows.length">
      <h3>Snapshot Preview</h3>
      <pre>{{ rows | json }}</pre>
      <p *ngIf="counts">Total: {{counts.total}} Matched: {{counts.matched}} Ambiguous: {{counts.ambiguous}} Unmatched: {{counts.unmatched}}</p>
    </div>
  `,
})
export class SnapshotPreviewComponent implements OnInit {
  @Input() path!: string;
  @Input() counts: any;
  rows: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    if (!this.path) return;
    this.http.get(this.path, { responseType: 'text' }).subscribe((text) => {
      this.rows = text.split('\n').slice(0, 6);
    });
  }
}
