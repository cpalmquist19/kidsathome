#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Builds static/data/numbers_vs_operations/named_numbers.json for the
"Numbers VS. Operations" game.

The file has two parts:
  * "series": the Conway-Wechsler -illion names, a RULE that names 10^(3n+3)
    for every whole n (see static/js/numbers_vs_operations/names.js). It is
    gap-free up to (but not including) a googolplex.
  * "numbers": every other named number we could source, in ladder order.
    Entries with a "mag" can be compared by size with the series and each
    other. Entries without one sit in a growth-class "tier"; inside a tier
    the order is only the source's listing order (see "orderBasis").

Usage:  python scripts/build_numbers_vs_operations_data.py [--illion-max 999]
"""
import argparse
import json
import math
import re
import sys
from decimal import Decimal as D, getcontext
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from nvo_names import illion_name, DICTIONARY  # noqa: E402
import nvo_data  # noqa: E402

getcontext().prec = 60
getcontext().Emax = 999999999999999999
getcontext().Emin = -999999999999999999

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "static" / "data" / "numbers_vs_operations" / "named_numbers.json"

SOURCES = {
    "wp-names": "https://en.wikipedia.org/wiki/Names_of_large_numbers",
    "wp-large": "https://en.wikipedia.org/wiki/Large_numbers",
    "wp-skewes": "https://en.wikipedia.org/wiki/Skewes%27s_number",
    "mathworld-skewes": "https://mathworld.wolfram.com/SkewesNumber.html",
    "wp-moser": "https://en.wikipedia.org/wiki/Steinhaus%E2%80%93Moser_notation",
    "wp-rayo": "https://en.wikipedia.org/wiki/Rayo%27s_number",
    "gw-loader": "https://googology.fandom.com/wiki/Loader%27s_number",
    "gw-fish7": "https://googology.fandom.com/wiki/Fish_number_7",
    "gw-lngn": "https://googology.fandom.com/wiki/Large_Number_Garden_Number",
    "gw-list": "https://googology.fandom.com/wiki/List_of_googolisms",
    "gw-googological": "https://googology.fandom.com/wiki/Googological",
    "mrob-largenum": "http://www.mrob.com/pub/math/largenum.html",
    "bowerism": "https://sites.google.com/site/largenumbers/home/appendix/a/ulnl/bowerism_checklist",
    "bird-bowers": "https://mrob.com/users/chrisb/Bowers_Named_Numbers.pdf",
    "saibian-pgln": "https://www.sites.google.com/site/pointlesslargenumberstuff/home/l",
}

LOG3 = D(3).log10()
LOG10E = D(1) / D(10).ln()


# ------------------------------------------------------------ magnitudes
# mag = (L, T): apply log10 L times until the value drops below 10 -> T.
# Lexicographic order on (L, T) is size order.
def mag_num(x):
    x = D(x)
    L = 0
    while x >= 10:
        x = x.log10()
        L += 1
    return (L, float(x))


def P(m):  # 10 ** value
    return (m[0] + 1, m[1])


def m_pow10(e):  # 10 ** e, e a whole number or Decimal
    return P(mag_num(e))


def m_tower(n):  # 10 ^^ n
    return (n, 1.0)


def m_hyperE(n):  # E100#n = 10^10^...^100 with n tens
    return (n + 1, 2.0)


def m_illion_x(x):  # 10 ^ (3 * 10^x + 3), x whole
    return P(P(mag_num(D(x) + LOG3)))


def m_illion_k(k):  # same with x = 3 * 10^k
    return P(P(P(mag_num(D(k) + LOG3))))


def magjson(m):
    if m is None:
        return None
    return {"levels": str(m[0]), "top": round(m[1], 6)}


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def slug(s):
    out = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return out or "n"


# ------------------------------------------------------------ constructors
def entry(name, category, mag=None, value=None, aliases=(), definition=None,
          source="gw-list", confidence="defined", note=None, orderNote=None,
          orderBasis="computed", **extra):
    e = dict(name=name, aliases=list(aliases), category=category,
             value=value, definition=definition, source=source,
             confidence=confidence)
    if note:
        e["note"] = note
    if orderNote:
        e["orderNote"] = orderNote
    e["orderBasis"] = orderBasis
    e.update(extra)
    e["_mag"] = mag
    return e


def v_exact(v):
    return {"kind": "exact", "digits": str(v)}


def v_pow10(e):
    return {"kind": "pow10", "exponent": e if isinstance(e, dict) else str(e)}


def v_expr(text, approx=None):
    d = {"kind": "expression", "text": text}
    if approx:
        d["approx"] = approx
    return d


def v_tower(n):
    return {"kind": "tetration", "base": 10, "height": n}


def exact_mag(v):
    return mag_num(D(v))


def ls_name(exp):
    """Long-scale name for 10**exp, or None."""
    if exp < 9 or exp % 3:
        return None
    k = exp // 6
    if not 1 <= k <= 999:
        return None
    base = illion_name(k)
    if exp % 6 == 0:
        return base
    return base[:-len("illion")] + "illiard"


# ------------------------------------------------------------ numeric group
SMALL = [
    (2, "Two", []), (3, "Three", []), (4, "Four", []), (5, "Five", []),
    (6, "Six", []), (7, "Seven", []), (8, "Eight", []), (9, "Nine", []),
    (10, "Ten", []), (11, "Eleven", []), (12, "Twelve", ["Dozen"]),
    (13, "Thirteen", []), (14, "Fourteen", []), (15, "Fifteen", []),
    (16, "Sixteen", []), (17, "Seventeen", []), (18, "Eighteen", []),
    (19, "Nineteen", []), (20, "Twenty", ["Score"]),
    (30, "Thirty", []), (40, "Forty", []), (50, "Fifty", []),
    (60, "Sixty", []), (70, "Seventy", []), (80, "Eighty", []),
    (90, "Ninety", []), (100, "Hundred", []),
    (110, "Eleventy", []), (120, "Twelfty", ["Long hundred"]),
    (144, "Gross", []), (169, "Baker's gross", []),
    (196, "Poulter's gross", []), (480, "Short ream", []),
    (500, "Ream", []), (666, "Beast number", []), (1000, "Thousand", []),
    (1728, "Great gross", []), (2197, "Great Baker's gross", []),
    (2744, "Poulter's great gross", []), (10_000, "Myriad", []),
    (100_000, "Lakh", ["Hundred thousand"]), (10**7, "Crore", []),
]

# named powers of ten outside the -illion rule: (name, exponent, aliases)
POW10 = [
    ("Myllion", 8, []), ("Dialogue", 10, []), ("Byllion", 16, []),
    ("Guppy", 20, []), ("Tryllion", 32, []), ("Muryoutaisuu", 68, []),
    ("Ogol", 80, []), ("Gargoogol", 200, []), ("Googolchime", 1000, []),
    ("Googoltoll", 10_000, []), ("Googolgong", 100_000, []),
    ("Milliplexion", 1_000_000, []), ("Vigintyllion", 4_194_304, []),
    ("Nirabhilapya nirabhilapya parivarta", 7 * 2**122, []),
]

# 10 ^ (3 * 10^x + 3) for x = 120.. : -illions above the series cap
ILLION_X = [("Tetracontillion", 120), ("Pentacontillion", 150),
            ("Hexacontillion", 180), ("Heptacontillion", 210),
            ("Octacontillion", 240), ("Ennacontillion", 270),
            ("Hectillion", 300)]
# 10 ^ (3 * 10^(3 * 10^k) + 3)
ILLION_K = [
    ("Killillion", 3), ("Megillion", 6), ("Gigillion", 9),
    ("Terillion", 12), ("Petillion", 15), ("Exillion", 18),
    ("Zettillion", 21), ("Yottillion", 24), ("Xennillion", 27),
    ("Dakillion", 30), ("Hendillion", 33), ("Dokillion", 36),
    ("Tradakillion", 39), ("Tedakillion", 42), ("Pedakillion", 45),
    ("Exdakillion", 48), ("Zedakillion", 51), ("Yodakillion", 54),
    ("Nedakillion", 57), ("Ikillion", 60), ("Ikenillion", 63),
    ("Icodillion", 66), ("Ictrillion", 69), ("Icterillion", 72),
    ("Icpetillion", 75), ("Ikectillion", 78), ("Iczetillion", 81),
    ("Ikyotillion", 84), ("Icxenillion", 87), ("Trakillion", 90),
    ("Tekillion", 120), ("Pekillion", 150), ("Exakillion", 180),
    ("Zakillion", 210), ("Yokillion", 240), ("Nekillion", 270),
    ("Hotillion", 300), ("Botillion", 600), ("Trotillion", 900),
    ("Totillion", 1200), ("Potillion", 1500), ("Exotillion", 1800),
    ("Zotillion", 2100), ("Yootillion", 2400), ("Notillion", 2700),
    ("Kalillion", 3000), ("Dalillion", 6000), ("Tralillion", 9000),
    ("Talillion", 12000), ("Palillion", 15000), ("Exalillion", 18000),
    ("Zalillion", 21000), ("Yalillion", 24000), ("Nalillion", 27000),
    ("Dakalillion", 30000), ("Hotalillion", 300000),
    ("Mejillion", 3_000_000), ("Dakejillion", 30_000_000),
    ("Hotejillion", 300_000_000), ("Gijillion", 3_000_000_000),
    ("Astillion", 3 * 10**12), ("Lunillion", 3 * 10**15),
    ("Fermillion", 3 * 10**18), ("Jovillion", 3 * 10**21),
    ("Solillion", 3 * 10**24), ("Betillion", 3 * 10**27),
    ("Glocillion", 3 * 10**30), ("Gaxillion", 3 * 10**33),
    ("Supillion", 3 * 10**36), ("Versillion", 3 * 10**39),
    ("Multillion", 3 * 10**42),
]
# Alternative names for series terms 10^(3n+3): (name, n)
SERIES_ALIASES = (
    [("Millillion", 1000), ("Cenuntillion", 101), ("Duocentillion", 102),
     ("Centretillion", 103), ("Myrillion", 10**4), ("Micrillion", 10**6),
     ("Nanillion", 10**9), ("Picillion", 10**12), ("Femtillion", 10**15),
     ("Attillion", 10**18), ("Zeptillion", 10**21), ("Yoctillion", 10**24),
     ("Xonillion", 10**27), ("Vecillion", 10**30), ("Mecillion", 10**33),
     ("Duecillion", 10**36), ("Trecillion", 10**39),
     ("Tetrecillion", 10**42), ("Pentecillion", 10**45),
     ("Hexecillion", 10**48), ("Heptecillion", 10**51),
     ("Octecillion", 10**54), ("Ennecillion", 10**57),
     ("Icosillion", 10**60), ("Triacontillion", 10**90)])
# Names given without any definition for the number
NO_DEFINITION = [
    "Vekillion", "Mekillion", "Duekillion", "Trekillion", "Tetrekillion",
    "Pentekillion", "Hexekillion", "Heptekillion", "Octekillion",
    "Ennekillion", "Twentillion", "Triatwentillion", "Thirtillion",
    "Fortillion", "Fiftillion", "Sixtillion", "Seventillion", "Eightillion",
    "Nintillion", "Hundrillion", "Thousillion"]

TOWERS = [("Trialogue", 3), ("Tetralogue", 4), ("Pentalogue", 5),
          ("Hexalogue", 6), ("Heptalogue", 7), ("Octalogue", 8),
          ("Ennalogue", 9), ("Decker", 10), ("Endekalogue", 11),
          ("Dodekalogue", 12), ("Triadekalogue", 13),
          ("Tetradekalogue", 14), ("Giggol", 100), ("Chilialogue", 1000),
          ("Myrialogue", 10_000)]

# source-approximate values: name, mantissa, exponent, source note
APPROX = [
    ("Avogadro's number", 6.02214076, 23, "wp-large",
     "Particles per mole; exact by definition since 2019."),
    ("Eddington number", 1.57, 79, "wp-names",
     "Estimated protons in the observable universe."),
    ("Hundertime", 4.7, 219, "gw-list", "Value as listed by the source."),
    ("Googocci", 2.8, 523, "gw-list", "Value as listed by the source."),
    ("Hitchhiker's number", 2.7, 80588, "gw-list",
     "Value as listed by the source."),
    ("Ballium's number", 2.03542, 138_732_019_349, "gw-list",
     "Value as listed by the source."),
]


def build_numeric(illion_max):
    out = []
    for v, name, aliases in SMALL:
        out.append(entry(name, "everyday", exact_mag(v), v_exact(v),
                         aliases, source="wp-names"))
    for n in range(1, illion_max + 1):
        exp = 3 * n + 3
        aliases = []
        if n in DICTIONARY:
            aliases.append(DICTIONARY[n][1].capitalize())
        if n == 39:
            aliases += ["Novemtrigintillion",
                        "Shannon number (chess game-tree bound, ~10^120)"]
        ls = ls_name(exp)
        extra = {"shortScaleIndex": n,
                 "conwayWechsler": illion_name(n, dictionary=False)}
        if ls and ls != illion_name(n):
            extra["longScaleName"] = ls.capitalize()
        out.append(entry(illion_name(n).capitalize(), "illion",
                         m_pow10(exp), v_pow10(exp), aliases,
                         source="wp-names", **extra))
    for name, e, aliases in POW10:
        out.append(entry(name, "power-of-ten", m_pow10(e), v_pow10(e),
                         aliases))
    # exact big integers
    belph = 10**30 + 666 * 10**14 + 1
    out.append(entry("Belphegor's prime", "constant", exact_mag(belph),
                     v_exact(belph), source="gw-list",
                     definition="10^30 + 666*10^14 + 1"))
    import math as _m
    out.append(entry("Googoc", "googol-family", exact_mag(200**100),
                     v_exact(200**100), definition="200^100"))
    f200 = _m.factorial(200)
    out.append(entry("Faxul", "googol-family", exact_mag(f200),
                     v_exact(f200), definition="200!"))
    for name, m, e, src, note in APPROX:
        out.append(entry(name, "constant" if src != "gw-list" else
                         "googol-family",
                         P(mag_num(D(e) + D(m).log10())),
                         {"kind": "approx", "mantissa": m, "exponent": e},
                         source=src, note=note,
                         confidence="source-approx"
                         if src == "gw-list" else "defined"))
    out.append(entry("Googol", "googol", m_pow10(100), v_pow10(100),
                     source="wp-names",
                     note="Named by Milton Sirotta, nephew of Edward Kasner."))
    # googol-plex family and friends
    out.append(entry("Guppyplex", "googol-family", m_pow10(10**20),
                     v_pow10(v_pow10(20)), definition="10^guppy"))
    out.append(entry("Doppelgängion", "googol-family", m_pow10(10**68),
                     v_pow10(v_pow10(68)), confidence="reading-uncertain",
                     note="Source prints '10^1068'; read as 10^(10^68)."))
    out.append(entry("Googolplex", "googol", m_pow10(10**100),
                     v_pow10(v_pow10(100)), source="wp-names",
                     definition="10^googol",
                     note="Introduced in Kasner and Newman's 1940 book."))
    out.append(entry("Gargoogolplex", "googol-family",
                     P(mag_num(D(2) * D(10)**100)),
                     {"kind": "expression", "text": "googolplex squared"},
                     definition="googolplex^2"))
    # (10^100)! by Stirling; (200!)! likewise
    N = D(10) ** 100
    lb = N * (N.log10() - LOG10E) + (D(2) * D(math.pi) * N).log10() / 2
    out.append(entry("Googolbang", "googol-family", P(mag_num(lb)),
                     {"kind": "expression", "text": "(10^100)!"},
                     definition="googol factorial",
                     confidence="stirling-estimate"))
    N2 = D(f200)
    lb2 = N2 * (N2.log10() - LOG10E) + (D(2) * D(math.pi) * N2).log10() / 2
    out.append(entry("Kilofaxul", "googol-family", P(mag_num(lb2)),
                     {"kind": "expression", "text": "(200!)!"},
                     definition="faxul factorial",
                     confidence="stirling-estimate"))
    out.append(entry("Ecetonplex", "googol-family", m_pow10(10**303),
                     v_pow10(v_pow10(303)), definition="10^(10^303)"))
    # Skewes
    u = D(79).exp()
    s1 = P(P(mag_num(u * LOG10E - D("0.362"))))
    out.append(entry("Skewes's first number", "number-theory", s1,
                     v_expr("e^e^e^79", "10^10^10^34"),
                     aliases=["Skewes' number"], source="mathworld-skewes",
                     confidence="bound",
                     note="Skewes 1933, assuming the Riemann hypothesis. An "
                          "upper bound for where pi(x) first exceeds li(x), "
                          "not the crossover itself (best known crossover "
                          "is about 1.398e316)."))
    out.append(entry("Googolplexplex", "googol",
                     P(P(P(mag_num(100)))),
                     v_pow10(v_pow10(v_pow10(100))),
                     aliases=["Googolduplex", "Googolplexian (unofficial)"],
                     source="wp-names", definition="10^googolplex",
                     note="From the Conway and Guy 'N-plex' scheme."))
    out.append(entry("Skewes's second number", "number-theory",
                     P(P(P(mag_num(1000)))),
                     v_expr("10^10^10^10^3", "10^10^10^1000"),
                     source="mathworld-skewes", confidence="bound",
                     note="Skewes 1955, without the Riemann hypothesis. "
                          "MathWorld gives 10^10^10^10^3; the original "
                          "bound is often quoted as e^e^e^e^7.705, about "
                          "10^10^10^963."))
    for i, (name, k) in enumerate(ILLION_X):
        out.append(entry(name, "illion-extension", m_illion_x(k),
                         v_expr("10^(3*10^%d+3)" % k),
                         source="bowerism", confidence="source-defined"))
    for name, k in ILLION_K:
        out.append(entry(name, "illion-extension", m_illion_k(k),
                         v_expr("10^(3*10^(3*10^%d)+3)" % k),
                         source="bowerism", confidence="source-defined"))
    for name, h in TOWERS:
        extra = {}
        out.append(entry(name, "tetration", m_tower(h), v_tower(h),
                         definition="10↑↑%d" % h, source="gw-list"))
    out.append(entry("Bentley's number", "tetration", (9, 1.000000001),
                     v_expr("sum of 10↑↑i for i = 0 to 9"),
                     definition="sum of 10↑↑i, i = 0..9",
                     note="Just above Ennalogue (10↑↑9)."))
    for nm, idx in [("Googoltriplex", 4), ("Googolquadruplex", 5),
                    ("Googolnoniplex", 10)]:
        out.append(entry(nm, "googol", m_hyperE(idx),
                         v_expr("E100#%d" % idx), source="gw-list",
                         definition="E100#%d" % idx))
    out.append(entry("Grangol", "tetration", m_hyperE(100),
                     v_expr("E100#100"), definition="E100#100"))
    out.append(entry("Expofaxul", "googol-family", (150, 1.0),
                     v_expr("200!1"), confidence="order-estimated",
                     note="Listed between Grangol and Mega; size not given.",
                     orderBasis="source-order"))
    out.append(entry("Mega", "steinhaus-moser", (258, 1.0),
                     v_expr("2 in a circle (Steinhaus-Moser)",
                            "about 10^^258"),
                     aliases=["②"], source="wp-moser",
                     note="Steinhaus's name for 2 inside a circle."))
    out.append(entry("Tritri", "bowers", (7625597484987, 1.0),
                     v_expr("{3,3,3} = 3↑↑↑3 = 3↑↑7625597484987"),
                     source="bird-bowers", definition="{3,3,3}",
                     confidence="approx-height",
                     note="A tower of 7,625,597,484,987 threes; ranked as "
                          "a tower of that many tens."))
    out.append(entry("Googol-stack", "tetration", (10**100, 1.0),
                     v_expr("10↑↑10^100"), definition="10↑↑googol"))
    out.append(entry("Jaghanya Parīta Asaṃkhyāta", "tetration",
                     (10**136, 1.0), v_expr("about 10↑↑10^136"),
                     confidence="source-approx"))
    out.append(entry("Grand Faxul", "tetration", (10**379, 1.0),
                     v_expr("about 10↑↑10^379"),
                     confidence="source-approx"))
    return out


# ------------------------------------------------------------ rich notes
RICH = {
    "giggolplex": dict(source="wp-names", definition="10↑↑giggol",
                       note="10 tetrated to giggol."),
    "megiston": dict(source="wp-moser",
                     note="Steinhaus's name for 10 inside a circle."),
    "mosersnumber": dict(source="wp-moser", note=(
        "Leo Moser's number. Much larger than Mega and Megiston, "
        "'vanishingly small' next to Graham's number.")),
    "grahamsnumber": dict(source="wp-large", note=(
        "Ronald Graham, from a Ramsey-theory bound.")),
    "tree3": dict(source="wp-large",
                  note="Vastly larger than Graham's number."),
    "loadersnumber": dict(source="gw-loader", confidence="claimed-order",
                          note=("Ralph Loader, winner of the Bignum Bakeoff "
                                "(512-character program)."),
                          orderNote=("Googology Wiki says comparisons are "
                                     "hard; claims that it exceeds TREE(3) "
                                     "are unproven footnotes.")),
    "raysnumber": dict(source="wp-rayo", note=(
        "Agustin Rayo, MIT Big Number Duel, 26 January 2007.")),
    "rayosnumber": dict(source="wp-rayo", note=(
        "Agustin Rayo, MIT Big Number Duel, 26 January 2007.")),
    "fishnumber7": dict(source="gw-fish7", confidence="claimed-order",
                        note="Fish (Japanese googologist), October 2013.",
                        orderNote=("Built as an extension of Rayo's number; "
                                   "the wiki list places it before Rayo's "
                                   "number but the source gives no direct "
                                   "comparison.")),
    "largenumbergardennumber": dict(
        source="gw-lngn", confidence="claimed-order",
        note=("Coined by Googology Wiki user P-adic-daisuki-bot. The wiki "
              "calls it the largest well-defined googologism that is not "
              "a salad number.")),
}


def build_tiers():
    tiers = []
    for tid, label, items in nvo_data.TIERS:
        lst = []
        for it in items:
            name, d = (it, None) if isinstance(it, str) else it
            e = entry(name, "tier:" + tid, None, None, definition=d,
                      source="gw-list", orderBasis="tier-source-order")
            lst.append(e)
        tiers.append([tid, label, lst])
    return tiers


def merge_bowerism(numeric, tiers):
    by_tier = {t[0]: t[2] for t in tiers}
    index = {}
    for e in numeric:
        index[norm(e["name"])] = ("num", e)
        for a in e["aliases"]:
            index.setdefault(norm(a), ("num", e))
    for tid, lst in by_tier.items():
        for e in lst:
            index[norm(e["name"])] = ("tier", e, tid)
    # SSCG(3) right after TREE(3)
    b = by_tier["bachmann"]
    i = [norm(x["name"]) for x in b].index("tree3")
    sscg = entry("SSCG(3)", "tier:bachmann", None,
                 None, aliases=["Simple subcubic graph number"],
                 definition="Friedman's simple subcubic graph function at 3",
                 source="mrob-largenum", confidence="claimed-order",
                 orderBasis="tier-source-order",
                 orderNote="Listed after TREE(3) in the Mrob ordering; its "
                           "size next to the other entries here is not "
                           "verified.")
    b.insert(i + 1, sscg)
    index["sscg3"] = ("tier", sscg, "bachmann")

    after_num = {}  # numeric anchor norm -> [entries]
    last = None
    added = 0
    for line in nvo_data.BOWERISM:
        name, _, d = line.partition("|")
        d = d.strip() or None
        key = norm(name)
        target = nvo_data.ALIAS_OF.get(key, key)
        if target in index:
            hit = index[target]
            ent = hit[1]
            if ent.get("definition") is None and d:
                ent["definition"] = d
            ent.setdefault("sources", [])
            last = hit
            continue
        e = entry(name, "bowers", None, None, definition=d,
                  source="bowerism", orderBasis="anchored-to-neighbour")
        added += 1
        if last is None:
            by_tier["up-arrow"].insert(0, e)
            last = ("tier", e, "up-arrow")
        elif last[0] == "tier":
            lst = by_tier[last[2]]
            lst.insert(lst.index(last[1]) + 1, e)
            last = ("tier", e, last[2])
        else:
            after_num.setdefault(norm(last[1]["name"]), []).append(e)
            last = ("numchain", e, norm(last[1]["name"]))
        index[key] = last if last[0] != "numchain" else ("num", e)
    return after_num, added


UNSORTED_ANCHORS = [
    # (name, definition, "after"/"before", anchor)
    ("Hectekillillion", None, "after", "Killillion"),
    ("Millionduplex", None, "before", "Megillion"),
    ("Fzgoogolplex", None, "after", "Googolplexplex"),
    ("Megafaxul", None, "after", "Googolplexplex"),
    ("Ecetonduplex", None, "after", "Googolplexplex"),
    ("Googolduplexigong", None, "after", "Dakalillion"),
    ("Millitriplexion", None, "before", "Mejillion"),
    ("Metillion", None, "after", "Multillion"),
    ("Fzgargoogolplex", "googolduplex^googolduplex", "after",
     "Googoltriplex"),
    ("Ecetontriplex", None, "after", "Googoltriplex"),
    ("Gigafaxul", None, "after", "Googoltriplex"),
    ("Googoltriplexigong", None, "after", "Googoltriplex"),
]


def assemble(illion_max):
    numeric = build_numeric(illion_max)
    numeric.sort(key=lambda e: (e["_mag"][0], e["_mag"][1], e["name"]))
    for a, b in zip(numeric, numeric[1:]):
        assert a["_mag"] != b["_mag"] or a["orderBasis"] != "computed" \
            or b["orderBasis"] != "computed", (a["name"], b["name"])
    tiers = build_tiers()
    after_num, added = merge_bowerism(numeric, tiers)
    # unsorted names placed beside a computed neighbour
    names = {e["name"]: e for e in numeric}
    before_map, post_map = {}, {}
    for name, d, where, anchor in UNSORTED_ANCHORS:
        e = entry(name, "googol-family", None, None, definition=d,
                  confidence="size-class-only", orderBasis="anchored-to-neighbour",
                  note="The source names this number without giving its "
                       "size; placed beside its neighbour in the source "
                       "list.")
        assert anchor in names, anchor
        (before_map if where == "before" else post_map).setdefault(
            anchor, []).append(e)
    ladder = []
    for e in numeric:
        ladder += before_map.get(e["name"], [])
        ladder.append(e)
        ladder += post_map.get(e["name"], [])
        ladder += after_num.get(norm(e["name"]), [])
    tier_meta = []
    for tid, label, lst in tiers:
        tm = {"id": tid, "label": label, "count": len(lst)}
        if tid in nvo_data.TIER_NOTES:
            tm["note"] = nvo_data.TIER_NOTES[tid]
        tier_meta.append(tm)
        ladder += lst
    # rich notes + ill-defined flags
    for e in ladder:
        r = RICH.get(norm(e["name"]))
        if r:
            for k, v in r.items():
                e[k] = v
        if norm(e["name"]) in {norm(x) for x in nvo_data.ILL_DEFINED}:
            e["illDefined"] = True
            e["confidence"] = "ill-defined"
    return ladder, tier_meta, added


def finish(ladder):
    seen = {}
    for i, e in enumerate(ladder, start=1):
        e["order"] = i
        base = slug(e["name"])
        n = seen.get(base, 0)
        seen[base] = n + 1
        e["id"] = base if n == 0 else "%s-%d" % (base, n + 1)
        m = e.pop("_mag")
        e["mag"] = magjson(m)
        if e.get("value") is None:
            e.pop("value")
        if e.get("definition") is None:
            e.pop("definition", None)
        e["aliases"] = e["aliases"] or []
    ids = [e["id"] for e in ladder]
    assert len(ids) == len(set(ids))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--illion-max", type=int, default=999)
    args = ap.parse_args()

    ladder, tier_meta, added = assemble(args.illion_max)
    finish(ladder)

    n_cap = (10**100 - 4) // 3  # largest n with 10^(3n+3) < googolplex
    series = {
        "id": "illion",
        "rule": "The n-th name stands for 10^(3n+3). n=1 is million.",
        "firstN": "1",
        "lastN": str(n_cap),
        "lastName": illion_name(n_cap),
        "lastBelow": "googolplex (every -illion smaller than a googolplex)",
        "listedExplicitlyThroughN": args.illion_max,
        "nameFunction": "NVO.illionName(n) in "
                        "static/js/numbers_vs_operations/names.js",
        "comparison": "Magnitude of term n is mag(10^(3n+3)); merge it "
                      "with 'numbers' using each entry's 'mag'.",
        "aliasesAtN": [{"n": str(n), "name": name}
                       for name, n in SERIES_ALIASES],
    }
    doc = {
        "meta": {
            "game": "Numbers VS. Operations",
            "schemaVersion": 2,
            "count": len(ladder),
            "finalBoss": {"name": "Infinity", "symbol": "∞"},
            "magnitudes": (
                "mag = {levels, top}. Apply log10 'levels' times to reach a "
                "value 'top' in [1,10). Compare by levels, then top. "
                "Entries without a mag are in a growth-class tier; their "
                "order inside the tier is only the source's listing order."),
            "orderBasis": {
                "computed": "Size computed from the definition.",
                "source-order": "Placed by the source's listing; size not "
                                "given.",
                "tier-source-order": "Inside its growth class, in the "
                                     "Googology Wiki listing order.",
                "anchored-to-neighbour": "Placed next to the entry before "
                                         "it in the Bowers checklist.",
            },
            "tiers": tier_meta,
            "series": series,
            "valueKinds": {
                "exact": "Whole-number digits as a string.",
                "approx": "mantissa x 10^exponent.",
                "pow10": "10^exponent; exponent is a string or a nested "
                         "value.",
                "tetration": "base ^^ height.",
                "expression": "Symbolic definition.",
            },
            "scopeNotes": [
                "Compound English names (twenty-one, one hundred five) are "
                "not listed; only single-word names are.",
                "-illion names are a rule (see series), complete up to a "
                "googolplex. Above that, only the named landmarks listed "
                "here exist; the Conway-Wechsler rule keeps naming larger "
                "n forever, so there is no top.",
                "The googology community has never agreed a total order "
                "for the largest numbers. Tier entries are ordered by "
                "class, then by source listing.",
                "Numbers below 2 (zero, one, googolminex) are not listed.",
            ],
            "namesWithoutDefinition": NO_DEFINITION,
            "excluded": [
                {"name": "Fish numbers 1, 2, 5, 6",
                 "reason": "Definitions not verified."},
                {"name": "Busy Beaver numbers other than the named one",
                 "reason": "Named by function BB(n), not by a number name."},
                {"name": "Real-world quantities (Planck volumes, largest "
                         "known prime, Leviathan number)",
                 "reason": "Descriptions, not names; or values not "
                           "verified."},
            ],
            "sources": SOURCES,
        },
        "numbers": ladder,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("wrote", OUT, "entries:", len(ladder), "bowers added:", added)


if __name__ == "__main__":
    main()
