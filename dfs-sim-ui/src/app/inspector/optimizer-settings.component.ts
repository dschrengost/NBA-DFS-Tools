import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as Rules from '../state/rules';
import * as Builder from '../state/builder';
import { SegmentedComponent } from '../ui/controls/segmented/segmented.component';

@Component({
  selector: 'app-optimizer-settings',
  standalone: true,
  imports: [ReactiveFormsModule, SegmentedComponent],
  templateUrl: './optimizer-settings.component.html',
  styleUrls: ['./optimizer-settings.component.scss']
})
export class OptimizerSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  form = this.fb.group({
    minUniques: 1,
    maxPerTeam: null as number | null,
    stackType: 'none' as 'none' | 'team' | 'game',
    stackSize: null as number | null,
    lineupCount: 20,
    salaryMinUsed: 49500,
    correlation: 50,
    ownershipFade: 30,
    simDiversity: 50,
  });

  ngOnInit(): void {
    this.store.select(Rules.selectRules).subscribe(r => {
      this.form.patchValue({
        minUniques: r.minUniques,
        maxPerTeam: r.maxPerTeam ?? null,
        stackType: r.stackType ?? 'none',
        stackSize: r.stackSize ?? null,
      }, { emitEvent: false });
    });
    this.store.select(Builder.selectBuilder).subscribe(b => {
      this.form.patchValue({
        lineupCount: b.lineupCount,
        salaryMinUsed: b.salaryMinUsed,
        correlation: b.correlation,
        ownershipFade: b.ownershipFade,
        simDiversity: b.simDiversity,
      }, { emitEvent: false });
    });

    this.form.get('minUniques')!.valueChanges.subscribe(v =>
      this.store.dispatch(Rules.setMinUniques({ value: Number(v) }))
    );
    this.form.get('maxPerTeam')!.valueChanges.subscribe(v =>
      this.store.dispatch(Rules.setMaxPerTeam({ value: v == null ? null : Number(v) }))
    );
    this.form.get('stackType')!.valueChanges.subscribe(v =>
      this.store.dispatch(Rules.setStackType({ value: v as any }))
    );
    this.form.get('stackSize')!.valueChanges.subscribe(v =>
      this.store.dispatch(Rules.setStackSize({ value: v ? Number(v) : null }))
    );

    this.form.get('salaryMinUsed')!.valueChanges.subscribe(v =>
      this.store.dispatch(Builder.setSalaryMinUsed({ value: Number(v) }))
    );
    this.form.get('ownershipFade')!.valueChanges.subscribe(v =>
      this.store.dispatch(Builder.setOwnershipFade({ value: Number(v) }))
    );
    this.form.get('simDiversity')!.valueChanges.subscribe(v =>
      this.store.dispatch(Builder.setSimDiversity({ value: Number(v) }))
    );
  }
}
