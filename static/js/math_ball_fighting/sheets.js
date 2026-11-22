/*
 * Math Ball Fighting - picture cache.
 *
 * Every ball's picker picture lives in a sprite sheet: one image holding up to 256 balls
 * (16 x 16 cells). Sheets are drawn in a single pass each (render.js renderSheet) and kept
 * on the device in IndexedDB, so after the first visit the whole picker appears instantly
 * with nothing redrawn or downloaded. A sheet's key includes a fingerprint of the ball
 * shaders and the balls on it, so changing either redraws just what changed.
 *
 *   MBF.cache.get(key) / MBF.cache.put(key, value)       small promise wrapper over IndexedDB
 *   var S = MBF.createSheets(R);
 *   S.setBalls(list);  S.onReady(fn(sheetKey));  S.style(ball, px) -> CSS for a tile, or null
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};

  // ------------------------------------------------------------ IndexedDB (falls back to "no cache")
  var dbPromise = null;
  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      if (!root.indexedDB) return resolve(null);
      var req;
      try { req = root.indexedDB.open('math-ball-fighting', 1); } catch (e) { return resolve(null); }
      req.onupgradeneeded = function () { req.result.createObjectStore('kv'); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { resolve(null); };
      req.onblocked = function () { resolve(null); };
    });
    return dbPromise;
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      if (!d) return null;
      return new Promise(function (resolve) {
        var t, r;
        try { t = d.transaction('kv', mode); r = fn(t.objectStore('kv')); } catch (e) { return resolve(null); }
        t.oncomplete = function () { resolve(r && 'result' in r ? r.result : null); };
        t.onerror = t.onabort = function () { resolve(null); };
      });
    });
  }
  MBF.cache = {
    get: function (key) { return tx('readonly', function (s) { return s.get(key); }); },
    put: function (key, value) { return tx('readwrite', function (s) { return s.put(value, key); }); },
    keys: function () { return tx('readonly', function (s) { return s.getAllKeys(); }); },
    del: function (key) { return tx('readwrite', function (s) { return s.delete(key); }); }
  };

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }

  // ------------------------------------------------------------ sprite sheets
  MBF.createSheets = function (R) {
    var CELL = 80, COLS = 16, PER = COLS * COLS;
    // anything that changes how balls look changes this fingerprint
    var look = hash(JSON.stringify(MBF.shaders.surfaces) + MBF.shaders.ballFragment('pearl') + CELL + 'v2');
    var S = { cell: CELL, cols: COLS, sheets: [], where: {}, urls: {}, listeners: [], done: 0, total: 0 };
    var queue = [], busy = false;

    function notify(key) { S.listeners.forEach(function (fn) { fn(key); }); }
    S.onReady = function (fn) { S.listeners.push(fn); };

    // Real balls get their own sheet(s) and fictional ones theirs, so loading the fictional
    // list later never changes the real sheet.
    S.setBalls = function (list) {
      var groups = [list.filter(function (b) { return !b.fictional; }), list.filter(function (b) { return b.fictional; })];
      var sheets = [];
      groups.forEach(function (g, gi) {
        for (var i = 0; i < g.length; i += PER) {
          var balls = g.slice(i, i + PER);
          var key = 'sheet:' + look + ':' + gi + ':' + hash(balls.map(function (b) { return b.id + b.k; }).join(','));
          sheets.push({ key: key, balls: balls });
        }
      });
      sheets.forEach(function (sh) {
        sh.balls.forEach(function (b, i) { S.where[b.id] = { key: sh.key, i: i }; });
        if (!S.sheets.some(function (o) { return o.key === sh.key; })) S.sheets.push(sh);
      });
      S.total = S.sheets.length;
      sheets.forEach(load);
    };

    function load(sh) {
      if (S.urls[sh.key] || sh.loading) return;
      sh.loading = true;
      MBF.cache.get(sh.key).then(function (blob) {
        if (blob) ready(sh, blob);
        else { queue.push(sh); pump(); }
      });
    }
    function ready(sh, blob) {
      S.urls[sh.key] = URL.createObjectURL(blob);
      S.done++;
      notify(sh.key);
    }
    // draw missing sheets one at a time, leaving frames free in between so the page stays smooth
    function pump() {
      if (busy || !queue.length) return;
      busy = true;
      var sh = queue.shift();
      root.requestAnimationFrame(function () {
        var canvas = R.renderSheet(sh.balls, CELL, COLS);
        canvas.toBlob(function (blob) {
          busy = false;
          if (blob) { MBF.cache.put(sh.key, blob); ready(sh, blob); }
          pump();
        }, 'image/webp', 0.9);                               // browsers without WebP give PNG
      });
    }

    // forget sheets from older versions of the game
    S.prune = function () {
      var live = {};
      S.sheets.forEach(function (sh) { live[sh.key] = true; });
      MBF.cache.keys().then(function (keys) {
        (keys || []).forEach(function (k) { if (/^sheet:/.test(k) && !live[k]) MBF.cache.del(k); });
      });
    };

    S.keyOf = function (ball) { return S.where[ball.id] ? S.where[ball.id].key : ''; };
    // CSS for showing `ball` at `px` pixels, or null until its sheet is ready
    S.style = function (ball, px) {
      var w = S.where[ball.id];
      if (!w || !S.urls[w.key]) return null;
      var k = px / CELL;
      return {
        backgroundImage: 'url(' + S.urls[w.key] + ')',
        backgroundSize: (COLS * CELL * k) + 'px auto',
        backgroundPosition: (-(w.i % COLS) * CELL * k) + 'px ' + (-Math.floor(w.i / COLS) * CELL * k) + 'px'
      };
    };
    return S;
  };
})(window);
