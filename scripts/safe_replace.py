#!/usr/bin/env python3
import argparse
import re
from pathlib import Path

TEXT_EXTS = {".html", ".htm", ".md", ".txt", ".css", ".js", ".json", ".yml", ".yaml", ".xml", ".csv"}


def detect_newline(data: bytes) -> str:
    return "\r\n" if b"\r\n" in data else "\n"


def detect_encoding(data: bytes) -> tuple[str, bool]:
    if data.startswith(b"\xef\xbb\xbf"):
        return "utf-8-sig", True
    for enc in ("utf-8", "cp1252", "gb18030", "latin-1"):
        try:
            data.decode(enc)
            return enc, False
        except UnicodeDecodeError:
            continue
    return "latin-1", False


def replace_in_file(path: Path, pattern: re.Pattern[str], repl: str, dry_run: bool) -> bool:
    raw = path.read_bytes()
    newline = detect_newline(raw)
    enc, has_bom = detect_encoding(raw)
    text = raw.decode(enc)
    new_text, n = pattern.subn(repl, text)
    if n == 0:
        return False
    if new_text == text:
        return False
    new_text = new_text.replace("\r\n", "\n").replace("\r", "\n").replace("\n", newline)
    if dry_run:
        return True
    if has_bom and enc == "utf-8-sig":
        path.write_bytes(new_text.encode("utf-8-sig"))
    else:
        path.write_bytes(new_text.encode(enc))
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Safe batch replacement preserving original encoding/newlines.")
    parser.add_argument("find", help="Regex pattern to find")
    parser.add_argument("replace", help="Replacement string")
    parser.add_argument("--root", default=".", help="Root directory")
    parser.add_argument("--glob", default="**/*", help="Glob under root")
    parser.add_argument("--ext", nargs="*", default=None, help="Limit extensions, e.g. .html .md")
    parser.add_argument("--dry-run", action="store_true", help="Only report files that would change")
    args = parser.parse_args()

    root = Path(args.root)
    exts = set(e.lower() for e in (args.ext or TEXT_EXTS))
    pat = re.compile(args.find, re.MULTILINE)

    changed = []
    for p in root.glob(args.glob):
        if not p.is_file():
            continue
        if p.suffix.lower() not in exts:
            continue
        if ".git" in p.parts:
            continue
        try:
            if replace_in_file(p, pat, args.replace, args.dry_run):
                changed.append(p)
        except Exception:
            continue

    for p in changed:
        print(p.as_posix())
    print(f"changed={len(changed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
