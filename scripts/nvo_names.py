"""
Conway-Wechsler "-illion" names for the Numbers VS. Operations game.

illion_name(n) names 10**(3*n + 3) for any whole n >= 1 (n=1 is million).
Mirrors static/js/numbers_vs_operations/names.js; scripts/check_nvo_names.py
cross-checks the two.
"""

SPECIAL = ["million", "billion", "trillion", "quadrillion", "quintillion",
           "sextillion", "septillion", "octillion", "nonillion"]
UNITS = {1: "un", 2: "duo", 3: "tre", 4: "quattuor", 5: "quin", 6: "se",
         7: "septe", 8: "octo", 9: "nove"}
TENS = {1: ("deci", "N"), 2: ("viginti", "MS"), 3: ("triginta", "NS"),
        4: ("quadraginta", "NS"), 5: ("quinquaginta", "NS"),
        6: ("sexaginta", "N"), 7: ("septuaginta", "N"),
        8: ("octoginta", "MX"), 9: ("nonaginta", "")}
HUNDREDS = {1: ("centi", "NX"), 2: ("ducenti", "N"), 3: ("trecenti", "NS"),
            4: ("quadringenti", "NS"), 5: ("quingenti", "NS"),
            6: ("sescenti", "N"), 7: ("septingenti", "N"),
            8: ("octingenti", "MX"), 9: ("nongenti", "")}
# Dictionary spellings that differ from strict Conway-Wechsler:
# n -> (dictionary spelling, strict CW spelling)
DICTIONARY = {16: ("sexdecillion", "sedecillion"),
              19: ("novemdecillion", "novendecillion")}


def group_name(g):
    """Strict Conway-Wechsler name for one 3-digit group, 1 <= g <= 999."""
    assert 1 <= g <= 999
    if g <= 9:
        return SPECIAL[g - 1]
    u, t, h = g % 10, (g // 10) % 10, g // 100
    comps = []
    if u:
        comps.append([UNITS[u], ""])
    if t:
        comps.append(list(TENS[t]))
    if h:
        comps.append(list(HUNDREDS[h]))
    if u:
        marks = comps[1][1]
        base = comps[0][0]
        if base == "tre" and ("S" in marks or "X" in marks):
            comps[0][0] = "tres"
        elif base == "se":
            if "S" in marks:
                comps[0][0] = "ses"
            elif "X" in marks:
                comps[0][0] = "sex"
        elif base in ("septe", "nove"):
            if "M" in marks:
                comps[0][0] = base + "m"
            elif "N" in marks:
                comps[0][0] = base + "n"
    return "".join(c[0] for c in comps)[:-1] + "illion"


def illion_name(n, dictionary=True):
    """Name of 10**(3n+3). Works for any n >= 1 (int)."""
    n = int(n)
    assert n >= 1
    if n < 1000:
        if dictionary and n in DICTIONARY:
            return DICTIONARY[n][0]
        return group_name(n)
    digits = str(n)
    first = len(digits) % 3 or 3
    groups = [int(digits[:first])]
    groups += [int(digits[i:i + 3]) for i in range(first, len(digits), 3)]
    out = []
    for i, g in enumerate(groups):
        last = i == len(groups) - 1
        if g == 0:
            name = "nillion"
        else:
            name = group_name(g)
        # every group but the last is joined with "-illi-": drop the "on"
        out.append(name if last else name[:-2])
    return "".join(out)
