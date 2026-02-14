#!/usr/bin/env python3
import argparse
import subprocess
from pathlib import Path

BAD_SNIPPETS = [
    "�",      # replacement char
    "鈥",     # common mojibake for quotes/dash
    "馃",     # common mojibake for emoji
    "锟",     # replacement-like mojibake
]
TEXT_EXTS = {".html", ".htm", ".md", ".txt", ".css", ".js", ".json", ".yml", ".yaml", ".xml", ".csv"}


def staged_files() -> list[Path]:
    out = subprocess.check_output(["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"]).decode("utf-8", "replace")
    files = []
    for line in out.splitlines():
        p = Path(line.strip())
        if p.suffix.lower() in TEXT_EXTS and p.exists():
            files.append(p)
    return files


def scan_file(path: Path) -> list[str]:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return []
    hits = [s for s in BAD_SNIPPETS if s in text]
    return hits


def main() -> int:
    parser = argparse.ArgumentParser(description="Detect likely mojibake in text files.")
    parser.add_argument("--staged", action="store_true", help="Scan only staged files")
    args = parser.parse_args()

    files = staged_files() if args.staged else [p for p in Path(".").rglob("*") if p.is_file() and p.suffix.lower() in TEXT_EXTS and ".git" not in p.parts]

    failures = []
    for p in files:
        hits = scan_file(p)
        if hits:
            failures.append((p, hits))

    if failures:
        print("Potential mojibake detected:")
        for p, hits in failures:
            uniq = ", ".join(sorted(set(hits)))
            print(f"- {p.as_posix()} -> {uniq}")
        return 1

    print("Mojibake check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
