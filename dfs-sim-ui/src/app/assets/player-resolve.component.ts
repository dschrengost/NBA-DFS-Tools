import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetsService } from './assets.service';

@Component({
  selector: 'app-player-resolve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="pending.length">
      <div *ngFor="let p of pending">
        <label>{{p.player_name}}
          <select [(ngModel)]="selections[p.row_index]">
            <option [ngValue]="undefined">--</option>
            <option *ngFor="let c of p.candidates" [ngValue]="c.player_id">{{c.player_name}} ({{c.team}})</option>
          </select>
        </label>
      </div>
      <button type="button" (click)="commit()">Commit</button>
      <pre *ngIf="result">{{result | json}}</pre>
    </div>
  `,
})
export class PlayerResolveComponent {
  @Input() filePath!: string;
  @Input() mapping!: Record<string, string>;
  @Input() pending: any[] = [];
  selections: Record<number, string> = {};
  result: any;

  constructor(private service: AssetsService) {}

  commit(): void {
    this.service
      .commit(this.filePath, this.mapping, this.selections)
      .subscribe((res) => (this.result = res));
  }
}
