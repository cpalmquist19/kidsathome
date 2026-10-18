#!/usr/bin/env python3
"""
Scrape alldimensions.fandom.com via the MediaWiki API and output every item whose
size can be resolved to a light-year value (or a unitless / symbolic value, which is
treated as light years).

Output: alldimensions_items.csv / .json with
    url, name, image_url, size_reference (raw wiki text), size_light_years, size_kind

size_kind is "numeric" (a real number, e.g. 8.9e19) or "symbolic" (things like
"Omega to the power of Omega" or power towers, kept as text and sorted last).

Usage:
    pip install requests
    python alldimensions_scraper.py                 # full run
    python alldimensions_scraper.py --limit 200     # quick test on first 200 titles
    python alldimensions_scraper.py --cache pages.json   # reuse downloaded pages on re-runs
    python alldimensions_scraper.py --probe Metaverse    # show fields + parsed size for one page

How a size is decided (first rule that works, checked per infobox field in SIZE_FIELDS):
  1. A number with a real unit (ly, km, parsecs, ...). First one in the text wins, so for
     "89 Quintillion ly - 128 Quintillion ly" the result is 89 Quintillion ly.
  2. "If A was the size of U, B would be the size of V"  ->  size(V) * size(A) / size(U)
  3. "<multiplier> [[Other Item]]" (e.g. "30 [[Neptune]]s") -> multiplier * size(Other Item)
  4. Symbolic / transfinite / tower expressions (Omega^Omega, 10^10^100, infinity ...)
     -> kept as text, treated as light years.
  5. A bare number with NO unit (e.g. "1.10x10^20", "89 Quintillion") -> light years.
     Weights/times/etc. (lbs, kg, years, ...) are NOT accepted here.
Anything else is excluded.

Sizes are stored internally as log10(light years) so 10^100 doesn't overflow.
"""
import argparse
import csv
import json
import math
import os
import re
import sys
import time
from urllib.parse import quote

import requests

API = "https://alldimensions.fandom.com/api.php"
WIKI = "https://alldimensions.fandom.com/wiki/"
HEADERS = {"User-Agent": "AllDimensionsSizeScraper/1.1 (personal data project)"}

SIZE_FIELDS = ["size", "scale", "diameter", "length", "size_reference", "size reference"]
IMAGE_FIELDS = ["image", "image1", "img"]

LOG_M_PER_LY = math.log10(9.4607e15)

# unit -> log10(meters per unit)
UNITS_M = {
    "light years": LOG_M_PER_LY, "light year": LOG_M_PER_LY,
    "light-years": LOG_M_PER_LY, "light-year": LOG_M_PER_LY, "ly": LOG_M_PER_LY,
    "parsecs": math.log10(3.0857e16), "parsec": math.log10(3.0857e16), "pc": math.log10(3.0857e16),
    "kiloparsecs": math.log10(3.0857e19), "kiloparsec": math.log10(3.0857e19), "kpc": math.log10(3.0857e19),
    "megaparsecs": math.log10(3.0857e22), "megaparsec": math.log10(3.0857e22), "mpc": math.log10(3.0857e22),
    "gigaparsecs": math.log10(3.0857e25), "gigaparsec": math.log10(3.0857e25), "gpc": math.log10(3.0857e25),
    "astronomical units": math.log10(1.496e11), "astronomical unit": math.log10(1.496e11), "au": math.log10(1.496e11),
    "kilometers": 3.0, "kilometres": 3.0, "kilometer": 3.0, "kilometre": 3.0, "km": 3.0,
    "meters": 0.0, "metres": 0.0, "meter": 0.0, "metre": 0.0, "m": 0.0,
    "miles": math.log10(1609.344), "mile": math.log10(1609.344), "mi": math.log10(1609.344),
}
UNIT_RE = "|".join(re.escape(u) for u in sorted(UNITS_M, key=len, reverse=True))

