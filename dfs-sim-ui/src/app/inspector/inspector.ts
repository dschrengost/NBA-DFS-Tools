import { Component, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inspector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inspector-wrap">
      @if (activeTool() === 'optimizer') {
        <section class="section">
          <h3>Optimizer Settings</h3>
          <div class="field"><span class="label">Lineup rules</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Salary min/max</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Ownership caps</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Exposures</span><span class="value">Placeholder</span></div>
        </section>
      } @else if (activeTool() === 'simulations') {
        <section class="section">
          <h3>Simulations Settings</h3>
          <div class="field"><span class="label">Iterations</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Contest structure</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">RNG seed</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Sampling mode</span><span class="value">Placeholder</span></div>
        </section>
      } @else if (activeTool() === 'variants') {
        <section class="section">
          <h3>Variants Settings</h3>
          <div class="field"><span class="label">Variants per base</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Projection delta</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Min uniques</span><span class="value">Placeholder</span></div>
        </section>
      } @else if (activeTool() === 'results') {
        <section class="section">
          <h3>Results Options</h3>
          <div class="field"><span class="label">Visible metrics</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Filters</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Export format</span><span class="value">Placeholder</span></div>
        </section>
      } @else if (activeTool() === 'settings') {
        <section class="section">
          <h3>Global Settings</h3>
          <div class="field"><span class="label">Theme</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">Default data folder</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">CSV source defaults</span><span class="value">Placeholder</span></div>
          <div class="field"><span class="label">API keys</span><span class="value">Placeholder</span></div>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .inspector-wrap { padding: var(--gap-3); font-family: var(--font-sans); color: var(--text); }
    .section { margin-bottom: var(--gap-4); }
    .section h3 { margin: 0 0 var(--gap-2); font-size: var(--fs-14); font-weight: 600; color: var(--subtle); }
    .field { margin-bottom: var(--gap-2); display: flex; justify-content: space-between; gap: var(--gap-2); }
    .label { color: var(--subtle); }
    .value { color: var(--text); opacity: 0.85; }
  `]
})
export class InspectorComponent {
  protected activeTool = signal<string>('optimizer');

  constructor(private router: Router) {
    this.activeTool.set(this.parseTool(router.url));
    router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.activeTool.set(this.parseTool(e.urlAfterRedirects));
      }
    });
  }

  private parseTool(url: string): string {
    const seg = url.split('?')[0].split('#')[0].split('/').filter(Boolean)[0];
    return seg ?? 'optimizer';
  }
}