# Space Auto Clicker Development Rules

## ⚠️ CRITICAL: Star System Addition Checklist

When adding new star systems to the Space Auto Clicker game, you **MUST** update **BOTH** of these arrays:

### 1. `initStarCollection()` function (around line 252)
- **Location**: `static/js/game.js` in the `initStarCollection()` function
- **Purpose**: Creates the UI elements for the star collection panel
- **What to add**: Complete star object with all properties (id, name, type, description, cost, unlocked, icon, color, image, stardustPerClick, upgrades)

### 2. `getCurrentStar()` function (around line 623)
- **Location**: `static/js/game.js` in the `getCurrentStar()` function  
- **Purpose**: Used when clicking on stars to determine which star data to use
- **What to add**: Simplified star object with essential properties (id, name, type, stardustPerClick, image)

### Why Both Arrays Are Required

If you only update one array, clicking on the new system will redirect to the first system due to the hardcoded array mismatch. The `getCurrentStar()` function falls back to the first star when it can't find the selected star in its array.

### Example: Adding System 11

```javascript
// In initStarCollection() function:
{ 
    id: 11, 
    name: 'NewSystem', 
    type: 'Star Type',
    description: 'Description here...', 
    cost: 1000000000000000000000000000000, 
    unlocked: false, 
    icon: 'fas fa-star', 
    color: '#FF0000',
    image: '/static/images/new-system.png',
    stardustPerClick: 1000000000000000000000000000000,
    upgrades: [
        {
            name: 'Upgrade Name',
            description: 'Upgrade description',
            cost: 1000000000000000000000000000000000,
            unlocked: false
        }
    ]
}

// In getCurrentStar() function:
{ 
    id: 11, 
    name: 'NewSystem', 
    type: 'Star Type',
    stardustPerClick: 1000000000000000000000000000000,
    image: '/static/images/new-system.png'
}
```

## Additional Requirements for New Systems

### 3. Game State (`gameState.starSystems`)
Add the new system to the `gameState.starSystems` object with proper configuration.

### 4. Unlock Logic
Add unlock logic in the upgrade purchase handling to unlock the new system when the prerequisite upgrade is purchased.

### 5. Unlock Function
Create an unlock function (e.g., `unlockEleventhStarSystem()`) following the existing pattern.

### 6. Migration Logic
Add migration logic in the `loadGame()` function to handle existing saves.

## ⚠️ IMPORTANT SCOPE NOTE

**This rule ONLY applies to the Space Auto Clicker game** in this repository. Other games in the same repo (Space Explorer 3D, Stellar Evolution, Matter Eater, etc.) have different architectures and this rule does NOT apply to them.

## Quick Reference

- **File**: `static/js/game.js`
- **Function 1**: `initStarCollection()` (around line 252)
- **Function 2**: `getCurrentStar()` (around line 623)
- **Game State**: `gameState.starSystems` (around line 1120)
- **Unlock Logic**: In upgrade purchase handling (around line 2200)
- **Migration**: In `loadGame()` function (around line 2980)

Remember: **Always update BOTH arrays when adding new star systems!**
