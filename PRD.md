PRD: Optimizer Settings — Interactive Controls + NgRx Wiring (UI‑only)

***TASK 4***


Goal
Replace the Optimizer right‑rail placeholders with real Angular form controls (lineup rules, salary min/max, ownership caps, exposures sliders). Wire them to a new NgRx builder + rules slices so changes update app state immediately. No backend calls yet.
Scope
Page: Optimizer (existing routed page).
Panel: Right‑rail “Optimizer Settings”.
Add Angular Reactive Forms.
Add NgRx slices for rules and builder.
Dispatch actions on change; reflect state in the UI.
Use global SCSS tokens (dark theme, system font).
Packages (if not already installed)
npm i @ngrx/store @ngrx/effects @ngrx/entity @ngrx/router-store
(Reactive Forms is built‑in: import { ReactiveFormsModule } from '@angular/forms';)
State design
rules slice (NBA lineups)
export interface RulesState {
  minUniques: number;          // 1–3
  maxPerTeam?: number | null;  // null = unlimited
  stackType?: 'none'|'team'|'game';
  stackSize?: number | null;   // e.g., 2 or 3 if enabled
}

export const initialRules: RulesState = {
  minUniques: 1,
  maxPerTeam: null,
  stackType: 'none',
  stackSize: null,
};
Actions
setMinUniques({ value: number })
setMaxPerTeam({ value: number|null })
setStackType({ value: RulesState['stackType'] })
setStackSize({ value: number|null })
builder slice (optimizer knobs)
export interface BuilderState {
  lineupCount: number;        // 1–150
  salaryMinUsed: number;      // 0..50000 (DK)
  correlation: number;        // 0..100
  ownershipFade: number;      // 0..100
  simDiversity: number;       // 0..100
}

export const initialBuilder: BuilderState = {
  lineupCount: 20,
  salaryMinUsed: 49500,
  correlation: 50,
  ownershipFade: 30,
  simDiversity: 50,
};
Actions
setLineupCount({ value: number })
setSalaryMinUsed({ value: number })
setCorrelation({ value: number })
setOwnershipFade({ value: number })
setSimDiversity({ value: number })
Effects: none in this PRD (UI‑only). If a slice or root store isn’t set up yet, create AppStoreModule and register these reducers.
UI requirements (right rail)
Use Reactive Forms and live‑sync with store:
Section: Lineup Rules
Min uniques (segmented control: 1 / 2 / 3)
Max players per team (number input, allow empty = unlimited)
Stacking (select: None, Team, Game)
Stack size (number input, disabled if stacking=None)
Section: Salary min/max
Min salary used (range input 47000–50000 + number input linked)
Section: Ownership caps
Ownership fade (0–100 range)
(caps by player later; for now just the global fade slider)
Section: Randomness
Randomness (0–100 range)
(per‑player targets later)
Behavior
Each control updates store immediately on change.
Controls read initial values from selectors (store → form patch).
Use tokens (--panel, --muted, --text, etc.) for styling.
Add helper microcopy under labels (muted).
Component & file structure
src/app/features/optimizer/
  optimizer.page.ts            // existing
  optimizer.page.html
  optimizer.page.scss

src/app/state/
  builder/
    builder.actions.ts
    builder.reducer.ts
    builder.selectors.ts
  rules/
    rules.actions.ts
    rules.reducer.ts
    rules.selectors.ts

src/app/ui/controls/
  segmented/segmented.component.ts   // tiny headless segmented control
