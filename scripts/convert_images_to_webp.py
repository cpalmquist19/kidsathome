#!/usr/bin/env python3
"""
Convert the images in a folder to .webp and repoint the references to them.

- Files that are already WebP data under another extension (the wiki serves WebP
  regardless of the URL) are just renamed, so there is no quality loss.
- Everything else Pillow can open is re-encoded; animated GIFs stay animated.
- Files Pillow cannot read (e.g. .svg) are left alone.
- Originals are removed after a successful conversion unless --keep is passed.
- Text files (default: static/data/alldimensions_objects.js) get 'name.ext' ->
  'name.webp' for every converted file.

Usage:
    pip install Pillow
    python scripts/convert_images_to_webp.py                  # alldimensions folder
    python scripts/convert_images_to_webp.py --keep           # keep originals
    python scripts/convert_images_to_webp.py --dir static/images --refs templates/x.html
"""
import argparse
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DIR = os.path.join(ROOT, "static", "images", "alldimensions")
DEFAULT_REFS = [os.path.join(ROOT, "static", "data", "alldimensions_objects.js")]


def convert(path, quality, keep):
    """Return the new filename, or None if the file was skipped."""
    stem = os.path.splitext(path)[0]
    dest = stem + ".webp"
    try:
        with Image.open(path) as im:
            already_webp = im.format == "WEBP"
            animated = getattr(im, "is_animated", False)
            if not already_webp:
                if animated:
                    im.save(dest, "WEBP", save_all=True, quality=quality, method=6)
                else:
                    if im.mode not in ("RGB", "RGBA"):
                        im = im.convert("RGBA" if "transparency" in im.info or im.mode in ("LA", "P") else "RGB")
                    im.save(dest, "WEBP", quality=quality, method=6)
    except Exception as exc:  # noqa: BLE001 - unreadable (svg etc.), leave it
        print(f"  skip {os.path.basename(path)}: {exc.__class__.__name__}")
        return None

    if already_webp:
        os.replace(path, dest) if not keep else _copy(path, dest)
    elif not keep:
        os.remove(path)
    return os.path.basename(dest)


def _copy(src, dst):
    with open(src, "rb") as f, open(dst, "wb") as g:
        g.write(f.read())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=DEFAULT_DIR)
    ap.add_argument("--refs", nargs="*", default=DEFAULT_REFS, help="text files to repoint")
    ap.add_argument("--quality", type=int, default=85)
    ap.add_argument("--keep", action="store_true", help="keep the original files")
    args = ap.parse_args()

    renames = {}
    before = after = 0
    for fn in sorted(os.listdir(args.dir)):
        path = os.path.join(args.dir, fn)
        if not os.path.isfile(path) or fn.lower().endswith(".webp"):
            continue
        size = os.path.getsize(path)
        new = convert(path, args.quality, args.keep)
        if new:
            renames[fn] = new
            before += size
            after += os.path.getsize(os.path.join(args.dir, new))

    for ref in args.refs:
        with open(ref, encoding="utf-8") as f:
            text = f.read()
        for old, new in renames.items():
            text = text.replace(old, new)
        with open(ref, "w", encoding="utf-8", newline="\n") as f:
            f.write(text)

    print(f"converted {len(renames)} files: {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB")
    print(f"updated references in {len(args.refs)} file(s)")


if __name__ == "__main__":
    main()
