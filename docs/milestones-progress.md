# Milestones Progress

## Milestone 1 — Backend: Asset Catalog
- Indexed CSV assets and inferred type via header sniffing and filename heuristics.
- Exposed `GET /assets` endpoint returning path, size, mtime, type guess and checksum.
- Added unit tests for type inference and listing.

## Milestone 2 — Backend: Projections Normalize (auto-map)
- Implemented `POST /normalize/projections` to suggest mappings or normalize rows with ownership/team/position normalizers.
- Synonym table detects common header aliases and enforces canonical column order.
- Unit tests cover synonym detection and normalizer behavior.

## Milestone 3 — Backend: Player Matching
- Loaded and cached DraftKings player IDs from `dk_data/player_ids.csv`.
- Applied exact and fuzzy name matching returning pending resolutions for ambiguous cases.
- Tests validate high-confidence, ambiguous and unmatched scenarios.

## Milestone 4 — Backend: Commit Snapshot & Profiles
- Added `POST /normalize/projections/commit` to write timestamped snapshots atomically.
- Endpoints `GET/POST /mappings` and `GET /players/dk` manage mapping profiles and DK player data.
- Integration tests ensure end-to-end commit workflow and file existence.

## Milestone 5 — Frontend: Assets List
- Added sidebar route and nav entry for Data Assets.
- `AssetsService` caches catalog results and wraps backend APIs.
- `AssetsListComponent` uses AG Grid to display files with a toolbar for scan/normalize actions.

## Milestone 6 — Frontend: Column Mapper
- `ColumnMapperComponent` presents suggested mappings and lets users apply a custom mapping with live preview.

## Milestone 7 — Frontend: Player Resolver
- `PlayerResolveComponent` lists unresolved players, lets users select candidates, and commits resolutions.

## Milestone 8 — Frontend: Snapshot Preview
- `SnapshotPreviewComponent` fetches the first rows of the normalized CSV and displays summary counts.

## Milestone 9 — Docs, QA, CI
- Added `docs/normalizing-projections.md` with workflow and gotchas.
- Executed `pytest` to verify backend functionality.
