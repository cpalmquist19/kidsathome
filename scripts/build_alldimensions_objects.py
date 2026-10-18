#!/usr/bin/env python3
"""
Build static/data/alldimensions_objects.js (Gravity Lab catalog entries) from
scripts/alldimensions_items.json.

- size_light_years is treated as a DIAMETER -> radius (m) = ly * 9.4607e15 / 2
- mass = Sun's mean density (1.989e30 kg / (4/3 pi (6.96e8 m)^3)) * sphere volume
- values that overflow a float (>= 1e300) are emitted as {type:'log10'} wrappers
- symbolic sizes (omega, aleph, towers...) use {type:'omega'} radius like MEVE-1
- images are downloaded to static/images/alldimensions/ (re-runs skip existing files)
- every record that gets written has isAdded set to true in the JSON

Usage:
    python scripts/build_alldimensions_objects.py              # full run
    python scripts/build_alldimensions_objects.py --no-images  # skip downloads
"""
import argparse
import json
import math
import mimetypes
import os
import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ITEMS_JSON = os.path.join(ROOT, "scripts", "alldimensions_items.json")
OUT_JS = os.path.join(ROOT, "static", "data", "alldimensions_objects.js")
IMG_DIR = os.path.join(ROOT, "static", "images", "alldimensions")
IMG_URL_BASE = "/static/images/alldimensions"

LY_M = 9.4607304725808e15
SUN_DENSITY = 1.989e30 / ((4 / 3) * math.pi * 6.96e8 ** 3)  # ~1409 kg/m^3
LOG_DENSITY_VOL = math.log10(SUN_DENSITY * (4 / 3) * math.pi)
FLOAT_LIMIT = 300  # log10 above this is emitted as a log10 wrapper

# (type, label, icon, upper bound in ly, exclusive)
BANDS = [
    ("ad tiny", "Tiny (< 1 ly)", "🔬", 1),
    ("ad local", "Local (1 ly - 1,000 ly)", "☄️", 1e3),
    ("ad galactic", "Galactic (1e3 - 1e9 ly)", "🌌", 1e9),
    ("ad universal", "Universal (1e9 - 1e12 ly)", "🔭", 1e12),
    ("ad multiversal", "Multiversal (1e12 - 1e30 ly)", "🫧", 1e30),
    ("ad hyperversal", "Hyperversal (>= 1e30 ly)", "♾️", math.inf),
]
SYMBOLIC_BAND = ("ad transfinite", "Transfinite (symbolic)", "Ω")
SYMBOLIC_MASS_LOG10 = 1e12  # arbitrary finite stand-in, same trick as MEVE-1


