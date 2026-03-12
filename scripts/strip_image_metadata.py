from __future__ import annotations

import sys
import warnings
from pathlib import Path
from tempfile import mkstemp
from os import close as os_close

from PIL import Image, ImageSequence


SUPPORTED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff",
}

ROOT = Path(__file__).resolve().parents[1]
Image.MAX_IMAGE_PIXELS = None
warnings.simplefilter("ignore", Image.DecompressionBombWarning)


def iter_image_paths(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def normalize_format_name(image: Image.Image, path: Path) -> str:
    format_name = (image.format or path.suffix.lstrip(".")).upper()
    if format_name == "MPO":
        return "JPEG"
    return format_name


def save_without_metadata(path: Path) -> None:
    with Image.open(path) as image:
        format_name = normalize_format_name(image, path)
        save_kwargs: dict[str, object] = {"format": format_name}
        supports_animation = format_name in {"GIF", "WEBP", "TIFF"}

        if format_name == "JPEG":
            save_kwargs.update(
                quality=95,
                progressive=bool(image.info.get("progressive")),
                optimize=False,
            )
        elif format_name == "PNG":
            save_kwargs.update(optimize=False, compress_level=9)
        elif format_name == "WEBP":
            if "lossless" in image.info:
                save_kwargs["lossless"] = bool(image.info["lossless"])
            if "quality" in image.info:
                save_kwargs["quality"] = image.info["quality"]

        if getattr(image, "is_animated", False) and supports_animation:
            frames = [frame.copy() for frame in ImageSequence.Iterator(image)]
            for frame in frames:
                frame.info = {}
            first, rest = frames[0], frames[1:]
            save_kwargs.update(
                save_all=True,
                append_images=rest,
                duration=image.info.get("duration"),
                loop=image.info.get("loop", 0),
                disposal=image.info.get("disposal"),
                transparency=image.info.get("transparency"),
                background=image.info.get("background"),
            )
            target = first
        else:
            if getattr(image, "is_animated", False):
                image.seek(0)
            target = image.copy()
            target.info = {}

        save_kwargs.update(exif=b"", icc_profile=None)

    fd, tmp_name = mkstemp(dir=path.parent, suffix=path.suffix)
    os_close(fd)
    tmp_path = Path(tmp_name)

    try:
        target.save(tmp_path, **{k: v for k, v in save_kwargs.items() if v is not None})
        tmp_path.replace(path)
    finally:
        if tmp_path.exists():
            tmp_path.unlink()


def main() -> int:
    image_paths = iter_image_paths(ROOT)
    rewritten = 0
    failures: list[tuple[Path, str]] = []

    for path in image_paths:
        try:
            save_without_metadata(path)
            rewritten += 1
            print(path.relative_to(ROOT))
        except Exception as exc:  # noqa: BLE001
            failures.append((path, str(exc)))

    print(f"Rewritten {rewritten} image files.")

    if failures:
        print(f"Failed on {len(failures)} files:", file=sys.stderr)
        for path, error in failures:
            print(f"{path.relative_to(ROOT)}: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
