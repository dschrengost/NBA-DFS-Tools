from __future__ import annotations

from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from data_assets.normalize import suggest_mapping
from data_assets.normalize import read_csv_preview, normalize_rows


def write_csv(path: Path, header: list[str], rows: list[list[str]]) -> None:
    lines = [",".join(header)] + [",".join(r) for r in rows]
    path.write_text("\n".join(lines) + "\n")


def test_suggest_mapping() -> None:
    headers = ["Player", "Tm", "Proj", "Own_pct"]
    mapping = suggest_mapping(headers)
    assert mapping == {
        "Player": "player_name",
        "Tm": "team",
        "Proj": "fpts",
        "Own_pct": "own",
    }


def test_normalize_rows(tmp_path: Path) -> None:
    csv_path = tmp_path / "sample.csv"
    header = ["Player", "Tm", "Proj", "Own_pct", "Pos"]
    rows = [["Jayson Tatum", "bos", "45.5", "50", "sf/pf"]]
    write_csv(csv_path, header, rows)

    headers, raw_rows = read_csv_preview(csv_path)
    suggested = suggest_mapping(headers)
    normalized = normalize_rows(raw_rows, suggested, source_name="TestSrc")
    preview = normalized[0]
    assert preview["player_name"] == "Jayson Tatum"
    assert preview["team"] == "BOS"
    assert preview["own"] == 0.5
    assert preview["positions"] == "SF,PF"
    assert preview["source"] == "TestSrc"
