from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Tuple, Any
import csv
from dataclasses import dataclass
try:
    from rapidfuzz import process, fuzz  # type: ignore
except Exception:  # pragma: no cover - fallback
    from difflib import SequenceMatcher

    def fuzz_ratio(a: str, b: str) -> float:
        return SequenceMatcher(None, a, b).ratio() * 100

    class fuzz:  # type: ignore
        @staticmethod
        def ratio(a: str, b: str) -> float:
            return fuzz_ratio(a, b)

    class process:  # type: ignore
        @staticmethod
        def extract(query: str, choices: List[str], scorer=fuzz.ratio, limit: int = 5):
            scores = [
                (choice, scorer(query, choice), i) for i, choice in enumerate(choices)
            ]
            scores.sort(key=lambda x: x[1], reverse=True)
            return scores[:limit]


_dk_cache: List[Dict[str, str]] | None = None
_dk_cache_path: Path | None = None


def load_dk_players(path: Path | str = Path("dk_data") / "player_ids.csv") -> List[Dict[str, str]]:
    """Load DK players from CSV, caching results."""
    global _dk_cache, _dk_cache_path
    path = Path(path)
    if _dk_cache is None or _dk_cache_path != path:
        with path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            _dk_cache = [
                {
                    "player_id": row.get("ID") or row.get("player_id") or "",
                    "player_name": row.get("Name") or row.get("player_name") or "",
                    "team": row.get("TeamAbbrev") or row.get("team") or "",
                    "positions": row.get("Position") or row.get("positions") or "",
                }
                for row in reader
            ]
        _dk_cache_path = path
    return _dk_cache


@dataclass
class PendingResolution:
    row_index: int
    player_name: str
    candidates: List[Dict[str, Any]]
    confidence: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "row_index": self.row_index,
            "player_name": self.player_name,
            "candidates": self.candidates,
            "confidence": self.confidence,
        }


def _score(a: str, b: str) -> float:
    return float(fuzz.ratio(a, b))


def match_players(
    rows: List[Dict[str, Any]],
    player_path: Path | str | None = None,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Match rows to DK players by name/team with fuzzy fallback."""
    players = load_dk_players(player_path or Path("dk_data") / "player_ids.csv")
    name_index: Dict[str, List[Dict[str, str]]] = {}
    for p in players:
        name_index.setdefault(p["player_name"].lower(), []).append(p)

    pending: List[PendingResolution] = []
    for i, row in enumerate(rows):
        name = str(row.get("player_name", "")).strip()
        team = str(row.get("team", "")).strip().upper()
        if not name:
            pending.append(
                PendingResolution(i, name, [], 0.0)
            )
            continue
        exact_candidates = name_index.get(name.lower(), [])
        if team:
            team_filtered = [c for c in exact_candidates if c.get("team", "").upper() == team]
            if len(team_filtered) == 1:
                row["player_id"] = team_filtered[0]["player_id"]
                continue
            if team_filtered:
                exact_candidates = team_filtered
        if len(exact_candidates) == 1:
            row["player_id"] = exact_candidates[0]["player_id"]
            continue
        if len(exact_candidates) > 1:
            cands = [
                {
                    "player_id": c["player_id"],
                    "player_name": c["player_name"],
                    "team": c.get("team", ""),
                    "positions": c.get("positions", ""),
                    "confidence": 100.0,
                }
                for c in exact_candidates
            ]
            pending.append(PendingResolution(i, name, cands, 100.0))
            continue
        # fuzzy match
        choices = [p["player_name"] for p in players]
        matches = process.extract(name, choices, scorer=fuzz.ratio, limit=3)
        matches = [
            (score, players[idx]) for _, score, idx in matches if score >= 60
        ]
        matches.sort(key=lambda x: x[0], reverse=True)
        if matches:
            top_score, top_player = matches[0]
            if top_score >= 90 and (len(matches) == 1 or top_score - matches[1][0] >= 5):
                row["player_id"] = top_player["player_id"]
                continue
        cands = [
            {
                "player_id": p["player_id"],
                "player_name": p["player_name"],
                "team": p.get("team", ""),
                "positions": p.get("positions", ""),
                "confidence": score,
            }
            for score, p in matches
        ]
        confidence = cands[0]["confidence"] if cands else 0.0
        pending.append(PendingResolution(i, name, cands, confidence))
    return rows, [p.to_dict() for p in pending]


__all__ = ["match_players", "load_dk_players"]
