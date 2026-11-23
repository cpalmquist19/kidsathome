/*
 * Math Ball Fighting - the ball browser.
 *
 * One list for both slots (attacker / defender). Balls are grouped into collapsible
 * categories; fictional numbers get one group per first letter. A category only builds
 * its tiles the first time it is opened, and tiles show a slice of a cached sprite sheet
 * (sheets.js), so opening everything at once stays cheap.
 *
 *   var P = MBF.createPicker(hostElement, { sheets, onPick(ball) });
 *   P.setBalls(list); P.setSlot('att' | 'def'); P.setSelected(attId, defId); P.reveal(id)
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};
  var TILE_PX = 64;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function rgb(c) { return 'rgb(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ')'; }
  function fmt(n) { return n.toLocaleString('en-US'); }
  function letterOf(name) {
    var c = name.normalize ? name.normalize('NFKD').replace(/[̀-ͯ]/g, '') : name;
    var m = /[A-Za-z]/.exec(c.charAt(0));
    return m ? m[0].toUpperCase() : '#';
  }

  MBF.createPicker = function (host, opts) {
    var sheets = opts.sheets;
    var state = { q: '', filter: 'all', slot: 'att', att: null, def: null };
    var cats = [], catByKey = {}, byId = {};

    // ---------------------------------------------------------------- toolbar
    host.innerHTML = '';
    var bar = el('div', 'pk-bar');
    var search = el('input', 'pk-search');
    search.type = 'search';
    search.placeholder = 'Search every number and function...';
    search.setAttribute('aria-label', 'Search balls');
    var chips = el('div', 'pk-chips');
    [['all', 'All'], ['real', 'Real numbers'], ['fn', 'Functions'], ['fx', 'Fictional']].forEach(function (c) {
      var b = el('button', 'pk-chip', c[1]);
      b.type = 'button'; b.dataset.filter = c[0];
      b.addEventListener('click', function () { state.filter = c[0]; render(); });
      chips.appendChild(b);
    });
    var tools = el('div', 'pk-tools');
    var btnOpen = el('button', 'pk-tool', 'Expand all');
    var btnClose = el('button', 'pk-tool', 'Collapse all');
    var btnRandom = el('button', 'pk-tool pk-random', '🎲 Surprise me');
    [btnOpen, btnClose, btnRandom].forEach(function (b) { b.type = 'button'; tools.appendChild(b); });
    var status = el('div', 'pk-status');
    bar.appendChild(search); bar.appendChild(chips); bar.appendChild(tools); bar.appendChild(status);
    var list = el('div', 'pk-cats');
    host.appendChild(bar); host.appendChild(list);

    // ---------------------------------------------------------------- categories
    function makeCat(key, title, parent, open) {
      var d = el('details', 'pk-cat');
      d.dataset.cat = key;
      d.open = !!open;
      var sum = el('summary', null, '<span class="pk-title"></span><span class="pk-count"></span>');
      sum.querySelector('.pk-title').textContent = title;
      var grid = el('div', 'pk-grid');
      d.appendChild(sum); d.appendChild(grid);
      (parent ? parent.body : list).appendChild(d);
      var c = { key: key, el: d, grid: grid, balls: [], built: false, userOpen: !!open, parent: parent, children: [] };
      c.body = grid;
      d.addEventListener('toggle', function () {
        if (!state.q) c.userOpen = d.open;
        if (d.open) fill(c);
      });
      cats.push(c); catByKey[key] = c;
      if (parent) parent.children.push(c);
      return c;
    }

    function categorize(balls) {
      var V = MBF.V, val = function (id) { return MBF.valueOf(MBF.ballById(id)); };
      var t1000 = val('n1000'), tGplex = val('googolplex'), tGraham = val('graham');
      return function (b) {
        if (b.kind === 'function') return 'fn';
        if (b.fictional) return 'fx-' + letterOf(b.name);
        if (b.special === 'infinity') return 'inf';
        var v = MBF.valueOf(b);
        if (V.cmp(v, t1000) <= 0) return 'small';
        if (V.cmp(v, tGplex) <= 0) return 'big';
        if (V.cmp(v, tGraham) <= 0) return 'giant';
        return 'beyond';
      };
    }

    function build(balls) {
      list.innerHTML = ''; cats = []; catByKey = {}; byId = {};
      makeCat('small', 'Small numbers (1 to 1,000)', null, true);
      makeCat('big', 'Big numbers (a million to a googolplex)', null, true);
      makeCat('giant', "Giant numbers (up to Graham's number)", null, true);
      makeCat('beyond', "Beyond Graham's number", null, true);
      makeCat('inf', 'Infinity', null, true);
      makeCat('fn', 'Functions (attack only, they grow every hit)', null, true);
      var fx = null;
      var cat = categorize(balls);
      balls.forEach(function (b) {
        byId[b.id] = b;
        b._hay = (b.name + ' ' + (b.label || '') + ' ' + (b.formula || '')).toLowerCase();
        var key = cat(b);
        if (!catByKey[key]) {
          if (!fx) fx = makeCat('fx', 'Fictional numbers (beyond infinity)', null, true);
          var letter = key.slice(3);
          makeCat(key, letter === '#' ? 'Symbols & other letters' : letter, fx, false);
        }
        catByKey[key].balls.push(b);
      });
      if (fx) {
        // letters A-Z, then symbols
        fx.children.sort(function (a, b) {
          if (a.key === 'fx-#') return 1;
          if (b.key === 'fx-#') return -1;
          return a.key < b.key ? -1 : 1;
        });
        fx.children.forEach(function (c) {
          fx.body.appendChild(c.el);
          // browse each letter alphabetically (who-beats-who follows the wiki's size lists)
          c.balls.sort(function (a, b) { return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }); });
        });
        fx.el.classList.add('pk-group');
        fx.built = true;                                  // its body holds sub-categories, not tiles
      }
      render();
    }

    // ---------------------------------------------------------------- filtering
    function allowed(b) {
      if (state.slot === 'def' && b.kind === 'function') return false;
      if (state.filter === 'real') return b.kind === 'number' && !b.fictional;
      if (state.filter === 'fn') return b.kind === 'function';
      if (state.filter === 'fx') return !!b.fictional;
      return true;
    }
    function matches(b) { return allowed(b) && (!state.q || b._hay.indexOf(state.q) >= 0); }

    function render() {
      Array.prototype.forEach.call(chips.children, function (b) {
        b.classList.toggle('on', b.dataset.filter === state.filter);
        b.disabled = b.dataset.filter === 'fn' && state.slot === 'def';
      });
      var total = 0;
      cats.forEach(function (c) {
        if (c.children.length) return;
        c.visible = c.balls.filter(matches);
        c.built = false;
        c.el.hidden = !c.visible.length;
        c.el.querySelector('.pk-count').textContent = fmt(c.visible.length);
        total += c.visible.length;
        if (state.q) c.el.open = c.visible.length > 0 && c.visible.length <= 400;   // open what matched
        else c.el.open = c.userOpen;
        if (c.el.open) fill(c); else c.grid.innerHTML = '';
      });
      cats.forEach(function (c) {
        if (!c.children.length) return;
        var n = c.children.reduce(function (s, k) { return s + (k.visible ? k.visible.length : 0); }, 0);
        c.el.hidden = !n;
        c.el.querySelector('.pk-count').textContent = fmt(n);
        if (state.q) c.el.open = n > 0; else c.el.open = c.userOpen;
      });
      status.textContent = state.q ? fmt(total) + ' match' + (total === 1 ? '' : 'es') : '';
      updateSheetStatus();
      mark();
    }

    // ---------------------------------------------------------------- tiles
    function fill(c) {
      if (c.built || c.children.length) return;
      c.built = true;
      var frag = document.createDocumentFragment();
      (c.visible || []).forEach(function (b) { frag.appendChild(tile(b)); });
      c.grid.innerHTML = '';
      c.grid.appendChild(frag);
      mark();
    }
    function paint(pic, b) {
      var s = sheets.style(b, TILE_PX);
      if (s) {
        pic.style.backgroundImage = s.backgroundImage;
        pic.style.backgroundSize = s.backgroundSize;
        pic.style.backgroundPosition = s.backgroundPosition;
        pic.classList.remove('pending');
      } else {
        pic.style.background = 'radial-gradient(circle at 35% 35%, ' + rgb(b.aura) + ', #0a0614 68%)';
        pic.classList.add('pending');
      }
    }
    function tile(b) {
      var t = el('button', 'tile', '<span class="pic"></span><span class="nm"></span>');
      t.type = 'button';
      t.dataset.id = b.id;
      t.dataset.sheet = sheets.keyOf(b);
      t.title = b.name;
      t.querySelector('.nm').textContent = b.label || b.name;
      paint(t.querySelector('.pic'), b);
      return t;
    }
    list.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.tile') : null;
      if (!t) return;
      var b = byId[t.dataset.id];
      if (b && allowed(b)) opts.onPick(b);
    });
    sheets.onReady(function (key) {
      Array.prototype.forEach.call(list.querySelectorAll('.tile[data-sheet="' + key + '"]'), function (t) {
        paint(t.querySelector('.pic'), byId[t.dataset.id]);
      });
      updateSheetStatus();
    });
    function updateSheetStatus() {
      var s = sheets.done < sheets.total
        ? 'Painting ball pictures ' + sheets.done + ' / ' + sheets.total + ' (only the first time)' : '';
      bar.classList.toggle('painting', !!s);
      bar.dataset.painting = s;
    }

    function mark() {
      Array.prototype.forEach.call(list.querySelectorAll('.tile.sel-att, .tile.sel-def'), function (t) {
        t.classList.remove('sel-att', 'sel-def');
      });
      [['att', state.att], ['def', state.def]].forEach(function (p) {
        if (!p[1]) return;
        Array.prototype.forEach.call(list.querySelectorAll('.tile[data-id="' + p[1] + '"]'), function (t) {
          t.classList.add('sel-' + p[0]);
        });
      });
    }

    // ---------------------------------------------------------------- tools
    var timer = null;
    search.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = search.value.trim().toLowerCase(); render(); }, 150);
    });
    btnOpen.addEventListener('click', function () {
      cats.forEach(function (c) { c.userOpen = true; });
      if (state.q) { search.value = ''; state.q = ''; }
      render();
    });
    btnClose.addEventListener('click', function () {
      cats.forEach(function (c) { c.userOpen = false; });
      if (state.q) { search.value = ''; state.q = ''; }
      render();
    });
    btnRandom.addEventListener('click', function () {
      var pool = Object.keys(byId).map(function (k) { return byId[k]; }).filter(matches);
      if (!pool.length) return;
      var b = pool[Math.floor(Math.random() * pool.length)];
      opts.onPick(b);
      P.reveal(b.id);
    });

    var P = {
      setBalls: build,
      setSlot: function (slot) { state.slot = slot; render(); },
      setSelected: function (att, def) { state.att = att; state.def = def; mark(); },
      // open the ball's category and scroll its tile into view
      reveal: function (id) {
        var b = byId[id];
        if (!b) return;
        var c = cats.filter(function (k) { return k.balls.indexOf(b) >= 0; })[0];
        if (!c) return;
        if (c.parent) { c.parent.userOpen = true; c.parent.el.open = true; }
        c.userOpen = true; c.el.open = true; fill(c);
        var t = c.grid.querySelector('.tile[data-id="' + id + '"]');
        if (t) {
          t.scrollIntoView({ block: 'center', behavior: 'smooth' });
          t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
        }
      }
    };
    return P;
  };
})(window);
