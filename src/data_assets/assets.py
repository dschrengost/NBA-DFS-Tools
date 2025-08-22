from __future__ import annotations

import csv
import hashlib
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Dict, Any


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
    root_path = Path(root)
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
        asset = Asset(
            path=str(file.relative_to(root_path)),
            size=stat.st_size,
            mtime=stat.st_mtime,
            typeGuess=guess,
            checksum=checksum,
        )
        assets.append(asset)
    return [a.to_dict() for a in assets]