MAGNITUDES = {
    "thousand": 3, "million": 6, "billion": 9, "trillion": 12, "quadrillion": 15,
    "quintillion": 18, "sextillion": 21, "septillion": 24, "octillion": 27,
    "nonillion": 30, "decillion": 33, "undecillion": 36, "duodecillion": 39,
    "googol": 100,
}
MAG_RE = "|".join(sorted(MAGNITUDES, key=len, reverse=True))

# Words/units that mean "this number is NOT a size" (so a bare number followed by them is rejected)
BAD = (r"lbs?|pounds?|kg|kilograms?|grams?|g|tons?|tonnes?|ounces?|oz|years?|yrs?|days?|"
       r"seconds?|sec|hours?|minutes?|dimension\w*|percent|%|degrees|kelvin")

NUM = r"(\d+(?:\.\d+)?)"
NOT_AFTER = r"(?<![\w.^↑])"          # don't start a number in the middle of a word / tower
EXP = r"(?:(?:[x×*]|times)\s*10\s*\^\s*\(?\s*(-?\d+)\s*\)?|e([+-]?\d+))?"

# "89 Quintillion light years", "1.5 x 10^30 km", "3e26 m"
RE_ABS = re.compile(rf"{NOT_AFTER}{NUM}\s*{EXP}\s*({MAG_RE})?\s*({UNIT_RE})\b", re.I)
# "10^100 light years"
RE_POW = re.compile(
    rf"{NOT_AFTER}10\s*\^\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s*({MAG_RE})?\s*({UNIT_RE})\b", re.I)
# Unitless versions (treated as light years). Reject weights/times and towers.
RE_POW_NOUNIT = re.compile(
    rf"{NOT_AFTER}10\s*\^\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?(?![\w^↑]|\.\d)"
    rf"(?!\s*(?:{MAG_RE}|{BAD})(?![A-Za-z]))", re.I)
RE_NOUNIT = re.compile(
    rf"{NOT_AFTER}{NUM}\s*{EXP}\s*({MAG_RE})?(?![A-Za-z\d^↑])"
    rf"(?!\s*(?:{MAG_RE}|{BAD})(?![A-Za-z]))", re.I)

# Symbolic / transfinite / tower expressions
RE_SYM = re.compile(
    r"omega|Ω|ω|ℵ|aleph|infinit|∞|to the power|tetrat|pentat|graham|\btree\(|rayo|busy beaver|"
    r"googolplex|epsilon|↑|\^\^|\d\s*\^\s*\(?\s*\d+(?:\.\d+)?\s*\)?\s*\^|\^\s*\(?\s*[A-Za-zΩωℵ]",
    re.I)

# "If an Ummm.... was the size of an universe, AHHH would be the size of a qazaverse"
RE_IF = re.compile(
    r"if\s+(?:an?\s+|the\s+)?(?:\[\[)?(?P<a>[^\]\[,]+?)(?:\]\])?\s+(?:was|were|is)\s+(?:the\s+)?size\s+of\s+"
    r"(?:an?\s+|the\s+)?(?:\[\[)?(?P<u>[^\]\[,]+?)(?:\]\])?\s*,\s*.+?would\s+be\s+(?:the\s+)?size\s+of\s+"
    r"(?:an?\s+|the\s+)?(?:\[\[)?(?P<v>[^\]\[,.]+?)(?:\]\])?\s*[.!]?\s*$",
    re.I | re.S,
)
RE_LINK = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]")


class Sym(str):
    """A size that can't be reduced to a finite number (Omega^Omega, towers, infinity...)."""


# --------------------------------------------------------------------------- filters
def keep_name(name: str) -> bool:
    n = name.strip()
    if not n:
        return False
    low = n.lower()
    if low.endswith(".verse"):          # .verse files (NOT names like ALLCAPPSVERSE)
        return False
    if "user blog:" in low or re.search(r"\bblog\b", low):
        return False
    if not re.search(r"[^\W\d_]", n):   # needs at least one letter: drops ',3', '(*^%^&', '12345'
        return False
    return True


