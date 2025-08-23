from __future__ import annotations

import csv
import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Dict, Any
from fastapi import HTTPException

ALLOWED_BASE = Path("dk_data").resolve()

def _safe_root(subpath: Path | str | None) -> Path:
    """
    Resolve a safe root for asset listing.

    - If a **Path object** is provided and it's absolute (used by tests), allow it as-is
      (still must exist and be a directory).
    - If a **string** (from API query) or a relative Path is provided, treat it as
      a subpath beneath ALLOWED_BASE and reject traversal outside dk_data/.
    """
    # Case 1: absolute Path (e.g., pytest tmp_path)
    if isinstance(subpath, Path) and subpath.is_absolute():
        target = subpath.resolve()
        if not target.exists() or not target.is_dir():
            raise HTTPException(status_code=400, detail="file not found")
        return target

    # Case 2: no subpath provided -> base
    if not subpath:
        target = ALLOWED_BASE
    else:
        # Treat strings/relative Paths as subpaths under dk_data/
        # Normalize, strip leading slash, and drop traversal parts
        rel_str = str(subpath).strip().lstrip("/")
        rel = Path(rel_str)
        parts = [p for p in rel.parts if p not in ("..", "")]
        # If the caller passes "dk_data" (the base name), treat it as the base
        if parts and parts[0] == ALLOWED_BASE.name:
            parts = parts[1:]
        cleaned = Path(*parts)
        target = (ALLOWED_BASE / cleaned).resolve()

    # Enforce anchoring to dk_data/
    try:
        target.relative_to(ALLOWED_BASE)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid root")

    if not target.exists() or not target.is_dir():
        raise HTTPException(status_code=400, detail="file not found")
    return target

@dataclass
class Asset:
    path: str
    size: int
    mtime: float
    typeGuess: str
    checksum: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "path": self.path,
            "size": self.size,
            "mtime": self.mtime,
            "typeGuess": self.typeGuess,
            "checksum": self.checksum,
        }


def infer_type(file_path: Path, headers: Iterable[str]) -> str:
    """Infer asset type based on filename and headers."""
    fname = file_path.name.lower()
    headers_lower = [h.lower() for h in headers]
    if "snapshots" in file_path.parts:
        return "snapshot"
    if "player_ids" in fname or (
        "player_id" in headers_lower and "player_name" in headers_lower
    ):
        return "players"
    ownership_synonyms = {"own", "ownership", "pown", "proj_own"}
    if any(syn in fname for syn in ownership_synonyms) or any(
        col in ownership_synonyms for col in headers_lower
    ):
        return "ownership"
    projection_synonyms = {"fpts", "proj", "projection", "mean"}
    if "projection" in fname or any(col in projection_synonyms for col in headers_lower):
        return "projections"
    return "unknown"


def _checksum(path: Path) -> str:
    sha1 = hashlib.sha1()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha1.update(chunk)
    return sha1.hexdigest()


def list_assets(root: Path | str) -> List[Dict[str, Any]]:
    root_path = _safe_root(root)
    assets: List[Asset] = []
    for file in root_path.rglob("*.csv"):
        try:
            with file.open(newline="") as f:
                reader = csv.reader(f)
                headers = next(reader, [])
        except Exception:
            headers = []
        guess = infer_type(file, headers)
        stat = file.stat()
        checksum = _checksum(file)
        # Prefer paths relative to dk_data/, but fall back to the provided root (e.g., pytest tmp dirs)
        try:
            rel_path = str(file.relative_to(ALLOWED_BASE))
        except ValueError:
            rel_path = str(file.relative_to(root_path))

        asset = Asset(
            path=rel_path,
            size=stat.st_size,
            mtime=stat.st_mtime,
            typeGuess=guess,
            checksum=checksum,
        )
        assets.append(asset)
    return [a.to_dict() for a in assets]
