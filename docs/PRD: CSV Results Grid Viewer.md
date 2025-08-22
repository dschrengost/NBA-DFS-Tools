PRD — CSV Results Grid Viewer (v1)

1) Overview

Build a reusable CSV → AG Grid viewer to explore large DFS outputs without backend changes. Supports:
	•	Optimizer lineups (e.g., dk_data/output/*optimizer*.csv)
	•	Variant catalog (pivot lineup_id,player_id into readable lineups)
	•	Normalized projections snapshots (from dk_data/snapshots/... once available)

Front-end only. Lives under a new route (e.g., /results) and a self-contained component suite.

2) Goals
	•	Load any CSV (local file picker or HTTP path).
	•	Render efficiently (50k+ rows) with AG Grid (virtualization, sorting, filtering).
	•	Save/restore column layout (“views”) per file type.
	•	Variant catalog: pivot by lineup_id to show complete lineups in a single row.
	•	Optional enrichment: if player_id only, allow user to add a reference CSV (e.g., player_ids.csv) to show names, positions, team.

3) Non-Goals (v1)
	•	No backend normalization or DB writes.
	•	No server-side pagination.
	•	No auth/roles.

4) UX Flow
	1.	Results page with a file selector bar:
	•	Mode A: Local File (drag/drop or picker; FileReader + PapaParse).
	•	Mode B: HTTP Path (text box; GET fetch to a static path you already serve, optional).
	2.	Grid View:
	•	Auto-detect delimiter, headers, and row count.
	•	Toolbar: Column visibility, autosize, quick filter, export (CSV), Save View.
	3.	Variant Pivot (if headers are lineup_id,player_id):
	•	Toggle: Raw vs Pivoted.
	•	Pivoted view creates columns P1..P8 (or PG/SG/SF/PF/C/G/F/UTIL if deducible).
	•	If a reference CSV is provided, join on player_id to display name | team | pos.
	4.	Projections View:
	•	If columns include fpts/own/salary, show summary stats (mean, median) above grid.

5) Technical Notes
	•	Framework: Angular + AG Grid (community).
	•	Parser: papaparse (streaming for large files).
	•	State: CsvGridService keeps current dataset, inferred schema, and saved views.
	•	Saved Views: store in localStorage by checksum_or_filename + schemaSignature.
	•	Variant Pivot Algorithm:
	•	Group by lineup_id → players array (order preserved if slot exists; else any).
	•	Emit one row per lineup_id with P1..Pn. Keep original as a secondary/raw tab.
	•	Enrichment Join:
	•	Optional “Add reference” button → load a second CSV; inner join on player_id.
	•	Display composite cell renderer: Name (Team) — Pos.

6) Components & Files (frontend only)
	•	frontend/src/app/results/ (new route)
	•	results-page.component.ts|html|scss
	•	csv-loader.service.ts (two adapters: LocalFileAdapter, HttpAdapter)
	•	csv-utils.ts (delimiter sniff, schema detection, checksum)
	•	grid/csv-grid.component.ts (pure AG Grid)
	•	grid/variant-pivot.ts (pivot helpers)
	•	grid/enrich-join.ts (lightweight join + column merge)
	•	types.ts (DatasetMeta, ViewConfig, ColumnSpec)

7) Acceptance Criteria
	•	Load a 50k-row CSV locally and render within ~2–3s on a typical laptop.
	•	Save and restore a column layout for a given file (hide/show, widths, order).
	•	Variant CSV with lineup_id,player_id can be toggled to a pivoted lineup view.
	•	Optional reference CSV successfully adds player metadata (name/pos/team).
	•	Export current grid view back to CSV.
	•	Changes confined to frontend/src/app/results/** plus necessary module wiring (no conflicts with Data Assets work).

8) Test Datasets (put in dk_data/sample/ or use existing)
	•	optimizer_lineups_sample.csv
	•	variant_catalog_sample.csv (lineup_id,player_id)
	•	player_ids_sample.csv
	•	projections_sample.csv (player_id, fpts, own, salary, team, positions)

9) Stretch (v1.1)
	•	Column state presets per file type (optimizer/variants/projections).
	•	Quick stats panel (sum salary, mean fpts) for selected rows.
	•	Row selection → “Show lineup details” drawer.

10) Definition of Done
	•	Route visible as “Results” in the nav (can be feature-flagged).
	•	Works offline with local file picker.
	•	No backend changes required.
	•	Docs: short README under frontend/src/app/results/README.md with screenshots.


Implementation Task List (Agent)

Milestone 0 — Setup (scoped, no backend changes)
	•	Create branch feature/csv-grid-viewer.
	•	Install deps: papaparse (CSV), ag-grid-community, ag-grid-angular.
	•	Keep footprint under frontend/src/app/results/** + module wiring only.

Milestone 1 — Route & Shell
	•	Add lazy route /results with a ResultsModule.
	•	Create results-page.component with a top toolbar + two-pane layout (controls over grid).

Milestone 2 — CSV Loading
	•	csv-loader.service with two adapters:
	•	LocalFileAdapter (drag/drop + file picker using FileReader + PapaParse streaming).
	•	HttpAdapter (fetch CSV from path; handle CORS; show error states).
	•	Show parse progress (rows/sec, % if known) and error toasts.

Milestone 3 — Schema & Utilities
	•	csv-utils.ts: delimiter sniff, header detection, row count, lightweight checksum, schema signature.
	•	Infer “file type” hints (optimizer, variants, projections) from headers/filename.

Milestone 4 — Grid Component
	•	grid/csv-grid.component using AG Grid:
	•	Virtualized rendering for 50k+ rows.
	•	Column autosize, hide/show, reorder, quick filter.
	•	Export current view to CSV.
	•	Persist column state to localStorage keyed by checksum + schemaSignature.

Milestone 5 — Variant Pivot
	•	grid/variant-pivot.ts:
	•	Detect lineup_id,player_id schema.
	•	Toggle: Raw vs Pivoted.
	•	Pivoted row: P1..Pn (or PG/SG/SF/PF/C/G/F/UTIL if a slot or positions can be inferred).
	•	Maintain player order if slot column exists; else stable order by join time.

Milestone 6 — Optional Enrichment Join
	•	“Add reference CSV” button → load second CSV (e.g., player_ids.csv).
	•	Join on player_id to render Name (Team) — Pos via a cell renderer.
	•	Gracefully handle missing IDs.

Milestone 7 — Projections View Helpers
	•	If headers include fpts/own/salary, show small summary band:
	•	Count, mean/median fpts, mean own, min/max salary.

Milestone 8 — UX Polish
	•	Toolbar: Load (local/http), Save/Restore View, Raw/Pivot toggle (when applicable), Export.
	•	Empty state with dropzone instructions.
	•	Error + large-file warnings; show row count on load complete.

Milestone 9 — Samples & Perf
	•	Add sample CSVs under dk_data/sample/ (or reuse existing): optimizer, variant_catalog, player_ids, projections.
	•	Validate: 50k-row CSV renders in ~2–3s on typical laptop.

Milestone 10 — Docs & QA
	•	frontend/src/app/results/README.md with screenshots and “how to load files”.
	•	E2E manual checklist (below) recorded in PR.

⸻

Acceptance Checklist
	•	/results route appears in nav (feature-flag OK).
	•	Can load local CSV and render 50k+ rows with smooth scrolling.
	•	Can fetch CSV via HTTP path (when served) with clear errors on failure.
	•	Column layout changes persist per file (hide/show, widths, order).
	•	Variant catalog toggles Raw ↔ Pivoted; pivot shows full lineups on one row.
	•	Optional reference CSV enriches variant view with Name (Team) — Pos.
	•	Projections CSV shows quick stats band (if fields present).
	•	Export current grid view to CSV works.
	•	No backend endpoints touched; no conflicts with Data Assets branch.

⸻

Guardrails
	•	Do not modify backend or shared components used by the other feature.
	•	Keep all new code in frontend/src/app/results/** plus minimal module wiring.
	•	Use TypeScript types and strict null checks for parsers and grid data.