# --------------------------------------------------------------------------- parsing
def clean(text: str) -> str:
    text = re.sub(r"<ref[^>]*?/>|<ref.*?</ref>", "", text, flags=re.S | re.I)
    text = re.sub(r"<sup>\s*(-?\d+)\s*</sup>", r"^\1", text, flags=re.I)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"<br\s*/?>", " ", text, flags=re.I)
    text = re.sub(r"(?<=\d),(?=\d{3})", "", text)               # 1,000,000 -> 1000000
    text = re.sub(r"(?<=\d),(?=\d{1,2}(?!\d))", ".", text)      # typo'd decimal: 1,10x10^20 -> 1.10x10^20
    text = text.replace("'''", "").replace("''", "")
    return text


def plain(text: str) -> str:
    text = RE_LINK.sub(lambda m: m.group(1), clean(text))
    text = re.sub(r"<[^>]+>|\{\{[^}]*\}\}", "", text)
    return re.sub(r"\s+", " ", text).strip()


def _num_to_log(num, exp10, e, mag):
    val = float(num)
    if val <= 0:
        return None
    log_val = math.log10(val)
    if exp10:
        log_val += int(exp10)
    elif e:
        log_val += int(e)
    if mag:
        log_val += MAGNITUDES[mag.lower()]
    return log_val


def parse_absolute(text: str):
    """Number with a real unit -> log10(light years), or None."""
    t = clean(text)
    m = RE_POW.search(t)
    if m:
        log_val = float(m.group(1))
        if m.group(2):
            log_val += MAGNITUDES[m.group(2).lower()]
        return log_val + UNITS_M[m.group(3).lower()] - LOG_M_PER_LY
    m = RE_ABS.search(t)
    if m:
        num, exp10, e, mag, unit = m.groups()
        lv = _num_to_log(num, exp10, e, mag)
        if lv is not None:
            return lv + UNITS_M[unit.lower()] - LOG_M_PER_LY
    return None


def parse_unitless(text: str):
    """Bare number with no unit -> treated as light years. log10(ly) or None."""
    t = clean(text)
    m = RE_POW_NOUNIT.search(t)
    if m:
        return float(m.group(1))
    m = RE_NOUNIT.search(t)
    if m:
        num, exp10, e, mag = m.groups()
        return _num_to_log(num, exp10, e, mag)
    return None


def parse_symbolic(text: str):
    t = plain(text)
    if RE_SYM.search(t):
        return t[:200]
    return None


def norm_title(s: str) -> str:
    s = s.replace("_", " ").strip().lower()
    return re.sub(r"^(an?|the)\s+", "", s)


def usable(v):
    return bool(v) and not v.strip().startswith("{{{")


