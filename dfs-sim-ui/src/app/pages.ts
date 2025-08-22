import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerCsvService } from './core/services/player-csv.service';
import { ContestCsvService } from './core/services/contest-csv.service';

/* Optimizer */
@Component({
  selector: 'page-optimizer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h2>Optimizer</h2>
        <div class="run-controls">
          <button class="btn" type="button" aria-label="Play once">▶︎ Play</button>
          <button class="btn" type="button" aria-label="Loop runs">🔁 Loop</button>
        </div>
      </header>
      <section class="page-body">
        <p>Configure lineup rules, salary caps, ownership, exposures…</p>
      </section>
    </div>
  `,
  styles: [`
    .page { padding: var(--gap-3); font-family: var(--font-sans); color: var(--text); }
    .page-header { display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--border); padding-bottom: var(--gap-2); margin-bottom: var(--gap-3); }
    h2 { margin: 0; font-size: var(--fs-16); }
    .run-controls { display: flex; gap: var(--gap-2); }
    .btn { background: var(--muted); color: var(--text); border: 1px solid var(--border);
      border-radius: 8px; padding: 6px 10px; cursor: pointer; }
    .btn:hover { background: var(--panel); }
  `]
})
export class OptimizerPage implements OnInit {
  private players = inject(PlayerCsvService);
  private contestsSvc = inject(ContestCsvService);

  async ngOnInit(): Promise<void> {
    const [players, contests] = await Promise.all([
      this.players.parse(),
      this.contestsSvc.load(),
    ]);
    console.log('[Task2] players:', players.length);
    console.table(players.slice(0, 10));
    console.log('[Task2] contests:', contests.length, contests[0]);
  }
}

/* Simulations */
@Component({
  selector: 'page-simulations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h2>Simulations</h2>
        <div class="run-controls">
          <button class="btn" type="button" aria-label="Play once">▶︎ Play</button>
          <button class="btn" type="button" aria-label="Loop runs">🔁 Loop</button>
        </div>
      </header>
      <section class="page-body">
        <p>Set iterations, contest structure, RNG seed, sampling mode…</p>
      </section>
    </div>
  `,
  styles: [`
    .page { padding: var(--gap-3); font-family: var(--font-sans); color: var(--text); }
    .page-header { display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--border); padding-bottom: var(--gap-2); margin-bottom: var(--gap-3); }
    h2 { margin: 0; font-size: var(--fs-16); }
    .run-controls { display: flex; gap: var(--gap-2); }
    .btn { background: var(--muted); color: var(--text); border: 1px solid var(--border);
      border-radius: 8px; padding: 6px 10px; cursor: pointer; }
    .btn:hover { background: var(--panel); }
  `]
})
export class SimulationsPage {}

/* Variants */
@Component({
  selector: 'page-variants',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h2>Variants</h2>
        <div class="run-controls">
          <button class="btn" type="button" aria-label="Play once">▶︎ Play</button>
          <button class="btn" type="button" aria-label="Loop runs">🔁 Loop</button>
        </div>
      </header>
      <section class="page-body">
        <p>Configure variants per base, projection deltas, min uniques…</p>
      </section>
    </div>
  `,
  styles: [`
    .page { padding: var(--gap-3); font-family: var(--font-sans); color: var(--text); }
    .page-header { display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--border); padding-bottom: var(--gap-2); margin-bottom: var(--gap-3); }
    h2 { margin: 0; font-size: var(--fs-16); }
    .run-controls { display: flex; gap: var(--gap-2); }
    .btn { background: var(--muted); color: var(--text); border: 1px solid var(--border);
      border-radius: 8px; padding: 6px 10px; cursor: pointer; }
    .btn:hover { background: var(--panel); }
  `]
})
export class VariantsPage {}

/* Results */
@Component({
  selector: 'page-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h2>Results</h2>
      </header>
      <section class="page-body">
        <p>Viewer for metrics, filters, and exports.</p>
      </section>
    </div>
  `,
  styles: [`
    .page { padding: var(--gap-3); font-family: var(--font-sans); color: var(--text); }
    .page-header { border-bottom: 1px solid var(--border); padding-bottom: var(--gap-2); margin-bottom: var(--gap-3); }
    h2 { margin: 0; font-size: var(--fs-16); }
  `]
})
export class ResultsPage {}

/* Settings */
@Component({
  selector: 'page-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h2>Settings</h2>
      </header>
      <section class="page-body">
        <ul>
          <li>Theme</li>
          <li>Default data folder</li>
          <li>CSV source defaults</li>
          <li>API keys</li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .page { padding: var(--gap-3); font-family: var(--font-sans); color: var(--text); }
    .page-header { border-bottom: 1px solid var(--border); padding-bottom: var(--gap-2); margin-bottom: var(--gap-3); }
    h2 { margin: 0; font-size: var(--fs-16); }
  `]
})
export class SettingsPage {}