def slugify(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")
    return s or "item"


def band_for(ly):
    for band in BANDS:
        if ly < band[3]:
            return band[0]
    return BANDS[-1][0]


def log10_ly(rec):
    """log10 of the size in ly. Handles the 'inf' rows by re-reading size_reference."""
    val = float(rec["size_light_years"])
    if math.isfinite(val):
        return math.log10(val)
    m = re.search(r"(?:(\d+(?:\.\d+)?)\s*[×x*]\s*)?10\s*\^\s*\(?(\d+)", rec["size_reference"])
    if not m:
        raise ValueError(f"cannot recover exponent for {rec['name']}: {rec['size_reference']!r}")
    coeff = float(m.group(1)) if m.group(1) else 1.0
    return math.log10(coeff) + int(m.group(2))


def js_num(v):
    return f"{v:.6e}"


def js_value(log10_val, display=None):
    """Plain number when it fits in a float, otherwise a log10 wrapper."""
    if log10_val < FLOAT_LIMIT:
        return js_num(10 ** log10_val)
    disp = f", display: {json.dumps(display, ensure_ascii=False)}" if display else ""
    return f"{{ type: 'log10', log10: {js_num(log10_val)}{disp} }}"


def fmt_log(prefix, unit, log10_val):
    exp = math.floor(log10_val)
    coeff = 10 ** (log10_val - exp)
    return f"{coeff:.2f}×10^{exp} {unit}"


def download(job):
    url, path = job
    try:
        r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
        r.raise_for_status()
        with open(path, "wb") as f:
            f.write(r.content)
        return path, None
    except Exception as exc:  # noqa: BLE001 - report and move on
        return path, str(exc)


def find_existing(key):
    if os.path.isdir(IMG_DIR):
        for fn in os.listdir(IMG_DIR):
            if os.path.splitext(fn)[0] == key:
                return fn
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-images", action="store_true")
    args = ap.parse_args()

    with open(ITEMS_JSON, encoding="utf-8") as f:
        items = json.load(f)

    os.makedirs(IMG_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUT_JS), exist_ok=True)

    used = set()
    entries = []  # (sort_key, js_text, rec)
    jobs = []
    image_for = {}
    for rec in items:
        key = "ad_" + slugify(rec["name"])
        base, n = key, 2
        while key in used:
            key, n = f"{base}_{n}", n + 1
        used.add(key)
        rec["_key"] = key

        if rec["image_url"]:
            existing = find_existing(key)
            if existing:
                image_for[key] = existing
            elif not args.no_images:
                ctype = mimetypes.guess_type(rec["image_url"].split("/revision/")[0])[0]
                ext = mimetypes.guess_extension(ctype or "") or ".png"
                fn = key + ext
                jobs.append((rec["image_url"], os.path.join(IMG_DIR, fn)))
                image_for[key] = fn

    failed = {}
    if jobs:
        with ThreadPoolExecutor(max_workers=12) as pool:
            for path, err in pool.map(download, jobs):
                if err:
                    failed[os.path.basename(path)] = err
        for fn in failed:
            image_for = {k: v for k, v in image_for.items() if v != fn}

    counts = {}
    for rec in items:
        key = rec["_key"]
        name = json.dumps(rec["name"], ensure_ascii=False)
        ref = rec["size_reference"].strip()
        desc = json.dumps(f"Size per All Dimensions wiki: {ref}", ensure_ascii=False)
        if rec["size_kind"] == "numeric":
            l = log10_ly(rec)
            log_r = l + math.log10(LY_M) - math.log10(2)
            log_m = LOG_DENSITY_VOL + 3 * log_r
            btype = band_for(10 ** l if l < 308 else math.inf)
            radius = js_value(log_r, fmt_log("r", "m", log_r))
            mass = js_value(log_m, fmt_log("m", "kg", log_m))
            icon = next(b[2] for b in BANDS if b[0] == btype)
            sort_key = (0, l)
        else:
            btype, icon = SYMBOLIC_BAND[0], SYMBOLIC_BAND[2]
            radius = (f"{{ type: 'omega', display: "
                      f"{json.dumps(ref or rec['size_light_years'], ensure_ascii=False)} }}")
            mass = (f"{{ type: 'log10', log10: {js_num(SYMBOLIC_MASS_LOG10)}, "
                    f"display: 'Transfinite (Sun density × ω³ volume)' }}")
            sort_key = (1, 0)
        counts[btype] = counts.get(btype, 0) + 1
        lines = [
            f"    '{key}': {{",
            f"        name: {name},",
            f"        mass: {mass},",
            f"        radius: {radius},",
            f"        icon: '{icon}',",
            f"        type: '{btype}',",
        ]
        if key in image_for:
            lines.append(f"        image: '{IMG_URL_BASE}/{image_for[key]}',")
        lines.append(f"        description: {desc}")
        lines.append("    },")
        entries.append((sort_key, "\n".join(lines), rec))

    entries.sort(key=lambda e: e[0])  # numeric ascending by size, symbolic last (stable)

    filters = [(b[0], b[1]) for b in BANDS] + [(SYMBOLIC_BAND[0], SYMBOLIC_BAND[1])]
    filters_js = ",\n".join(f"    ['{t}', {json.dumps(lbl, ensure_ascii=False)}]" for t, lbl in filters)
    out = (
        "// Generated by scripts/build_alldimensions_objects.py - do not edit by hand.\n"
        "// Sun-density mass, diameter = wiki size in light years.\n"
        "window.ALLDIMENSIONS_DATA = {\n"
        + "\n".join(e[1] for e in entries)
        + "\n};\n\nwindow.ALLDIMENSIONS_FILTERS = [\n" + filters_js + "\n];\n"
    )
    with open(OUT_JS, "w", encoding="utf-8", newline="\n") as f:
        f.write(out)

    for _, _, rec in entries:
        rec["isAdded"] = True
        rec.pop("_key", None)
    with open(ITEMS_JSON, "w", encoding="utf-8", newline="") as f:
        f.write(json.dumps(items, indent=2, ensure_ascii=False))

    print(f"wrote {len(entries)} entries -> {OUT_JS}")
    for t, _ in filters:
        print(f"  {t}: {counts.get(t, 0)}")
    print(f"images: {len(image_for)} linked, {len(failed)} failed, "
          f"{sum(1 for r in items if not r['image_url'])} had no image")
    for fn, err in failed.items():
        print(f"  FAILED {fn}: {err}")


if __name__ == "__main__":
    main()
