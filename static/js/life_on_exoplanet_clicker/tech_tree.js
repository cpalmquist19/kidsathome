// Tech tree for Life on an Exoplanet Clicker, level one.
// Each node is an object that appears on the world screen. Every node has a type:
//   BASE      - perClick: Star Dust added to every click/tap once unlocked
//   GENERATOR - perSecond: Star Dust each copy makes each second once unlocked. It can
//               be bought again and again, and the copies add up (count × perSecond).
//               The total is multiplied by the efficiency of every unlocked EVOLUTION
//               attached to it.
//               costGrowth: each copy bought makes the next cost this many times as
//               much (unlockCost × costGrowth^copies owned). Defaults to 1 (flat cost).
//   EVOLUTION - generator: id of the GENERATOR it is attached to
//               efficiency: multiplier applied to that generator's rate (they stack)
//               It also upgrades the tap by the generator's share of all generator
//               production (see tapMultiplier). Needs its generator unlocked first.
// GENERATOR images are drawn as circles, and their scale is 1.
// Fields shared by every node:
//   description  - flavor text shown in the info box
//   unlockCost   - Star Dust spent to unlock it
//   startsUnlocked - unlocked from the beginning (the root of the tree)
//   x, y         - position on the map as a fraction of its width/height (0 to 1)
//   scale        - image size relative to the Binary Star System (which is 1), so 1.5
//                 is half again as big. Defaults to DEFAULT_SCALE.
//   requires     - ids of nodes that must be unlocked first
// Unlocked state has its own storage key, like StarDust.
const TechTree = (() => {
    const STORAGE_KEY = 'lifeOnExoplanet.techTree';
    const DEFAULT_SCALE = 0.5;
    const TYPES = { BASE: 'BASE', GENERATOR: 'GENERATOR', EVOLUTION: 'EVOLUTION' };

    const nodes = [
        {
            id: 'binary-star-system',
            name: 'Binary Star System',
            type: TYPES.BASE,
            description: 'Two suns, one blazing white and one cooler cyan, circle each other and light the whole system. Everything here begins with their glow.',
            perClick: 1,
            unlockCost: 10,
            startsUnlocked: false,
            scale: 1,
            x: 0.5,
            y: 0.5,
            requires: [],
        },
        {
            id: 'fulatun',
            name: 'Fulatun',
            type: TYPES.BASE,
            description: 'A banded world wrapped in bright stripes of cloud, swept by storms that churn in every color the twin suns can paint.',
            perClick: 4,
            unlockCost: 100,
            startsUnlocked: false,
            x: 0.65,
            y: 0.38,
            requires: ['binary-star-system'],
            scale: .5
        },
        {
            id: 'lyrath',
            name: 'Lyrath',
            type: TYPES.BASE,
            description: 'A world of glowing electric-blue rock veined with golden-green deposits, wrapped in a faint luminous haze.',
            perClick: 10,
            unlockCost: 500,
            startsUnlocked: false,
            x: 0.647,
            y: 0.683,
            requires: ['binary-star-system'],
            scale: .5
        },
        {
            // Up and to the left of the binary star system.
            id: 'entas',
            name: 'Entas',
            type: TYPES.BASE,
            description: 'A gas giant of swirling rainbow bands, its cloud tops glowing neon green, pink and gold as great storms roll around the planet.',
            perClick: 25,
            unlockCost: 1000,
            startsUnlocked: false,
            x: 0.3675,
            y: 0.365,
            requires: ['binary-star-system'],
            scale: .5
        },
        {
            // Down and to the left of the binary star system, mirroring Lyrath.
            id: 'rooth',
            name: 'Rooth',
            type: TYPES.BASE,
            description: 'A mossy green world patched with pale, shimmering plains, wrapped in a thin blue glow of atmosphere.',
            perClick: 50,
            unlockCost: 2500,
            startsUnlocked: false,
            x: 0.353,
            y: 0.683,
            requires: ['binary-star-system'],
            scale: 1
        },
        {
            // A moon of Rooth, down and to its left.
            id: 'ubonae',
            name: 'Ubonae',
            type: TYPES.BASE,
            description: 'A small moon of pale blue rock freckled with glowing yellow-green craters, circling Rooth in a halo of cold light.',
            perClick: 100,
            unlockCost: 5000,
            startsUnlocked: false,
            x: 0.27,
            y: 0.8,
            requires: ['rooth'],
            scale: .5
        },
        {
            // In the one-celled area, below the level one image (y is past 1) and under Rooth.
            id: 'the-cells-arrival',
            name: "The Cell's Arrival",
            type: TYPES.BASE,
            description: 'A single glowing cell, trailing fine threads like a comet, drifts down out of the dark and touches Rooth. It is tiny and alone, and it is the first living thing this world has ever known.',
            perClick: 250,
            unlockCost: 10000,
            startsUnlocked: false,
            x: 0.353,
            y: 1.3,
            requires: ['rooth'],
            scale: 1
        },
        {
            // In the ocean area, in the bottom right corner of its image with room to spare.
            id: 'bathyopolisk',
            name: 'Bathyopolisk',
            type: TYPES.BASE,
            description: 'The first lifeform on the planet of Rooth. The lone cell settled on the seabed and became a towering sponge, its countless pores drinking in the sea. It has no eyes and no mind, but it is alive, and everything that follows will grow from it.',
            perClick: 500,
            unlockCost: 25000,
            startsUnlocked: false,
            x: -0.2443,
            y: 4.8176,
            requires: ['the-cells-arrival'],
            scale: .5
        },
        {
            // In the ocean area, up and to the left of Bathyopolisk.
            id: 'small-ocean-life',
            name: 'Small Ocean Life',
            type: TYPES.GENERATOR,
            description: 'Glimmerfrills, with violet bodies and plumes tipped in glowing gold and blue, crawl over the Bathyopolisk while pale Tidewisps drift through the dark water around them. They are tiny, and there are endless numbers of them. They graze, breed and die, and every one returns a little star dust to the sea.',
            perSecond: 500,
            unlockCost: 50000,
            costGrowth: 1.15,
            startsUnlocked: false,
            x: -0.4829,
            y: 4.522,
            requires: ['bathyopolisk'],
            scale: 1
        },
        {
            // In the ocean area, between Small Ocean Life and Katarith Monzamene.
            id: 'araragrathish',
            name: 'Araragrathish',
            type: TYPES.EVOLUTION,
            description: 'A long, glass-clear body dotted with points of blue-green light, and rows of white feathered fronds on either side that ripple it through the dark water. It is the first thing on Rooth to swim with a purpose, and it drifts through the swarms of tiny life, stirring them to grow.',
            generator: 'small-ocean-life',
            efficiency: 1.3,
            unlockCost: 67000,
            startsUnlocked: false,
            x: -0.617,
            y: 4.522,
            requires: ['small-ocean-life'],
            scale: .5
        },
        {
            // In the ocean area, to the left of Araragrathish.
            id: 'katarith-monzamene',
            name: 'Katarith Monzamene',
            type: TYPES.EVOLUTION,
            description: 'The first creature on Rooth with a heart. Its shaggy coat of weed drifts in the current, and through its glass-clear belly the glow of lungs, heart and gut can be seen. It hunts the swarms of Glimmerfrills and Tidewisps, and the swarms thrive on it.',
            generator: 'small-ocean-life',
            efficiency: 1.3141592653589793,
            unlockCost: 83000,
            startsUnlocked: false,
            x: -0.75,
            y: 4.522,
            requires: ['araragrathish'],
            scale: .5
        },
    ];

    const unlocked = new Set(nodes.filter(node => node.startsUnlocked).map(node => node.id));
    // Copies owned of each GENERATOR (an unlocked generator without an entry owns one).
    const copies = new Map();
    const listeners = [];

    // Saved as { unlocked: [ids in unlock order], copies: { generatorId: count } }.
    // Older saves were just the array of unlocked ids.
    function load() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            const ids = Array.isArray(saved) ? saved : saved && saved.unlocked;
            if (Array.isArray(ids)) {
                ids.forEach(id => { if (get(id)) unlocked.add(id); });
            }
            if (saved && saved.copies) {
                Object.entries(saved.copies).forEach(([id, count]) => {
                    const node = get(id);
                    if (node && node.type === TYPES.GENERATOR && unlocked.has(id) && count > 1) copies.set(id, Math.floor(count));
                });
            }
        } catch (e) {
            // Storage unavailable or corrupt - keep the defaults.
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                unlocked: [...unlocked],
                copies: Object.fromEntries(copies),
            }));
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

    // Image size of a node relative to the Binary Star System.
    function scale(id) {
        const node = get(id);
        return node && node.scale ? node.scale : DEFAULT_SCALE;
    }

    function isUnlocked(id) {
        return unlocked.has(id);
    }

    // The node unlocked most recently (the set keeps unlock order, and it is saved in
    // that order), or null if nothing is unlocked.
    function lastUnlocked() {
        const ids = [...unlocked];
        return ids.length ? get(ids[ids.length - 1]) : null;
    }

    // Ids of the nodes this one depends on (an EVOLUTION also depends on its generator).
    function dependencies(id) {
        const node = get(id);
        if (!node) return [];
        const ids = node.type === TYPES.EVOLUTION ? [node.generator, ...node.requires] : node.requires;
        return [...new Set(ids)].filter(get);
    }

    // Nodes that must be unlocked before this one.
    function missingRequirements(id) {
        return dependencies(id).filter(reqId => !isUnlocked(reqId)).map(get);
    }

    function requirementsMet(node) {
        return missingRequirements(node.id).length === 0;
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

    // Copies of a GENERATOR owned (0 until it is unlocked).
    function count(id) {
        const node = get(id);
        if (!node || node.type !== TYPES.GENERATOR || !isUnlocked(id)) return 0;
        return copies.get(id) || 1;
    }

    // Star Dust the next copy of an unlocked GENERATOR costs.
    function nextCost(id) {
        const node = get(id);
        return Math.ceil(node.unlockCost * Math.pow(node.costGrowth || 1, count(id)));
    }

    function canBuyAnother(id) {
        return count(id) > 0 && StarDust.canAfford(nextCost(id));
    }

    // Buys one more copy of an unlocked GENERATOR.
    function buyAnother(id) {
        if (!canBuyAnother(id)) return false;
        if (!StarDust.spend(nextCost(id))) return false;
        copies.set(id, count(id) + 1);
        save();
        notify();
        return true;
    }

    // Back to the starting state: only the nodes that start unlocked.
    function reset() {
        unlocked.clear();
        copies.clear();
        nodes.filter(node => node.startsUnlocked).forEach(node => unlocked.add(node.id));
        save();
        notify();
    }

    // Total Star Dust added to each click by every unlocked BASE node.
    function perClick() {
        return nodes.reduce((sum, node) => sum + (node.type === TYPES.BASE && isUnlocked(node.id) ? node.perClick || 0 : 0), 0);
    }

    // The EVOLUTION nodes attached to a generator, unlocked or not.
    function evolutionsOf(generatorId) {
        return nodes.filter(node => node.type === TYPES.EVOLUTION && node.generator === generatorId);
    }

    // Combined multiplier from the unlocked evolutions attached to a generator.
    function efficiency(generatorId) {
        return evolutionsOf(generatorId)
            .reduce((mult, node) => mult * (isUnlocked(node.id) ? node.efficiency || 1 : 1), 1);
    }

    // Star Dust per second from one generator: its copies add up, then the evolutions
    // multiply the total (0 until it is unlocked).
    function production(id) {
        const node = get(id);
        if (!node || node.type !== TYPES.GENERATOR || !isUnlocked(id)) return 0;
        return (node.perSecond || 0) * count(id) * efficiency(id);
    }

    // Total Star Dust per second from every unlocked GENERATOR.
    function perSecond() {
        return nodes.reduce((sum, node) => sum + production(node.id), 0);
    }

    // The fraction (0 to 1) of all generator production that one generator makes.
    function generatorShare(id) {
        const total = perSecond();
        return total > 0 ? production(id) / total : 0;
    }

    // Each unlocked EVOLUTION upgrades the tap by its generator's share of all
    // generator production, so the tap is worth 1 + the sum of those shares.
    function tapMultiplier() {
        return nodes.reduce((mult, node) => {
            if (node.type !== TYPES.EVOLUTION || !isUnlocked(node.id)) return mult;
            return mult + generatorShare(node.generator);
        }, 1);
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
        TYPES,
        nodes,
        get,
        scale,
        isUnlocked,
        lastUnlocked,
        dependencies,
        missingRequirements,
        canUnlock,
        unlock,
        count,
        nextCost,
        canBuyAnother,
        buyAnother,
        reset,
        perClick,
        perSecond,
        evolutionsOf,
        efficiency,
        production,
        generatorShare,
        tapMultiplier,
        tick,
        onChange,
    };
})();
