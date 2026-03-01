#!/usr/bin/env python3
"""Compress thumbnail JPEG files in selected directories.

This script scans configured directories for files that match:
- filename contains a pattern (default: "_thumbnail")
- extension is .jpg or .jpeg (case-insensitive)

It can run in dry-run mode for estimation or apply mode to rewrite files
atomically when recompression produces a smaller file.
"""

from __future__ import annotations

import argparse
import json
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image


@dataclass
class FileResult:
    path: str
    before: int
    after: int
    delta: int
    ratio: float


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compress thumbnail JPEGs with Pillow."
    )
    parser.add_argument(
        "--root",
        default=".",
        help="Repository root directory (default: current directory).",
    )
    parser.add_argument(
        "--dirs",
        nargs="+",
        default=["maps", "lego"],
        help="Directories to scan relative to root (default: maps lego).",
    )
    parser.add_argument(
        "--pattern",
        default="_thumbnail",
        help="Filename contains pattern filter (default: _thumbnail).",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=70,
        help="JPEG quality to use for recompression (default: 70).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Estimate compressed sizes without modifying files.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply recompression and overwrite only when file size decreases.",
    )
    parser.add_argument(
        "--report",
        default="",
        help="Optional JSON report output path.",
    )
    return parser.parse_args()


def validate_args(args: argparse.Namespace) -> None:
    if args.dry_run == args.apply:
        raise ValueError("Exactly one of --dry-run or --apply must be provided.")
    if args.quality < 1 or args.quality > 100:
        raise ValueError("--quality must be between 1 and 100.")


def matches_target(path: Path, pattern: str) -> bool:
    name = path.name.lower()
    if pattern.lower() not in name:
        return False
    return path.suffix.lower() in {".jpg", ".jpeg"}


def iter_target_files(root: Path, dirs: list[str], pattern: str) -> list[Path]:
    files: list[Path] = []
    for rel_dir in dirs:
        abs_dir = (root / rel_dir).resolve()
        if not abs_dir.exists() or not abs_dir.is_dir():
            continue
        for path in abs_dir.rglob("*"):
            if path.is_file() and matches_target(path, pattern):
                files.append(path)
    files.sort()
    return files


def prepare_image(img: Image.Image) -> Image.Image:
    mode = img.mode
    if mode in {"RGB", "L"}:
        return img
    if mode in {"RGBA", "LA"}:
        background = Image.new("RGB", img.size, (255, 255, 255))
        alpha = img.getchannel("A")
        background.paste(img.convert("RGB"), mask=alpha)
        return background
    if mode == "P":
        converted = img.convert("RGBA")
        background = Image.new("RGB", converted.size, (255, 255, 255))
        alpha = converted.getchannel("A")
        background.paste(converted.convert("RGB"), mask=alpha)
        return background
    return img.convert("RGB")


def encode_to_temp(path: Path, quality: int) -> Path:
    with Image.open(path) as src:
        prepared = prepare_image(src)
        tmp = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".jpg",
            dir=str(path.parent),
        )
        tmp_path = Path(tmp.name)
        tmp.close()
        prepared.save(
            tmp_path,
            format="JPEG",
            quality=quality,
            optimize=True,
            progressive=True,
        )
        return tmp_path


def process_file(path: Path, quality: int, apply_changes: bool) -> FileResult | None:
    before = path.stat().st_size
    temp_path: Path | None = None
    try:
        temp_path = encode_to_temp(path, quality)
        candidate_after = temp_path.stat().st_size
        final_after = candidate_after
        if apply_changes and candidate_after < before:
            os.replace(temp_path, path)
            temp_path = None
        elif apply_changes:
            # In apply mode, keep report values aligned with actual filesystem state.
            final_after = before
        delta = before - final_after
        ratio = (delta / before) if before else 0.0
        return FileResult(
            path=str(path),
            before=before,
            after=final_after,
            delta=delta,
            ratio=ratio,
        )
    finally:
        if temp_path is not None and temp_path.exists():
            temp_path.unlink(missing_ok=True)


def build_report(results: list[FileResult], skipped_count: int) -> dict[str, Any]:
    total_before = sum(item.before for item in results)
    total_after = sum(item.after for item in results)
    saved_bytes = total_before - total_after
    saved_ratio = (saved_bytes / total_before) if total_before else 0.0
    return {
        "processed_count": len(results),
        "skipped_count": skipped_count,
        "total_before_bytes": total_before,
        "total_after_bytes": total_after,
        "saved_bytes": saved_bytes,
        "saved_ratio": round(saved_ratio, 6),
        "files": [
            {
                "path": item.path,
                "before": item.before,
                "after": item.after,
                "delta": item.delta,
                "ratio": round(item.ratio, 6),
            }
            for item in results
        ],
    }


def print_summary(report: dict[str, Any]) -> None:
    before = report["total_before_bytes"]
    after = report["total_after_bytes"]
    saved = report["saved_bytes"]
    ratio = report["saved_ratio"] * 100
    print(f"processed_count={report['processed_count']}")
    print(f"skipped_count={report['skipped_count']}")
    print(f"total_before_bytes={before}")
    print(f"total_after_bytes={after}")
    print(f"saved_bytes={saved}")
    print(f"saved_ratio={ratio:.2f}%")


def main() -> int:
    args = parse_args()
    try:
        validate_args(args)
    except ValueError as err:
        print(f"Error: {err}")
        return 2

    root = Path(args.root).resolve()
    targets = iter_target_files(root, args.dirs, args.pattern)

    results: list[FileResult] = []
    skipped_count = 0
    for path in targets:
        try:
            result = process_file(path, args.quality, args.apply)
            if result is None:
                skipped_count += 1
                continue
            results.append(result)
        except Exception as err:  # pylint: disable=broad-except
            skipped_count += 1
            print(f"Skipped {path}: {err}")

    report = build_report(results, skipped_count)
    print_summary(report)

    if args.report:
        report_path = Path(args.report)
        if not report_path.is_absolute():
            report_path = root / report_path
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(
            json.dumps(report, ensure_ascii=False, indent=2),
            encoding="utf-8",
            newline="\n",
        )
        print(f"report={report_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
