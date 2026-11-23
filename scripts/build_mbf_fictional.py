"""Order Math Ball Fighting's fictional numbers by size, using the wiki's own comparisons.

The Fictional Googology Wiki gives most numbers an infobox with "Larger numbers",
"Smaller numbers" and "Equal numbers". This script reads every page in
static/data/math_ball_fighting/fictional.json, follows those links (through redirects,
and through numbers that are not in the game, so A < X < B still tells us A < B), and
fits one size score per number that agrees with as many comparisons as possible
(a Bradley-Terry model: the wiki contradicts itself a lot, so no order can agree with
all of them).

Equal numbers are pulled close together, and the pairs the wiki calls equal are written
out separately (the game makes those a close fight either way). Numbers with no
comparisons get the middle score of their wiki class category (Class N, TEPoN2026
Class N, BBN Level N); numbers with neither get the middle of the whole list and are
marked as a guess.

The set of numbers is never changed (the kid-friendly filtering was done by hand when
the list was first made): only the order and the scores are rewritten.

    python scripts/build_mbf_fictional.py [--cache DIR]

--cache keeps the downloaded pages so a rerun doesn't fetch them again.
Output rows: [name, page id, size score, how it was placed (0 compared, 1 class, 2 guess)].
"""
import argparse, collections, json, math, os, re, statistics, sys, time, urllib.parse, urllib.request
from datetime import date

API = 'https://fictional-googology.fandom.com/api.php'
UA = {'User-Agent': 'Mozilla/5.0 (fictional number size sorter)'}
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'static', 'data', 'math_ball_fighting', 'fictional.json')

FIELDS = {
    'larger': r'(?:largerNumbers|exampless?_of_larger_numbers:?|larger_numbers)',
    'smaller': r'(?:smallerNumbers|exampless?_of_smaller_numbers:?|smaller_numbers)',
    'equal': r'(?:equalNumbers|equal_numbers)',
}
CLASS_CAT = re.compile(r'^Category:(Class \d+|TEPoN2026 Class \d+|BBN Level \d+)$')


def api(params):
    params = dict(params, format='json', formatversion='2')
    req = urllib.request.Request(API + '?' + urllib.parse.urlencode(params), headers=UA)
    for attempt in range(4):
        try:
            return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 + 3 * attempt)


def fetch_pages(ids):
    out = {}
    for i in range(0, len(ids), 50):
        chunk = ids[i:i + 50]
        params = {'action': 'query', 'prop': 'revisions|categories', 'rvprop': 'content', 'rvslots': 'main',
                  'cllimit': 'max', 'pageids': '|'.join(map(str, chunk))}
        cont = {}
        while True:
            d = api(dict(params, **cont))
            for p in d['query']['pages']:
                if p.get('missing'):
                    continue
                o = out.setdefault(str(p['pageid']), {'title': p['title'], 'text': '', 'cats': []})
                rev = (p.get('revisions') or [{}])[0]
                o['text'] = o['text'] or rev.get('slots', {}).get('main', {}).get('content', '')
                o['cats'] += [c['title'] for c in p.get('categories', [])]
            if 'continue' not in d:
                break
            cont = d['continue']
        print(f'  pages {min(i + 50, len(ids))}/{len(ids)}', file=sys.stderr)
        time.sleep(0.3)
    return out


def resolve_redirects(titles):
    out = {}
    titles = sorted(titles)
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        d = api({'action': 'query', 'titles': '|'.join(chunk), 'redirects': '1'})
        nm = {n['from']: n['to'] for n in d['query'].get('normalized', [])}
        rd = {r['from']: r['to'] for r in d['query'].get('redirects', [])}
        for t in chunk:
            x = nm.get(t, t)
            out[t] = rd.get(x, x)
        time.sleep(0.3)
    return out


def norm(s):
    s = s.split('|')[0].split('#')[0].replace('_', ' ').strip()
    return s[:1].upper() + s[1:] if s else s


def field(text, pat):
    m = re.search(r'\|\s*' + pat + r'\s*=(.*?)(?=\n\s*\||\|\s*[A-Za-z_-]+\s*:?=|\}\})', text, re.S)
    return m.group(1) if m else ''


def links(s):
    return [norm(l) for l in re.findall(r'\[\[([^\]]+)\]\]', s)
            if not re.match(r'(?i)\s*(w:|wikipedia:|category:|file:|image:|template:|user:)', l)]


def categories(text):
    return {'Category:' + c.strip() for c in re.findall(r'\[\[Category:([^\]|]+)', text)}


