// Tech tree for Life on an Exoplanet Clicker, level one.
// Each node is an object that appears on the world screen:
//   perClick     - Star Dust added to every click once unlocked
//   perSecond    - Star Dust it generates each second once unlocked
//   unlockCost   - Star Dust spent to unlock it
//   startsUnlocked - unlocked from the beginning (the root of the tree)
//   x, y         - position on the map as a fraction of its width/height (0 to 1)
//   size         - image size in map pixels (defaults to 192)
//   requires     - ids of nodes that must be unlocked first
// Unlocked state has its own storage key, like StarDust.
const TechTree = (() => {
    const STORAGE_KEY = 'lifeOnExoplanet.techTree';

    const nodes = [
        {
            id: 'binary-star-system',
            name: 'Binary Star System',
            perClick: 1,
            perSecond: 0,
            unlockCost: 10,
            startsUnlocked: false,
            x: 0.5,
            y: 0.5,
            requires: [],
        },
        {
            id: 'fulatun',
            name: 'Fulatun',
            perClick: 4,
            perSecond: 0,
            unlockCost: 100,
            startsUnlocked: false,
            x: 0.65,
            y: 0.38,
            size: 96,
            requires: ['binary-star-system'],
        },
    ];

    const unlocked = new Set(nodes.filter(node => node.startsUnlocked).map(node => node.id));
    const listeners = [];

    function load() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (Array.isArray(saved)) {
                saved.forEach(id => { if (get(id)) unlocked.add(id); });
            }
        } catch (e) {
            // Storage unavailable or corrupt - keep the defaults.
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
        } catch (e) {
            // Storage unavailable - the game still works for this session.
        }
    }

    function notify() {
        listeners.forEach(fn => fn());
    }

    function get(id) {
        return nodes.find(node => node.id === id) || null;
    }

    function isUnlocked(id) {
        return unlocked.has(id);
    }

    function requirementsMet(node) {
        return node.requires.every(isUnlocked);
    }

    function canUnlock(id) {
        const node = get(id);
        return !!node && !isUnlocked(id) && requirementsMet(node) && StarDust.canAfford(node.unlockCost);
    }

    function unlock(id) {
        if (!canUnlock(id)) return false;
        const node = get(id);
        if (!StarDust.spend(node.unlockCost)) return false;
        unlocked.add(id);
        save();
        notify();
        return true;
    }

    // Back to the starting state: only the nodes that start unlocked.
    function reset() {
        unlocked.clear();
        nodes.filter(node => node.startsUnlocked).forEach(node => unlocked.add(node.id));
        save();
        notify();
    }

    // Total Star Dust added to each click by every unlocked node.
    function perClick() {
        return nodes.reduce((sum, node) => sum + (isUnlocked(node.id) ? node.perClick || 0 : 0), 0);
    }

    // Total Star Dust per second from every unlocked node.
    function perSecond() {
        return nodes.reduce((sum, node) => sum + (isUnlocked(node.id) ? node.perSecond || 0 : 0), 0);
    }

    // Adds the Star Dust generated over `seconds` of play time.
    function tick(seconds) {
        const amount = perSecond() * seconds;
        if (amount > 0) StarDust.add(amount);
    }

    // Registers a callback fired whenever a node is unlocked.
    function onChange(fn) {
        listeners.push(fn);
    }

    load();

    return {
        nodes,
        get,
        isUnlocked,
        canUnlock,
        unlock,
        reset,
        perClick,
        perSecond,
        tick,
        onChange,
    };
})();
