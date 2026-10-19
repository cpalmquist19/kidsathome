// Star Dust: the currency for Life on an Exoplanet Clicker.
// Exclusive to this game - it has its own storage key and does not share
// state with the stardust in the space clicker (game.js).
const StarDust = (() => {
    const STORAGE_KEY = 'lifeOnExoplanet.starDust';
    const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

    let balance = 0;
    let lifetime = 0;
    const listeners = [];

    function load() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && Number.isFinite(saved.balance) && Number.isFinite(saved.lifetime)) {
                balance = Math.max(0, saved.balance);
                lifetime = Math.max(0, saved.lifetime);
            }
        } catch (e) {
            // Storage unavailable or corrupt - start from zero.
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, lifetime }));
        } catch (e) {
            // Storage unavailable - the game still works for this session.
        }
    }

    function notify() {
        listeners.forEach(fn => fn(balance));
    }

    function format(num) {
        if (num < 1000) {
            return parseFloat(num.toFixed(2)).toString();
        }
        const magnitude = Math.floor(Math.log10(num) / 3);
        if (magnitude >= SUFFIXES.length) {
            return num.toExponential(2);
        }
        const scaled = num / Math.pow(1000, magnitude);
        const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
        return parseFloat(scaled.toFixed(decimals)) + SUFFIXES[magnitude];
    }

    function add(amount) {
        if (!Number.isFinite(amount) || amount <= 0) return false;
        balance += amount;
        lifetime += amount;
        save();
        notify();
        return true;
    }

    function canAfford(cost) {
        return Number.isFinite(cost) && cost >= 0 && balance >= cost;
    }

    function spend(cost) {
        if (!canAfford(cost)) return false;
        balance -= cost;
        save();
        notify();
        return true;
    }

    function reset() {
        balance = 0;
        lifetime = 0;
        save();
        notify();
    }

    // Registers a callback fired on every balance change (and once immediately).
    function onChange(fn) {
        listeners.push(fn);
        fn(balance);
    }

    load();

    return {
        add,
        spend,
        canAfford,
        reset,
        onChange,
        format,
        get balance() { return balance; },
        get lifetime() { return lifetime; },
    };
})();
