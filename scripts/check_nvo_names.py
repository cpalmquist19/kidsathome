#!/usr/bin/env python3
"""Cross-check scripts/nvo_names.py against static/js/numbers_vs_operations/names.js."""
import json, random, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from nvo_names import illion_name  # noqa: E402

random.seed(7)
ns = list(range(1, 6001))
ns += [10**k for k in range(4, 60)] + [10**k + 3 for k in range(4, 40)]
ns += [random.randrange(1, 10**random.randrange(4, 120)) for _ in range(3000)]
ns += [999999, 1000000, 1000003, 2000000000, 12345678901234567890]
ns = sorted(set(ns))

js = """
const {illionName} = require(process.argv[1]);
const ns = JSON.parse(require('fs').readFileSync(0,'utf8')).map(BigInt);
console.log(JSON.stringify(ns.flatMap(n => [illionName(n), illionName(n,{dictionary:false})])));
"""
res = subprocess.run(
    ["node", "-e", js, str(ROOT / "static/js/numbers_vs_operations/names.js")],
    input=json.dumps([str(n) for n in ns]), capture_output=True, text=True,
    check=True)
got = json.loads(res.stdout)
bad = 0
for i, n in enumerate(ns):
    py = (illion_name(n), illion_name(n, dictionary=False))
    if (got[2 * i], got[2 * i + 1]) != py:
        bad += 1
        if bad <= 5:
            print("MISMATCH", n, py, (got[2 * i], got[2 * i + 1]))
print(f"checked {len(ns)} values, {bad} mismatches")
sys.exit(1 if bad else 0)
