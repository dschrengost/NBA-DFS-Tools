import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-segmented',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="segmented">
      <button *ngFor="let opt of options" type="button" (click)="select(opt)" [class.active]="opt===value">{{opt}}</button>
    </div>
  `,
  styles: [`
    .segmented { display: flex; gap: 4px; }
    .segmented button { flex: 1; padding: 6px 8px; border: 1px solid var(--border); background: var(--panel); color: var(--text); cursor: pointer; }
    .segmented button.active { background: var(--muted); }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SegmentedComponent),
    multi: true,
  }]
})
export class SegmentedComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  value: any;
  private onChange: any = () => {};
  private onTouched: any = () => {};

  select(opt: any) {
    this.value = opt;
    this.onChange(opt);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