If you prefer: embed segmented control inline in the page for now.
Template sketch (right rail)
optimizer.page.html (right rail section only)
<aside class="inspector">
  <form [formGroup]="form" class="settings">

    <!-- Lineup Rules -->
    <section>
      <h3>Lineup rules</h3>

      <label>Min uniques</label>
      <app-segmented formControlName="minUniques" [options]="[1,2,3]"></app-segmented>
      <p class="hint">Minimum different players across generated lineups.</p>

      <label>Max per team</label>
      <input type="number" min="1" max="8" placeholder="Unlimited" formControlName="maxPerTeam"/>
      <p class="hint">Leave blank for no cap.</p>

      <label>Stacking</label>
      <select formControlName="stackType">
        <option value="none">None</option>
        <option value="team">Team</option>
        <option value="game">Game</option>
      </select>

      <label>Stack size</label>
      <input type="number" min="2" max="4" formControlName="stackSize" [disabled]="form.value.stackType==='none'"/>
    </section>

    <!-- Salary -->
    <section>
      <h3>Salary min/max</h3>
      <label>Min salary used</label>
      <input type="range" min="47000" max="50000" step="100" formControlName="salaryMinUsed"/>
      <div class="row">
        <input type="number" min="47000" max="50000" step="100" formControlName="salaryMinUsed"/>
        <span class="hint">DK cap: $50,000</span>
      </div>
    </section>

    <!-- Ownership -->
    <section>
      <h3>Ownership caps</h3>
      <label>Ownership fade</label>
      <input type="range" min="0" max="100" formControlName="ownershipFade"/>
    </section>

    <!-- Randomness -->
    <section>
      <h3>Randomness</h3>
      <label>Randomness</label>
      <input type="range" min="0" max="100" formControlName="simDiversity"/>
    </section>

  </form>
</aside>
optimizer.page.ts (form + store sync)
import { Component, inject, OnInit, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as Rules from '../../state/rules';
import * as Builder from '../../state/builder';

@Component({
  standalone: true,
  selector: 'app-optimizer',
  templateUrl: './optimizer.page.html',
  styleUrls: ['./optimizer.page.scss'],
  imports: [ReactiveFormsModule] // plus any UI components used
})
export class OptimizerPage implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  form = this.fb.group({
    // rules
    minUniques: 1,
    maxPerTeam: null as number | null,
    stackType: 'none' as 'none'|'team'|'game',
    stackSize: null as number | null,
    // builder
    lineupCount: 20,
    salaryMinUsed: 49500,
    correlation: 50,
    ownershipFade: 30,
    simDiversity: 50,
  });

  ngOnInit(): void {
    // Patch from store → form
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

    // Form → store (debounced)
    this.form.get('minUniques')!.valueChanges.subscribe(v =>
      this.store.dispatch(Rules.setMinUniques({ value: Number(v) })));
    this.form.get('maxPerTeam')!.valueChanges.subscribe(v =>
      this.store.dispatch(Rules.setMaxPerTeam({ value: v === null || v === '' ? null : Number(v) })));
    this.form.get('stackType')!.valueChanges.subscribe(v =>
      this.store.dispatch(Rules.setStackType({ value: v as any })));
    this.form.get('stackSize')!.valueChanges.subscribe(v =>
      this.store.dispatch(Rules.setStackSize({ value: v ? Number(v) : null })));

    this.form.get('salaryMinUsed')!.valueChanges.subscribe(v =>
      this.store.dispatch(Builder.setSalaryMinUsed({ value: Number(v) })));
    this.form.get('ownershipFade')!.valueChanges.subscribe(v =>
      this.store.dispatch(Builder.setOwnershipFade({ value: Number(v) })));
    this.form.get('simDiversity')!.valueChanges.subscribe(v =>
      this.store.dispatch(Builder.setSimDiversity({ value: Number(v) })));
  }
}
Reducers: simple key updates; selectors return whole slice (selectRules, selectBuilder) and individual fields if helpful.
Styling (use tokens)
optimizer.page.scss
.settings { padding: var(--gap-3); color: var(--text); }
section + section { margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--border); }
h3 { font-size: var(--fs-14); margin: 0 0 8px; opacity: .9; }
label { display:block; font-size: var(--fs-12); opacity: .85; margin: 8px 0 4px; }
.hint { color: var(--subtle); font-size: var(--fs-12); margin-top: 4px; }
.row { display:flex; align-items:center; gap: var(--gap-2); }
input, select { width: 100%; background: var(--panel); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; }
input[type="range"] { width: 100%; background: transparent; }
Acceptance Criteria
Right rail shows interactive controls (not placeholders).
Values load from store on page open.
Changing any control dispatches the corresponding NgRx action and updates store.
stackSize is disabled when stackType = none.
Styling uses global tokens (dark, system font).
No backend/effects calls yet; no console errors; type‑safe.