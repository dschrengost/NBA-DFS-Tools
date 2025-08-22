PRD — Data Assets Catalog & Projections Normalization (v1)


**Read AGENTS.md as well as this document**

1) Overview
Build a “Data Assets” module that:
Catalogs CSV files in dk_data/ (and subfolders).
Lets the user select a projections CSV from any source and map/normalize its columns to our canonical format.
Resolves player identity against dk_data/player_ids.csv and outputs a timestamped normalized snapshot that downstream tools (optimizer, simulator, variant builder) can consume.
2) Goals
One screen to see, filter, and pick inputs (projections, ownership, contest structure, etc.).
A Column Mapper that supports multiple vendors/unknown formats.
Robust player matching to DK player IDs with a quick manual resolution UI for stragglers.
Persist mapping profiles per source so remaps are one-click next time.
Write normalized outputs to dk_data/snapshots/{YYYYMMDD_HHMM}/ with deterministic filenames.
3) Non-Goals (v1)
No multi-source blending or weighting.
No writing to DuckDB yet (CSV only; we can add DB persistence in v2).
No auth/roles.
4) Canonical Schemas
4.1 Projections (normalized output)
player_id (string; DK ID; required)
player_name (string)
team (string; DK abbrev)
positions (string; e.g., "PG,SG")
salary (int, optional)
fpts (float; our canonical projected fantasy points)
ceil (float, optional)
floor (float, optional)
own (float, optional; 0–1 or 0–100 handled)
source (string; e.g., "ETR"|"RG"|"Stokastik"|custom)
snapshot_ts (ISO8601 string)
4.2 Player IDs (reference input)
From dk_data/player_ids.csv:
player_id, player_name, team, positions (comma-sep), plus any extra DK fields
5) UX Flow
Data Assets Page
Left pane: folders/tags (dk_data/, dk_data/output, dk_data/snapshots).
Main pane: AG Grid table of files (name, size, modified time, type guess, checksum).
Toolbar: Scan, Normalize Projections, Open Snapshot Folder.
Select & Map
User picks a projections CSV → opens Column Mapper modal.
Auto-detect common synonyms:
points|proj|projection|mean → fpts
ownership|own|pown|proj_own → own
pos|position|positions → positions
name|player|player_name → player_name
team|tm → team
salary|sal|dk_salary → salary
Show first 200 rows as preview with mapping dropdowns and type badges.
Player Match Step
Auto-match to player_ids.csv using:
Exact match on (player_name, optional team) + fuzzy fallback (Levenshtein/Jaro-Winkler).
Position and team heuristics if names collide.
UI shows Unmatched / Ambiguous bucket with search-to-assign from DK player list.
Track match confidence; require manual confirmation under a threshold.
Validation & Save
Validate required columns present (fpts, player_name or player_id).
Normalize ownership to 0–1 internally; store as float.
Normalize positions to canonical comma-sep; strip whitespace.
Write snapshot to dk_data/snapshots/{YYYYMMDD_HHMM}/projections.csv.
Persist mapping profile as JSON: dk_data/mappings/{source}.mapping.json.
Catalog View Update
The snapshot appears as a new row with type projections(normalized) and link to Preview.
6) Technical Requirements
6.1 Frontend (Angular)
AG Grid for large tables (virtualized, sortable).
Components:
AssetsListComponent — lists files with type inference.
ColumnMapperDialog — mapping UI + preview.
PlayerResolveDialog — resolve unmatched/ambiguous players.
SnapshotPreviewComponent — preview normalized CSV (first N rows).
Keep state in a light AssetsService (RxJS) with caching.
6.2 Backend API (FastAPI or existing Python service; add if missing)
GET /assets?root=dk_data → returns files with {path, size, mtime, typeGuess, checksum}.
POST /normalize/projections
Body: { file_path, source_name?, mapping?, options? }
If mapping omitted, backend attempts auto-map and returns needs_mapping with guess.
POST /normalize/projections/commit
Body: { file_path, mapping, player_resolutions? }
Returns: { snapshot_dir, normalized_path, unmatched_count }
GET /mappings → list saved profiles.
POST /mappings → save/update profile.
GET /players/dk → DK players for resolver (server caches player_ids.csv).
Implementation notes
Use pandas.read_csv(..., dtype=str) then cast columns after mapping to avoid dtype hell.
Compute file checksum (e.g., SHA-1) to skip re-processing identical files.
Fuzzy match lib: rapidfuzz (fast, pure Python).
Write snapshots atomically (temp → move) to avoid partial files.
Paths configurable in one place (existing paths config).
6.3 Mapping Profiles (JSON)
{
  "source": "Stokastik",
  "version": 1,
  "column_map": {
    "player": "player_name",
    "tm": "team",
    "pos": "positions",
    "proj": "fpts",
    "own_pct": "own",
    "sal": "salary"
  },
  "normalizers": {
    "own": "percent_to_fraction",
    "positions": "split_comma_upper_trim",
    "team": "upper_trim"
  }
}
7) Error Handling & Edge Cases
Name collisions (Jr./Sr., accents): force manual pick; remember override by checksum + row hash.
Teams after trades: allow match even if team differs but positions align; flag low confidence.
Duplicate rows (same player multiple times): dedupe by player_id; warn.
Ownership scales: detect if max > 1 → divide by 100.
Huge files (50k+): stream parse; preview first N rows; whole-file run happens server-side.
8) Performance
Listing: <300ms for typical dk_data.
Normalize: <5s for 50k rows on modest CPU.
UI remains responsive; show progress indicator and counts (matched/ambiguous/unmatched).
9) Telemetry & Logs
Server logs per run: input path, checksum, mapping name, counts, duration.
Optional CSV of unmatched for audit: unmatched_{timestamp}.csv in snapshot folder.
10) Security
Restrict file access to dk_data/ subtree.
Sanitize file names; never execute user content.
No external network calls.
11) Testing / Acceptance Criteria
Unit
Mapper converts common synonyms correctly.
Ownership normalization (e.g., 35 → 0.35).
Integration
Given a Stokastik-style CSV, produce a valid projections.csv in a timestamped snapshot.
Auto-match rate ≥ 95% on a known slate; unmatched list generated.
E2E
User selects file → maps → resolves → saves → snapshot appears and is previewable.
Saved mapping profile is applied on re-run without manual steps.
Definition of Done
Feature is accessible via “Data Assets” navbar item.
Normalized projections.csv loads cleanly in downstream optimizer without manual edits.
Docs added to docs/ and linked from README.
Add .gitignore entries for dk_data/snapshots/ (keep, but ignore contents if desired) and dk_data/mappings/ (optional—decide if mappings live in git).
12) Deliverables
Frontend components (4) + service.
Backend endpoints (5) with tests.
Example mapping profiles for at least 2 sources.
User docs: “Normalizing projections” with screenshots.
CI step to run mapper unit tests.
13) Nice-to-Have (defer if time tight)
Ownership normalizer as a standalone path (some files are ownership-only).
Source autodetect (regex on header row).
Batch normalize multiple files.


