from __future__ import annotations

from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from data_assets.match import match_players


def write_players(path: Path, rows: list[list[str]]) -> None:
    header = ["player_id", "player_name", "team", "positions"]
    lines = [",".join(header)] + [",".join(r) for r in rows]
    path.write_text("\n".join(lines) + "\n")


def test_match_high_confidence(tmp_path: Path) -> None:
    players = tmp_path / "player_ids.csv"
    write_players(players, [["1", "Jayson Tatum", "BOS", "SF/PF"]])
    rows = [{"player_name": "Jason Tatum", "team": "BOS"}]
    matched, pending = match_players(rows, players)
    assert matched[0]["player_id"] == "1"
    assert pending == []


def test_match_ambiguous(tmp_path: Path) -> None:
    players = tmp_path / "player_ids.csv"
    write_players(
        players,
        [
            ["1", "John Smith", "A", "PG"],
            ["2", "John Smith", "B", "SG"],
        ],
    )
    rows = [{"player_name": "John Smith"}]
    matched, pending = match_players(rows, players)
    assert "player_id" not in matched[0]
    assert len(pending) == 1
    assert len(pending[0]["candidates"]) == 2


def test_match_unmatched(tmp_path: Path) -> None:
    players = tmp_path / "player_ids.csv"
    write_players(players, [["1", "Jayson Tatum", "BOS", "SF/PF"]])
    rows = [{"player_name": "Unknown Guy"}]
    matched, pending = match_players(rows, players)
    assert "player_id" not in matched[0]
    assert pending[0]["candidates"] == []
