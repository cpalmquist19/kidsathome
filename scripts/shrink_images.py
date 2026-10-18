#!/usr/bin/env python3
"""
Shrink .webp images in a folder so the longest side is at most --max-size pixels.

- Every file is copied to --backup-dir first (never overwritten if already there),
  so the full-size versions are always recoverable.
- Images already small enough are left untouched.
- Animated WebP keeps all frames and timing.
- A file is only replaced if the shrunk version is actually smaller.

Usage:
    python scripts/shrink_images.py                       # 640 px, backup to image_originals/
    python scripts/shrink_images.py --max-size 512 --quality 80
    python scripts/shrink_images.py --dry-run             # report only, change nothing
"""
import argparse
import os
import shutil

from PIL import Image, ImageSequence

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DIR = os.path.join(ROOT, "static", "images", "alldimensions")
DEFAULT_BACKUP = os.path.join(ROOT, "image_originals", "alldimensions")


def scaled(size, max_size):
    w, h = size
    if max(w, h) <= max_size:
        return None
    r = max_size / max(w, h)
    return max(1, round(w * r)), max(1, round(h * r))


def shrink(src, dest_tmp, max_size, quality):
    """Write a shrunk copy to dest_tmp. Return False if no resize was needed."""
    with Image.open(src) as im:
        new_size = scaled(im.size, max_size)
        if not new_size:
            return False
        if getattr(im, "is_animated", False):
            frames, durations = [], []
            for frame in ImageSequence.Iterator(im):
                durations.append(frame.info.get("duration", 100))
                frames.append(frame.convert("RGBA").resize(new_size, Image.LANCZOS))
            frames[0].save(dest_tmp, "WEBP", save_all=True, append_images=frames[1:],
                           duration=durations, loop=im.info.get("loop", 0),
                           quality=quality, method=6)
        else:
            mode = "RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB"
            im.convert(mode).resize(new_size, Image.LANCZOS).save(
                dest_tmp, "WEBP", quality=quality, method=6)
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=DEFAULT_DIR)
    ap.add_argument("--backup-dir", default=DEFAULT_BACKUP)
    ap.add_argument("--max-size", type=int, default=640)
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not args.dry_run:
        os.makedirs(args.backup_dir, exist_ok=True)

    before = after = changed = 0
    for fn in sorted(os.listdir(args.dir)):
        if not fn.lower().endswith(".webp"):
            continue
        path = os.path.join(args.dir, fn)
        size = os.path.getsize(path)
        before += size

        backup = os.path.join(args.backup_dir, fn)
        if not args.dry_run and not os.path.exists(backup):
            shutil.copy2(path, backup)

        tmp = path + ".tmp"
        try:
            resized = shrink(path, tmp, args.max_size, args.quality)
        except Exception as exc:  # noqa: BLE001 - leave file as is
            print(f"  skip {fn}: {exc.__class__.__name__}: {exc}")
            resized = False
        if resized and os.path.getsize(tmp) < size:
            new_size = os.path.getsize(tmp)
            if args.dry_run:
                os.remove(tmp)
            else:
                os.replace(tmp, path)
            after += new_size
            changed += 1
        else:
            if os.path.exists(tmp):
                os.remove(tmp)
            after += size

    label = "would shrink" if args.dry_run else "shrunk"
    print(f"{label} {changed} files: {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB")
    if not args.dry_run:
        print(f"full-size backups in {args.backup_dir}")


if __name__ == "__main__":
    main()