class Resolver:
    def __init__(self, pages):
        self.pages = pages  # title -> {"fields": {...}, ...}
        self.index = {norm_title(t): t for t in pages}
        self.memo = {}
        self.source = {}    # title -> infobox field the size came from

    def lookup(self, name):
        k = norm_title(name)
        if k in self.index:
            return self.index[k]
        for suffix in ("'s", "es", "s"):          # "Neptunes" -> "neptune"
            if k.endswith(suffix) and k[: -len(suffix)] in self.index:
                return self.index[k[: -len(suffix)]]
        return None

    def size_log_ly(self, title, stack=()):
        """float (log10 ly) | Sym | None"""
        if title in self.memo:
            return self.memo[title]
        if title in stack:                         # cycle
            return None
        stack = stack + (title,)
        result = None
        for field in SIZE_FIELDS:
            raw = self.pages[title]["fields"].get(field)
            if not usable(raw):
                continue
            result = self._from_text(raw, stack)
            if result is not None:
                self.source[title] = field
                break
        self.memo[title] = result
        return result

    def _from_text(self, raw, stack):
        # 1. number with a real unit
        v = parse_absolute(raw)
        if v is not None:
            return v

        # 2. "If A was the size of U, B would be the size of V"
        m = RE_IF.search(plain(raw))
        if m:
            a, u, v_ = (self.lookup(m.group(g)) for g in ("a", "u", "v"))
            if a and u and v_:
                sa, su, sv = (self.size_log_ly(x, stack) for x in (a, u, v_))
                if isinstance(sv, Sym) and None not in (sa, su):
                    return Sym(str(sv))
                if None not in (sa, su, sv) and not any(isinstance(x, Sym) for x in (sa, su, sv)):
                    return sv + sa - su

        # 3. "<multiplier> [[Other Item]]"
        t = clean(raw)
        lm = RE_LINK.search(t)
        if lm:
            other = self.lookup(lm.group(1))
            if other:
                base = self.size_log_ly(other, stack)
                if base is not None:
                    before = t[: lm.start()]
                    mm = re.search(rf"{NUM}\s*(?:x\s*)?({MAG_RE})?\s*$", before, re.I)
                    if isinstance(base, Sym):
                        return Sym(f"{mm.group(0).strip()} x {base}" if mm else str(base))
                    mult = 0.0
                    if mm:
                        mval = float(mm.group(1))
                        if mval <= 0 or math.isinf(mval):   # "0 [[X]]" etc. -> not a usable multiplier
                            return None
                        mult = math.log10(mval)
                        if mm.group(2):
                            mult += MAGNITUDES[mm.group(2).lower()]
                    return base + mult

        # 4. symbolic / transfinite / tower -> kept as text, treated as light years
        sym = parse_symbolic(raw)
        if sym:
            return Sym(sym)

        # 5. bare number, no unit -> light years
        return parse_unitless(raw)


def fmt_ly(log_val):
    e = math.floor(log_val)
    return f"{10 ** (log_val - e):.4g}e{e}"


def infobox_fields(wikitext):
    fields = {}
    for m in re.finditer(
        r"^\s*\|\s*([\w \-]+?)\s*=\s*(.*?)(?=^\s*\|\s*[\w \-]+?\s*=|^\s*\}\}|\Z)",
        wikitext, re.M | re.S,
    ):
        fields[m.group(1).strip().lower()] = m.group(2).strip()
    return fields


def image_filename(fields):
    for f in IMAGE_FIELDS:
        v = fields.get(f, "")
        if not usable(v):
            continue
        v = plain(v.splitlines()[0]).split("|")[0].strip()
        v = re.sub(r"^(file|image):", "", v, flags=re.I).strip()
        if v:
            return v
    return ""


