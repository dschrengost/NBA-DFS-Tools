from __future__ import annotations

from pathlib import Path
import sys

# add src to path
sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from data_assets.assets import infer_type, list_assets


def write_csv(path: Path, header: list[str]) -> None:
    path.write_text(",".join(header) + "\n")


def test_infer_type(tmp_path: Path) -> None:
    proj = tmp_path / "projections.csv"
    write_csv(proj, ["player_name", "fpts"])
    own = tmp_path / "ownership.csv"
    write_csv(own, ["player_name", "own"])
    players = tmp_path / "player_ids.csv"
    write_csv(players, ["player_id", "player_name"])
    other = tmp_path / "other.csv"
    write_csv(other, ["foo", "bar"])

    cases = [
        (proj, "projections"),
        (own, "ownership"),
        (players, "players"),
        (other, "unknown"),
    ]
    for path, expected in cases:
        with path.open() as f:
            headers = f.readline().strip().split(",")
        assert infer_type(path, headers) == expected


def test_list_assets(tmp_path: Path) -> None:
    proj = tmp_path / "projections.csv"
    write_csv(proj, ["player_name", "fpts"])
    assets = list_assets(tmp_path)
    assert len(assets) == 1
    asset = assets[0]
    assert asset["path"] == "projections.csv"
    assert asset["typeGuess"] == "projections"
    assert asset["size"] > 0
    assert len(asset["checksum"]) == 40
