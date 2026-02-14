# Agent Guardrails

## Encoding Safety (Mandatory)
- Do not rewrite entire `.html`, `.md`, or `.txt` files with default encoding APIs (for example: PowerShell `Set-Content` without explicit encoding, `.NET` `WriteAllText` with inferred/default encoding).
- For batch replacements, preserve each file's original encoding and newline style (`CRLF`/`LF`).
- If encoding is unknown, use byte-level replacement and avoid full-file transcode.
- After batch edits, run `python scripts/check_mojibake.py` and confirm no newly introduced mojibake.

## Approved Workflow For Bulk Text Changes
1. Use `python scripts/safe_replace.py ...` for repository-wide replacements.
2. Verify with `python scripts/check_mojibake.py`.
3. Inspect `git diff` before commit.

## Commit Gate
- Pre-commit hook must run `python scripts/check_mojibake.py --staged`.
- Commits should be blocked if mojibake patterns are detected in staged text files.

## Comment Style (Mandatory)
- All code comments must be written in English.
- Prefer detailed comments when needed, but keep each comment compact and avoid unnecessary line breaks.
- Write comments in a systematic, production-ready style; do not document temporary edits, ad-hoc fixes, or process notes.
