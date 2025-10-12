# JSON Schema for Star Systems

## System Structure
Each star system is defined in a JSON file with the following structure:

```json
{
  "systemName": "Sol System",
  "systemType": "single_star",
  "description": "Our home solar system",
  "centralObject": {
    "name": "Sun",
    "type": "star",
    "spectralType": "G",
    "mass": 1.989e30,
    "radius": 696340,
    "temperature": 5778,
    "color": "#FFFF00",
    "luminosity": 1.0,
    "age": 4.6e9
  },
  "objects": [
    {
      "name": "Mercury",
      "type": "planet",
      "subtype": "terrestrial",
      "mass": 3.301e23,
      "radius": 2439.7,
      "distance": 57.9e6,
      "orbitalPeriod": 87.97,
      "rotationPeriod": 58.65,
      "color": "#8C7853",
      "atmosphere": false,
      "moons": []
    },
    {
      "name": "Earth",
      "type": "planet",
      "subtype": "terrestrial",
      "mass": 5.972e24,
      "radius": 6371,
      "distance": 149.6e6,
      "orbitalPeriod": 365.25,
      "rotationPeriod": 1.0,
      "color": "#4A90E2",
      "atmosphere": true,
      "atmosphereColor": "#87CEEB",
      "moons": [
        {
          "name": "Moon",
          "type": "moon",
          "mass": 7.342e22,
          "radius": 1737.4,
          "distance": 384400,
          "orbitalPeriod": 27.32,
          "color": "#C0C0C0"
        }
      ]
    }
  ],
  "asteroidBelts": [
    {
      "name": "Asteroid Belt",
      "innerRadius": 2.0e8,
      "outerRadius": 3.2e8,
      "particleCount": 1000,
      "color": "#8B7355"
    }
  ],
  "settings": {
    "timeAcceleration": 1.0,
    "defaultZoom": "compressed",
    "maxObjects": 50
  },
  "background": {
    "type": "image",
    "url": "/static/images/space_explorer_3d_background.png",
    "tint": "#0f0f23"
  }
}
```

## Object Types

### Central Objects
- **star**: Main sequence stars (G, K, M, etc.)
- **blackhole**: Black holes with event horizons
- **pulsar**: Rotating neutron stars
- **quasar**: Active galactic nuclei

### Orbital Objects
- **planet**: Major planets
  - **terrestrial**: Rocky planets (Mercury, Venus, Earth, Mars)
  - **gas_giant**: Gas giants (Jupiter, Saturn)
  - **ice_giant**: Ice giants (Uranus, Neptune)
- **dwarf_planet**: Pluto, Ceres, etc.
- **moon**: Natural satellites
- **asteroid**: Small rocky objects
- **comet**: Icy objects with tails

## Properties

### Physical Properties
- **mass**: Mass in kilograms
- **radius**: Radius in kilometers
- **density**: Density in kg/m³
- **temperature**: Surface temperature in Kelvin
- **color**: Hex color code for rendering

### Orbital Properties
- **distance**: Distance from central object in kilometers
- **orbitalPeriod**: Orbital period in days
- **rotationPeriod**: Rotation period in days
- **eccentricity**: Orbital eccentricity (0-1)
- **inclination**: Orbital inclination in degrees

### Visual Properties
- **color**: Primary color for rendering
- **atmosphere**: Boolean for atmospheric effects
- **atmosphereColor**: Color of atmospheric glow
- **rings**: Boolean for ring systems
- **ringColor**: Color of planetary rings
- **texture**: Texture file name (optional)

## Example Systems

### Sol System (Our Solar System)
```json
{
  "systemName": "Sol System",
  "centralObject": {
    "name": "Sun",
    "type": "star",
    "spectralType": "G",
    "mass": 1.989e30,
    "radius": 696340,
    "temperature": 5778,
    "color": "#FFFF00"
  },
  "objects": [
    {
      "name": "Mercury",
      "type": "planet",
      "subtype": "terrestrial",
      "distance": 57.9e6,
      "radius": 2439.7,
      "color": "#8C7853"
    },
    {
      "name": "Venus",
      "type": "planet", 
      "subtype": "terrestrial",
      "distance": 108.2e6,
      "radius": 6051.8,
      "color": "#FFC649"
    },
    {
      "name": "Earth",
      "type": "planet",
      "subtype": "terrestrial", 
      "distance": 149.6e6,
      "radius": 6371,
      "color": "#4A90E2",
      "atmosphere": true,
      "moons": [
        {
          "name": "Moon",
          "type": "moon",
          "distance": 384400,
          "radius": 1737.4,
          "color": "#C0C0C0"
        }
      ]
    },
    {
      "name": "Mars",
      "type": "planet",
      "subtype": "terrestrial",
      "distance": 227.9e6,
      "radius": 3389.5,
      "color": "#CD5C5C"
    },
    {
      "name": "Jupiter",
      "type": "planet",
      "subtype": "gas_giant",
      "distance": 778.5e6,
      "radius": 69911,
      "color": "#D8CA9D",
      "rings": true
    },
    {
      "name": "Saturn",
      "type": "planet",
      "subtype": "gas_giant", 
      "distance": 1432e6,
      "radius": 58232,
      "color": "#FAD5A5",
      "rings": true
    },
    {
      "name": "Uranus",
      "type": "planet",
      "subtype": "ice_giant",
      "distance": 2867e6,
      "radius": 25362,
      "color": "#4FD0E7"
    },
    {
      "name": "Neptune",
      "type": "planet",
      "subtype": "ice_giant",
      "distance": 4515e6,
      "radius": 24622,
      "color": "#4B70DD"
    }
  ]
}
```

### Alpha Centauri System
```json
{
  "systemName": "Alpha Centauri System",
  "systemType": "binary_star",
  "centralObject": {
    "name": "Alpha Centauri A",
    "type": "star",
    "spectralType": "G",
    "mass": 1.1e30,
    "radius": 1.2e6,
    "temperature": 5790,
    "color": "#FFFF00"
  },
  "objects": [
    {
      "name": "Proxima Centauri b",
      "type": "planet",
      "subtype": "terrestrial",
      "distance": 7.5e6,
      "radius": 7000,
      "color": "#8B4513"
    }
  ]
}
```

## File Organization
```
static/data/systems/
├── sol_system.json
├── alpha_centauri.json
├── trappist_1.json
├── kepler_442.json
├── proxima_centauri.json
├── wolf_1061.json
├── gliese_667.json
└── hd_40307.json
```

## Background Configuration

### Background Types
- **image**: Use a background image texture
- **color**: Use a solid color background
- **gradient**: Use a gradient background (future feature)

### Background Properties
- **type**: Background type ("image", "color", "gradient")
- **url**: Image URL for image backgrounds
- **tint**: Color tint for image backgrounds or solid color
- **gradient**: Gradient configuration (future feature)

### Example Backgrounds
```json
// Image background
"background": {
  "type": "image",
  "url": "/static/images/Space_Explorer_3D_Background.png",
  "tint": "#0f0f23"
}

// Color background
"background": {
  "type": "color",
  "tint": "#000011"
}
```

## Validation Rules
- All distances must be positive
- All masses must be positive
- All radii must be positive
- Colors must be valid hex codes
- Orbital periods must be positive
- Object names must be unique within system
- Central object is required
- At least one orbital object recommended
- Background URLs must be valid paths
