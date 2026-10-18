#!/usr/bin/env python3
"""
Copy today's downloaded images into static/images/Schedulatoradux, skipping
byte-identical duplicates.

- Only image files modified or created today (local time) in the source folder are considered.
- Duplicates are detected by content (size first, then SHA-256), so "image (1).png"
  and "image.png" collapse to one. The copy with the shortest/cleanest name wins.
- Originals are never moved or changed; files are only copied.
- Copies are named Schedulatoradux1, Schedulatoradux2, ... (oldest download first),
  continuing after the highest number already in the destination.
- A file already in the destination with identical content is not copied again,
  so the script is safe to re-run.

Usage:
    python scripts/import_schedulatoradux_images.py --dry-run
    python scripts/import_schedulatoradux_images.py
    python scripts/import_schedulatoradux_images.py --src D:\\Other --date 2026-10-17
"""
import argparse
import hashlib
import os
import re
import shutil
from collections import defaultdict
from datetime import date, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SRC = os.path.join(os.path.expanduser("~"), "Downloads")
DEFAULT_DEST = os.path.join(ROOT, "static", "images", "Schedulatoradux")
PREFIX = "Schedulatoradux"
NAME_RE = re.compile(rf"^{PREFIX}(\d+)\.[^.]+$")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".avif", ".tif", ".tiff", ".ico"}


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def is_from_day(path, day):
    st = os.stat(path)
    return any(datetime.fromtimestamp(t).date() == day for t in (st.st_mtime, st.st_ctime))


def todays_images(src, day):
    for fn in os.listdir(src):
        path = os.path.join(src, fn)
        if os.path.isfile(path) and os.path.splitext(fn)[1].lower() in IMAGE_EXTS and is_from_day(path, day):
            yield path


def group_by_content(paths):
    """Return {hash: [paths]}; only hashes files that share a size with another."""
    by_size = defaultdict(list)
    for p in paths:
        by_size[os.path.getsize(p)].append(p)
    groups = {}
    for size, same_size in by_size.items():
        if len(same_size) == 1:
            groups[f"size-{size}-{same_size[0]}"] = same_size
            continue
        for p in same_size:
            groups.setdefault(sha256(p), []).append(p)
    return groups


def preferred(paths):
    """Shortest name first (drops ' (1)' copies), then oldest."""
    return sorted(paths, key=lambda p: (len(os.path.basename(p)), os.path.getmtime(p), p))[0]


def next_number(dest_dir):
    """One past the highest Schedulatoradux{n} already in dest_dir."""
    highest = 0
    if os.path.isdir(dest_dir):
        for fn in os.listdir(dest_dir):
            m = NAME_RE.match(fn)
            if m:
                highest = max(highest, int(m.group(1)))
    return highest + 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=DEFAULT_SRC)
    ap.add_argument("--dest", default=DEFAULT_DEST)
    ap.add_argument("--date", default=None, help="YYYY-MM-DD (default: today)")
    ap.add_argument("--dry-run", action="store_true", help="show what would happen without copying")
    args = ap.parse_args()

    day = date.fromisoformat(args.date) if args.date else date.today()
    paths = list(todays_images(args.src, day))
    groups = group_by_content(paths)

    existing = {}
    if os.path.isdir(args.dest):
        for fn in os.listdir(args.dest):
            p = os.path.join(args.dest, fn)
            if os.path.isfile(p):
                existing[sha256(p)] = fn

    if not args.dry_run:
        os.makedirs(args.dest, exist_ok=True)

    number = next_number(args.dest)
    copied = dup_in_src = already_there = 0
    # oldest first, so numbering follows the order the images were downloaded
    for digest, members in sorted(groups.items(), key=lambda kv: (os.path.getmtime(preferred(kv[1])), os.path.basename(preferred(kv[1])))):
        keep = preferred(members)
        dup_in_src += len(members) - 1
        for extra in members:
            if extra != keep:
                print(f"  duplicate  {os.path.basename(extra)}  (same as {os.path.basename(keep)})")

        content_hash = digest if len(digest) == 64 else sha256(keep)
        if content_hash in existing:
            already_there += 1
            print(f"  present    {os.path.basename(keep)}  (already in destination as {existing[content_hash]})")
            continue

        name = f"{PREFIX}{number}{os.path.splitext(keep)[1].lower()}"
        number += 1
        print(f"  {'would copy' if args.dry_run else 'copy      '} {os.path.basename(keep)} -> {name}")
        if not args.dry_run:
            shutil.copy2(keep, os.path.join(args.dest, name))
        existing[content_hash] = name
        copied += 1

    verb = "would copy" if args.dry_run else "copied"
    print(f"\n{len(paths)} images from {day} in {args.src}")
    print(f"{verb} {copied} unique | {dup_in_src} duplicates skipped | {already_there} already in destination")
    print(f"destination: {args.dest}")


if __name__ == "__main__":
    main()
