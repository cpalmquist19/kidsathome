// Simulates a full run of the engine in node: node scripts/sim_nvo.js [tickBudget]
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'static');
const names = require(path.join(root, 'js/numbers_vs_operations/names.js'));
const eng = require(path.join(root, 'js/numbers_vs_operations/engine.js'));
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/numbers_vs_operations/named_numbers.json')));
const C = Number(process.argv[2] || 30);
const e = eng.createEngine(data, { illionName: names.illionName }, { tickBudget: C });
console.log('ops', e.OPS.map(o => o.sym).join(' '), ' zone starts at', e.Z0);
let p = e.first(), op = 0, fights = 0, ticks = 0, killedTotal = 0n;
const perOp = {}, big = [];
const t0 = Date.now();
while (p.k !== 'f' || true) {
  op = e.opFor(op, p);
  const o = e.OPS[op];
  const need = e.ticksNeeded(o, p);
  if (need === Infinity) { console.log('STUCK at', e.entryOf(p).name, 'op', o.name); break; }
  const V = o.V[need];
  fights++; ticks += need;
  const st = perOp[o.id] || (perOp[o.id] = { fights: 0, ticks: 0, kills: 0n, first: e.entryOf(p).name });
  st.fights++; st.ticks += need;
  if (p.k === 'f') { console.log('INFINITY DEAD after', need, 'ticks of', o.name); break; }
  const nxt = e.nextAfter(V);
  const k = e.rankOf(nxt) - e.rankOf(p);
  if (k < 1n) { console.log('NO PROGRESS', e.entryOf(p).name, e.keyOf(p), e.keyOf(nxt)); break; }
  st.kills += k; st.last = e.entryOf(p).name;
  if (k >= 100n) big.push([e.entryOf(p).name.slice(0, 24), o.sym, need, e.fmtBig(k)]);
  if (p.k === 'f') { console.log('INFINITY DEAD at tick', need); break; }
  p = nxt;
  if (fights > 20000) { console.log('too many'); break; }
}
console.log('fights', fights, 'ticks', ticks, 'ms', Date.now() - t0);
for (const [id, s] of Object.entries(perOp)) console.log(id.padEnd(22), 'fights', String(s.fights).padStart(4), 'ticks', String(s.ticks).padStart(5), 'kills', e.fmtBig(s.kills).padStart(12), s.first, '->', s.last);
console.log('big multi-kills', big.length, big.slice(0, 12));
