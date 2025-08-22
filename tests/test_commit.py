from __future__ import annotations

from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from data_assets.api import CommitRequest, commit_projections, MappingProfile, upsert_mapping, get_mappings


def write_csv(path: Path, header: list[str], rows: list[list[str]]) -> None:
    lines = [",".join(header)] + [",".join(r) for r in rows]
    path.write_text("\n".join(lines) + "\n")


def test_commit_projections(tmp_path: Path) -> None:
    proj = tmp_path / "projections.csv"
    write_csv(proj, ["Player", "Proj"], [["Jayson Tatum", "45.5"]])
    players = tmp_path / "player_ids.csv"
    write_csv(players, ["player_id", "player_name", "team", "positions"], [["1", "Jayson Tatum", "BOS", "SF/PF"]])
    req = CommitRequest(
        file_path=str(proj),
        mapping={"Player": "player_name", "Proj": "fpts"},
        player_path=str(players),
        snapshot_root=str(tmp_path),
    )
    result = commit_projections(req)
    assert result["counts"] == {"total": 1, "matched": 1, "ambiguous": 0, "unmatched": 0}
    out_path = Path(result["normalized_path"])
    assert out_path.exists()
    assert out_path.parent.parent == tmp_path / "snapshots"


def test_mapping_profiles(tmp_path: Path) -> None:
    profile = MappingProfile(source="TestSrc", column_map={"Player": "player_name"})
    upsert_mapping(profile, root=str(tmp_path))
    profiles = get_mappings(root=str(tmp_path))
    assert profiles and profiles[0]["source"] == "TestSrc"
