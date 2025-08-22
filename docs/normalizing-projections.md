# Normalizing Projections

This guide explains how to convert vendor projections into the canonical format used by downstream tools.

## Workflow
1. **Scan assets** – Use the Data Assets page to index CSV files under `dk_data/`.
2. **Map columns** – Select a projections file and apply or edit the suggested mapping of source columns to canonical fields.
3. **Resolve players** – Review any unresolved names and select the correct DraftKings player IDs.
4. **Commit snapshot** – Save the normalized data to a timestamped folder in `dk_data/snapshots/`.

## Gotchas
- Ownership percentages are automatically converted to fractions; values above `1` are divided by `100`.
- Position strings support separators `/` and `|` and are uppercased.
- Snapshots are written atomically (`.tmp` then rename) to avoid partial files.
- Unmatched players are returned for manual resolution; committing without resolving keeps them unmatched.

Screenshots coming soon.
