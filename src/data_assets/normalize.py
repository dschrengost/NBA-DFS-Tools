from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Tuple, Any
import csv

# Synonym table mapping canonical columns to possible header names
SYNONYMS: Dict[str, set[str]] = {
    "player_name": {"player", "player_name", "name"},
    "team": {"team", "tm"},
    "positions": {"position", "positions", "pos"},
    "salary": {"salary", "sal", "dk_salary"},
    "fpts": {"fpts", "proj", "projection", "mean"},
    "ceil": {"ceil", "ceiling"},
    "floor": {"floor"},
    "own": {"own", "ownership", "pown", "proj_own", "own_pct", "ownership_pct"},
}


# Canonical output column order
CANONICAL_COLUMNS = [
    "player_id",
    "player_name",
    "team",
    "positions",
    "salary",
    "fpts",
    "ceil",
    "floor",
    "own",
    "source",
    "snapshot_ts",
]


def suggest_mapping(headers: Iterable[str]) -> Dict[str, str]:
    """Suggest a mapping from source headers to canonical fields."""
    mapping: Dict[str, str] = {}
    for h in headers:
        hl = h.lower()
        for canon, syns in SYNONYMS.items():
            if hl == canon or hl in syns:
                mapping[h] = canon
                break
    return mapping


def read_csv_preview(path: Path, limit: int | None = 200) -> Tuple[List[str], List[Dict[str, str]]]:
    """Read headers and up to N rows from CSV (all if limit=None)."""
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        rows: List[Dict[str, str]] = []
        for i, row in enumerate(reader):
            rows.append(row)
            if limit is not None and i + 1 >= limit:
                break
    return headers, rows


def _to_float(val: Any) -> float | None:
    try:
        return float(val)
    except (TypeError, ValueError):
        return None


def _to_int(val: Any) -> int | None:
    try:
        return int(float(val))
    except (TypeError, ValueError):
        return None


def _normalize_own(val: Any) -> float | None:
    num = _to_float(val)
    if num is None:
        return None
    if num > 1:
        num /= 100.0
    # ensure stable CSV printing (avoid long float reprs)
    return round(num, 6)


def _normalize_positions(val: Any) -> str:
    if val is None:
        return ""
    parts = (
        str(val)
        .replace("/", ",")
        .replace("|", ",")
        .split(",")
    )
    parts = [p.strip().upper() for p in parts if p.strip()]
    return ",".join(parts)


def _normalize_team(val: Any) -> str:
    if val is None:
        return ""
    return str(val).strip().upper()


def normalize_rows(rows: List[Dict[str, str]], mapping: Dict[str, str], source_name: str | None = None) -> List[Dict[str, Any]]:
    """Apply mapping and normalizers to rows."""
    normalized: List[Dict[str, Any]] = []
    snapshot_ts = datetime.now(timezone.utc).isoformat()
    for row in rows:
        out: Dict[str, Any] = {}
        for src_col, canon in mapping.items():
            value = row.get(src_col)
            if canon == "own":
                out[canon] = _normalize_own(value)
            elif canon == "positions":
                out[canon] = _normalize_positions(value)
            elif canon == "team":
                out[canon] = _normalize_team(value)
            elif canon in {"fpts", "ceil", "floor"}:
                out[canon] = _to_float(value)
            elif canon == "salary":
                out[canon] = _to_int(value)
            else:
                out[canon] = value
        if source_name:
            out["source"] = source_name
        out["snapshot_ts"] = snapshot_ts
        normalized.append(out)
    return normalized


def commit_snapshot(rows: List[Dict[str, Any]], root: Path | str = Path("dk_data")) -> tuple[Path, Path]:
    """Write rows to a timestamped snapshot and return paths."""
    root_path = Path(root)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")
    snapshot_dir = root_path / "snapshots" / ts
    snapshot_dir.mkdir(parents=True, exist_ok=True)
    final_path = snapshot_dir / "projections.csv"
    tmp_path = final_path.with_suffix(".tmp")
    with tmp_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CANONICAL_COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow({col: row.get(col, "") for col in CANONICAL_COLUMNS})
    tmp_path.replace(final_path)
    return snapshot_dir, final_path


__all__ = [
    "suggest_mapping",
    "normalize_rows",
    "read_csv_preview",
    "commit_snapshot",
    "CANONICAL_COLUMNS",
]