# --------------------------------------------------------------------------- API
def api(session, **params):
    params.update(format="json", formatversion=2)
    for attempt in range(5):
        try:
            r = session.get(API, params=params, headers=HEADERS, timeout=60)
            r.raise_for_status()
            return r.json()
        except Exception as exc:  # noqa: BLE001
            wait = 2 ** attempt
            print(f"  request failed ({exc}); retry in {wait}s", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError("API unreachable after retries")


def all_titles(session, limit=None):
    titles, cont = [], {}
    while True:
        data = api(session, action="query", list="allpages", apnamespace=0,
                   apfilterredir="nonredirects", aplimit=500, **cont)
        titles += [p["title"] for p in data["query"]["allpages"]]
        print(f"  listed {len(titles)} titles", file=sys.stderr)
        if limit and len(titles) >= limit:
            return titles[:limit]
        if "continue" not in data:
            return titles
        cont = data["continue"]
        time.sleep(0.2)


def fetch_pages(session, titles):
    pages = {}
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        data = api(session, action="query", titles="|".join(batch), prop="revisions|pageimages",
                   rvprop="content", rvslots="main", piprop="original")
        for p in data["query"]["pages"]:
            if p.get("missing") or "revisions" not in p:
                continue
            text = p["revisions"][0]["slots"]["main"]["content"]
            fields = infobox_fields(text)
            pages[p["title"]] = {
                "fields": fields,
                "image_file": image_filename(fields),
                "page_image": (p.get("original") or {}).get("source", ""),
            }
        print(f"  fetched {min(i + 50, len(titles))}/{len(titles)}", file=sys.stderr)
        time.sleep(0.3)
    return pages


def resolve_images(session, filenames):
    """infobox image file name -> direct CDN url (normalized-name -> url)"""
    urls = {}
    names = sorted({n for n in filenames if n})
    for i in range(0, len(names), 50):
        batch = names[i:i + 50]
        data = api(session, action="query", titles="|".join("File:" + n for n in batch),
                   prop="imageinfo", iiprop="url")
        for p in data["query"]["pages"]:
            ii = p.get("imageinfo")
            if ii:
                key = re.sub(r"^file:", "", p["title"], flags=re.I).replace("_", " ").strip().lower()
                urls[key] = ii[0]["url"]
        time.sleep(0.3)
    return urls


# --------------------------------------------------------------------------- excluded-list helpers
RE_WEIGHT = re.compile(
    rf"\d\s*(?:{MAG_RE})?\s*(?:lbs?|pounds?|kg|kilograms?|tons?|tonnes?|grams?|ounces?|oz)\b", re.I)


def diagnose(info):
    """Why a page with a kept name had no resolvable size. Returns (reason, raw_size_text)."""
    fields = info["fields"]
    raw_fields = {f: fields[f] for f in SIZE_FIELDS if usable(fields.get(f))}
    if not raw_fields:
        return "no size field", ""
    raw = plain(next(iter(raw_fields.values())))
    text = clean(" ".join(raw_fields.values()))
    if RE_WEIGHT.search(text):
        return "weight only (no size)", raw
    links = [m.group(1) for m in RE_LINK.finditer(text)]
    if links:
        return "references other item(s) with no resolvable size: " + ", ".join(links[:5]), raw
    return "size text has no recognizable number/unit", raw


# --------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, help="only process the first N titles (testing)")
    ap.add_argument("--probe", help="show infobox fields + parsed size for one page and exit")
    ap.add_argument("--cache", help="JSON file to save/reuse downloaded page data")
    ap.add_argument("--out", default="alldimensions_items")
    args = ap.parse_args()
    s = requests.Session()

    if args.probe:
        data = api(s, action="query", titles=args.probe, prop="revisions", rvprop="content", rvslots="main")
        text = data["query"]["pages"][0]["revisions"][0]["slots"]["main"]["content"]
        fields = infobox_fields(text)
        print("PARSED FIELDS:", json.dumps(fields, indent=2, ensure_ascii=False)[:3000])
        r = Resolver({args.probe: {"fields": fields}})
        v = r.size_log_ly(args.probe)
        shown = "unresolved (would be excluded)" if v is None else (str(v) if isinstance(v, Sym) else fmt_ly(v) + " ly")
        print(f"\nSIZE (no hopping, from field '{r.source.get(args.probe)}'): {shown}")
        print("IMAGE FILE:", image_filename(fields))
        return

    if args.cache and os.path.exists(args.cache):
        print(f"Loading cached pages from {args.cache}", file=sys.stderr)
        with open(args.cache, encoding="utf-8") as f:
            pages = json.load(f)
    else:
        print("Listing titles...", file=sys.stderr)
        titles = all_titles(s, args.limit)
        print("Fetching page content...", file=sys.stderr)
        pages = fetch_pages(s, titles)
        if args.cache:
            with open(args.cache, "w", encoding="utf-8") as f:
                json.dump(pages, f, ensure_ascii=False)

    resolver = Resolver(pages)

    kept, excluded = [], []          # excluded: (title, info, reason, raw_size_text)
    for title, info in pages.items():
        if not keep_name(title):
            _, raw0 = diagnose(info)
            excluded.append((title, info, "name filtered", raw0))
            continue
        err = None
        try:
            val = resolver.size_log_ly(title)
            if isinstance(val, float) and not math.isfinite(val):
                val = None
        except (ValueError, OverflowError, ZeroDivisionError) as exc:
            print(f"  skipping {title!r}: could not parse size ({exc})", file=sys.stderr)
            val, err = None, str(exc)
        if val is None:
            reason, raw0 = diagnose(info)
            excluded.append((title, info, f"parse error: {err}" if err else reason, raw0))
            continue
        raw = info["fields"].get(resolver.source.get(title, ""), "")
        kept.append((title, info, val, plain(raw)))

    print("Resolving image URLs...", file=sys.stderr)
    img_urls = resolve_images(
        s, [info["image_file"] for _, info, _, _ in kept] + [info["image_file"] for _, info, _, _ in excluded])

    def pick_image(info):
        fn = info["image_file"]
        return (img_urls.get(fn.replace("_", " ").strip().lower(), "") if fn else "") \
            or info["page_image"] \
            or (WIKI + "Special:FilePath/" + quote(fn.replace(" ", "_")) if fn else "")

    rows = []
    for title, info, val, raw in kept:
        fn = info["image_file"]
        image = (img_urls.get(fn.replace("_", " ").strip().lower(), "") if fn else "") \
            or info["page_image"] \
            or (WIKI + "Special:FilePath/" + quote(fn.replace(" ", "_")) if fn else "")
        symbolic = isinstance(val, Sym)
        rows.append({
            "url": WIKI + quote(title.replace(" ", "_")),
            "name": title,
            "image_url": image,
            "size_reference": raw,
            "size_light_years": str(val) if symbolic else fmt_ly(val),
            "size_kind": "symbolic" if symbolic else "numeric",
            "_sort": math.inf if symbolic else val,
        })
    rows.sort(key=lambda r: (r["_sort"], r["name"].lower()))

    cols = ["url", "name", "image_url", "size_reference", "size_light_years", "size_kind"]
    with open(args.out + ".csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    with open(args.out + ".json", "w", encoding="utf-8") as f:
        json.dump([{k: r[k] for k in cols} for r in rows], f, indent=2, ensure_ascii=False)
    # ---- excluded items, for spot-checking
    ex_rows = []
    for title, info, reason, raw in excluded:
        ex_rows.append({
            "url": WIKI + quote(title.replace(" ", "_")),
            "name": title,
            "image_url": pick_image(info),
            "reason": reason,
            "size_reference": raw,
            "size_fields": {f: plain(info["fields"][f]) for f in SIZE_FIELDS if usable(info["fields"].get(f))},
        })
    ex_rows.sort(key=lambda r: (r["reason"].startswith("name filtered"), r["reason"], r["name"].lower()))
    ex_cols = ["url", "name", "image_url", "reason", "size_reference"]
    with open(args.out + "_excluded.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=ex_cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(ex_rows)
    with open(args.out + "_excluded.json", "w", encoding="utf-8") as f:
        json.dump(ex_rows, f, indent=2, ensure_ascii=False)

    by_reason = {}
    for r in ex_rows:
        key = r["reason"].split(":")[0]
        by_reason[key] = by_reason.get(key, 0) + 1
    print(f"Done: {len(rows)} items kept ({sum(r['size_kind'] == 'symbolic' for r in rows)} symbolic), "
          f"{len(ex_rows)} excluded -> {args.out}_excluded.csv/.json")
    for k, n in sorted(by_reason.items(), key=lambda kv: -kv[1]):
        print(f"    {n:6}  {k}")

# python alldimensions_scraper.py --cache pages.json

if __name__ == "__main__":
    main()