Implementation Task List (Agent)

Milestone 0 — Project Setup
	•	Create branch feature/data-assets-catalog-v1.
	•	Add .gitignore entries:
	•	dk_data/snapshots/**
	•	dk_data/mappings/** (optional: keep tracked if we want mappings versioned)
	•	Pin/confirm deps: pandas, rapidfuzz, pyyaml (if needed), fastapi (or current backend), uvicorn.
	•	Single config location for paths (extend existing src/config/paths.py).

⸻

Milestone 1 — Backend: Asset Catalog
	•	Endpoint: GET /assets?root=dk_data
	•	Return { path, size, mtime, typeGuess, checksum }.
	•	Type inference: projections/ownership/players/snapshot via header sniff + filename regex.
	•	Compute SHA-1 checksum.
	•	Unit tests for type inference & listing.

⸻

Milestone 2 — Backend: Projections Normalize (auto-map)
	•	Endpoint: POST /normalize/projections
	•	Inputs: { file_path, source_name?, mapping? }.
	•	If mapping missing: detect with synonym table and return { needs_mapping: true, suggested_mapping, preview_rows }.
	•	If mapping provided: run full normalization and return { needs_mapping: false, preview_rows, pending_resolutions }.
	•	Canonical output columns: player_id, player_name, team, positions, salary, fpts, ceil, floor, own, source, snapshot_ts.
	•	Implement normalizers:
	•	Ownership: percent→fraction (detect max>1 → divide by 100).
	•	Positions: split/trim/uppercase, comma-joined.
	•	Team: uppercase/trim.
	•	Types: cast with null-safe coercion.
	•	Unit tests for synonym detection & normalizers.

⸻

Milestone 3 — Backend: Player Matching
	•	Load DK players from dk_data/player_ids.csv (cached).
	•	Matching pipeline:
	•	Tier 1: exact on player_name (+ optional team).
	•	Tier 2: fuzzy (Jaro-Winkler/Levenshtein via rapidfuzz) with score threshold.
	•	Tie-breakers: positions, team, salary proximity (if available).
	•	Return pending_resolutions with { row_key, candidate_list, confidence } for UI.
	•	Unit tests: high-confidence match, ambiguous, unmatched.

⸻

Milestone 4 — Backend: Commit Snapshot & Profiles
	•	Endpoint: POST /normalize/projections/commit
	•	Inputs: { file_path, mapping, player_resolutions? }.
	•	Write to dk_data/snapshots/{YYYYMMDD_HHMM}/projections.csv (atomic temp→move).
	•	Output { snapshot_dir, normalized_path, counts: { total, matched, ambiguous, unmatched } }.
	•	Endpoints for mapping profiles:
	•	GET /mappings list profiles.
	•	POST /mappings upsert { source, column_map, normalizers } to dk_data/mappings/{source}.mapping.json.
	•	Integration tests: end-to-end normalize→commit, file existence, counts.

⸻

Milestone 5 — Frontend: Assets List
	•	Route “Data Assets” in sidebar/nav.
	•	AssetsListComponent (AG Grid):
	•	Columns: name, size, modified, type, checksum (hidden), actions.
	•	Toolbar: Scan, Normalize Projections, Open Snapshot Folder.
	•	Action visibility based on typeGuess.
	•	Service: AssetsService (RxJS cache) + API bindings.

⸻

Milestone 6 — Frontend: Column Mapper
	•	ColumnMapperDialog:
	•	Show source headers with dropdowns to select canonical fields.
	•	Show “Suggested mapping” if backend returned needs_mapping:true.
	•	Live preview (first 200 rows) with type badges.
	•	Validation: require fpts and either player_id or player_name.
	•	Controls: Apply Mapping → calls /normalize/projections with mapping.
	•	Persist/Load mapping profiles:
	•	Dropdown to select saved profile (auto-fill the mapping).
	•	“Save profile” button → POST /mappings.

⸻

Milestone 7 — Frontend: Player Resolver
	•	PlayerResolveDialog:
	•	Tabs: Ambiguous, Unmatched.
	•	For each unresolved row: list candidates with confidence, team, positions.
	•	Search DK players on demand via GET /players/dk.
	•	Bulk actions: accept all ≥ threshold; mark “intended” matches.
	•	Submit → calls /normalize/projections/commit.

⸻

Milestone 8 — Frontend: Snapshot Preview
	•	SnapshotPreviewComponent:
	•	Read first N rows of normalized_path and show in AG Grid.
	•	Status banner: { total, matched, ambiguous, unmatched }.
	•	Button: “Open in Finder/Explorer” (if electron) or copy path (web).

⸻

Milestone 9 — Docs, QA, CI
	•	docs/normalizing-projections.md with screenshots & “Gotchas”.
	•	Add pytest for units/integration; wire to CI.
	•	Log per run: input path, checksum, mapping name, counts, duration.
	•	Optional: write unmatched_{timestamp}.csv to snapshot folder.

⸻

Acceptance Criteria
	•	User can list assets under dk_data/.
	•	User can map an arbitrary projections CSV with auto-suggested mapping.
	•	Unmatched/ambiguous players are resolvable via UI.
	•	A timestamped dk_data/snapshots/.../projections.csv is produced with canonical schema.
	•	Saved mapping profile can be re-applied in one click.
	•	Optimizer can read the normalized file without manual edits.

⸻

Stretch / Nice-to-Have (v1.1+)
	•	Ownership-only normalizer path.
	•	Batch normalize multiple files.
	•	Source autodetect via header patterns.
	•	DuckDB persistence mirror (toggle backend repo).

⸻

Dev Notes
	•	Prefer pandas.read_csv(..., dtype=str) and cast post-map to avoid dtype drift.
	•	For very large files: stream read for full run; preview is first 200 rows only.
	•	Use atomic writes (temp file → rename) to avoid partial snapshots.