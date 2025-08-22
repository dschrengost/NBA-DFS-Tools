from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Any

try:
    from fastapi import FastAPI, HTTPException
except Exception:  # pragma: no cover - lightweight stubs for test env
    class HTTPException(Exception):  # type: ignore
        def __init__(self, status_code: int, detail: str):
            self.status_code = status_code
            self.detail = detail

    class FastAPI:  # type: ignore
        def __init__(self, *_, **__):
            pass

        def get(self, *_args, **_kwargs):
            def decorator(func):
                return func

            return decorator

        def post(self, *_args, **_kwargs):
            def decorator(func):
                return func

            return decorator

try:
    from pydantic import BaseModel
except Exception:  # pragma: no cover
    class BaseModel:  # type: ignore
        def __init__(self, **data):
            for k, v in data.items():
                setattr(self, k, v)

        def dict(self) -> Dict[str, Any]:
            return dict(self.__dict__)

from .assets import list_assets
from .normalize import (
    read_csv_preview,
    suggest_mapping,
    normalize_rows,
    commit_snapshot,
)
from .match import match_players, load_dk_players

app = FastAPI()


@app.get("/assets")
def get_assets(root: str = "dk_data"):
    root_path = Path(root)
    if not root_path.exists():
        raise HTTPException(status_code=404, detail="root not found")
    return list_assets(root_path)


class NormalizeRequest(BaseModel):
    file_path: str
    source_name: str | None = None
    mapping: Dict[str, str] | None = None


@app.post("/normalize/projections")
def normalize_projections(req: NormalizeRequest) -> Dict[str, Any]:
    path = Path(req.file_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="file not found")
    headers, rows = read_csv_preview(path)
    if not req.mapping:
        suggested = suggest_mapping(headers)
        preview = rows[:5]
        return {
            "needs_mapping": True,
            "suggested_mapping": suggested,
            "preview_rows": preview,
        }
    normalized = normalize_rows(rows, req.mapping, req.source_name)
    matched, pending = match_players(normalized)
    preview = matched[:5]
    return {
        "needs_mapping": False,
        "preview_rows": preview,
        "pending_resolutions": pending,
    }


class CommitRequest(BaseModel):
    file_path: str
    mapping: Dict[str, str]
    source_name: str | None = None
    player_resolutions: Dict[int, str] | None = None
    player_path: str | None = None
    snapshot_root: str | None = None


@app.post("/normalize/projections/commit")
def commit_projections(req: CommitRequest) -> Dict[str, Any]:
    path = Path(req.file_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="file not found")
    headers, rows = read_csv_preview(path, limit=None)
    normalized = normalize_rows(rows, req.mapping, req.source_name)
    matched, pending = match_players(normalized, req.player_path)
    resolutions = req.player_resolutions or {}
    for idx, pid in resolutions.items():
        if 0 <= idx < len(matched):
            matched[idx]["player_id"] = pid
            pending = [p for p in pending if p["row_index"] != idx]
    total = len(matched)
    ambiguous = len([p for p in pending if p["candidates"]])
    unmatched = len([p for p in pending if not p["candidates"]])
    matched_count = total - ambiguous - unmatched
    root = req.snapshot_root or "dk_data"
    snapshot_dir, normalized_path = commit_snapshot(matched, root)
    return {
        "snapshot_dir": str(snapshot_dir),
        "normalized_path": str(normalized_path),
        "counts": {
            "total": total,
            "matched": matched_count,
            "ambiguous": ambiguous,
            "unmatched": unmatched,
        },
    }


class MappingProfile(BaseModel):
    source: str
    column_map: Dict[str, str]
    normalizers: Dict[str, str] | None = None


@app.get("/mappings")
def get_mappings(root: str = "dk_data") -> list[Dict[str, Any]]:
    mapping_dir = Path(root) / "mappings"
    if not mapping_dir.exists():
        return []
    profiles: list[Dict[str, Any]] = []
    for file in mapping_dir.glob("*.mapping.json"):
        with file.open() as f:
            profiles.append(json.load(f))
    return profiles


@app.post("/mappings")
def upsert_mapping(profile: MappingProfile, root: str = "dk_data") -> Dict[str, str]:
    mapping_dir = Path(root) / "mappings"
    mapping_dir.mkdir(parents=True, exist_ok=True)
    path = mapping_dir / f"{profile.source}.mapping.json"
    with path.open("w", encoding="utf-8") as f:
        json.dump(profile.model_dump(), f, indent=2)
    return {"status": "ok"}


@app.get("/players/dk")
def get_players_dk(root: str = "dk_data"):
    return load_dk_players(Path(root) / "player_ids.csv")