def fit_scores(nodes, lt, eq, prior=0.01, pull=1.0, iters=3000):
    """Bradley-Terry: P(b bigger than a) = sigmoid(s_b - s_a), with a small pull towards 0.

    Equal pairs pull the two scores together (softly: the wiki's "equal" links chain into
    numbers it elsewhere calls different, so forcing them identical makes the order worse).
    """
    ix = {v: i for i, v in enumerate(nodes)}
    pairs = [(ix[a], ix[b]) for a, b in lt]
    same = [(ix[a], ix[b]) for a, b in eq]
    deg = [0] * len(nodes)
    for i, j in pairs + same:
        deg[i] += 1
        deg[j] += 1
    s = [0.0] * len(nodes)
    for it in range(iters):
        g = [-prior * x for x in s]
        for i, j in pairs:
            q = 1 / (1 + math.exp(max(-50, min(50, s[j] - s[i]))))
            g[j] += q
            g[i] -= q
        for i, j in same:
            d = s[i] - s[j]
            g[i] -= pull * d
            g[j] += pull * d
        step = max(0.05, 0.5 * (1 - it / iters))
        s = [x + step * y / (1 + d) for x, y, d in zip(s, g, deg)]
    return {v: s[ix[v]] for v in nodes}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', help='folder to keep downloaded pages in')
    args = ap.parse_args()

    src = json.load(open(DATA, encoding='utf-8'))
    roster = [(n[0], n[1]) for n in src['numbers']]

    cache = os.path.join(args.cache, 'fictional_pages.json') if args.cache else None
    if cache and os.path.exists(cache):
        pages = json.load(open(cache, encoding='utf-8'))
    else:
        print('Downloading pages...', file=sys.stderr)
        pages = fetch_pages([pid for _, pid in roster])
        if cache:
            os.makedirs(args.cache, exist_ok=True)
            json.dump(pages, open(cache, 'w', encoding='utf-8'), ensure_ascii=False)

    # every bigger / smaller / equal link, keyed by page title
    raw = []
    for p in pages.values():
        for kind, pat in FIELDS.items():
            for target in links(field(p['text'], pat)):
                raw.append((p['title'], kind, target))
    known = {p['title'] for p in pages.values()}
    outside = {t for _, _, t in raw} - known
    # a roster page that was deleted from the wiki is matched by its name instead
    node_of = {pid: pages[str(pid)]['title'] if str(pid) in pages else norm(name) for name, pid in roster}
    outside |= {t for t in node_of.values() if t not in known}

    rcache = os.path.join(args.cache, 'fictional_redirects.json') if args.cache else None
    if rcache and os.path.exists(rcache):
        redir = json.load(open(rcache, encoding='utf-8'))
        missing = outside - set(redir)
        if missing:
            redir.update(resolve_redirects(missing))
    else:
        print(f'Resolving {len(outside)} redirects...', file=sys.stderr)
        redir = resolve_redirects(outside)
    if rcache:
        json.dump(redir, open(rcache, 'w', encoding='utf-8'), ensure_ascii=False)
    R = lambda t: redir.get(t, t)
    node_of = {pid: R(t) for pid, t in node_of.items()}

    lt, eq = set(), set()
    for page, kind, target in raw:
        target = R(target)
        if target == page:
            continue
        if kind == 'larger':
            lt.add((page, target))
        elif kind == 'smaller':
            lt.add((target, page))
        else:
            eq.add(tuple(sorted((page, target))))
    nodes = sorted({x for e in lt | eq for x in e})
    print(f'{len(lt)} bigger/smaller links, {len(eq)} equal links, {len(nodes)} numbers in the size map',
          file=sys.stderr)
    score = fit_scores(nodes, lt, eq)
    pid_of = {t: pid for pid, t in node_of.items()}
    direct = [(a, b) for a, b in lt if a in pid_of and b in pid_of]
    agree = sum(1 for a, b in direct if score[a] < score[b])
    print(f'Agrees with {agree}/{len(direct)} direct comparisons between game numbers '
          f'({100 * agree / len(direct):.1f}%)', file=sys.stderr)
    # equal pairs between game numbers: the game makes these a close fight both ways
    equal = sorted({tuple(sorted((pid_of[a], pid_of[b]))) for a, b in eq
                    if a in pid_of and b in pid_of and pid_of[a] != pid_of[b]})

    # place each roster number
    rows = {}
    for name, pid in roster:
        if node_of[pid] in score:
            rows[pid] = [name, pid, score[node_of[pid]], 0]
    by_cat = collections.defaultdict(list)
    cats_of = {}
    for name, pid in roster:
        p = pages.get(str(pid))
        cats_of[pid] = {c for c in categories(p['text']) | set(p.get('cats', [])) if CLASS_CAT.match(c)} if p else set()
        if pid in rows:
            for c in cats_of[pid]:
                by_cat[c].append(rows[pid][2])
    middle = statistics.median(r[2] for r in rows.values())
    for name, pid in roster:
        if pid in rows:
            continue
        guesses = [statistics.median(by_cat[c]) for c in cats_of[pid] if len(by_cat[c]) >= 3]
        rows[pid] = [name, pid, statistics.median(guesses), 1] if guesses else [name, pid, middle, 2]

    out = sorted(rows.values(), key=lambda r: (round(r[2], 2), r[0].lower()))
    for r in out:
        r[2] = round(r[2], 2)
    placed = collections.Counter(r[3] for r in out)
    print(f'Placed by comparisons: {placed[0]}, by class: {placed[1]}, guessed (middle): {placed[2]}', file=sys.stderr)

    src.update({
        'fetched': date.today().isoformat(),
        'order': 'Smallest to biggest, from the wiki\'s own "larger / smaller / equal numbers" links '
                 '(built by scripts/build_mbf_fictional.py). Fictional, not real maths.',
        'size': 'Row: [name, page id, size score, placed by: 0 wiki comparisons, 1 wiki class, 2 guess (middle)]. '
                'A score gap of 1 means the wiki agrees about 73% of the time that the bigger one is bigger.',
        'agreement': f'{agree}/{len(direct)} direct comparisons between these numbers',
        'count': len(out),
        'numbers': out,
        'equal': [list(p) for p in equal],
    })
    with open(DATA, 'w', encoding='utf-8') as fh:
        json.dump(src, fh, ensure_ascii=False, separators=(',', ':'))
    print(f'Wrote {len(out)} numbers to {os.path.normpath(DATA)}', file=sys.stderr)


if __name__ == '__main__':
    main()
