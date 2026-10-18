// Star Statistics - Generate HR Diagram and other visualizations
// Uses star data from star_map.js

// Temperature mapping for spectral types (approximate values in Kelvin)
const spectralTypeTemperatures = {
    'O': { min: 30000, max: 50000, default: 40000 },
    'B': { min: 10000, max: 30000, default: 20000 },
    'A': { min: 7500, max: 10000, default: 8500 },
    'F': { min: 6000, max: 7500, default: 6750 },
    'G': { min: 5000, max: 6000, default: 5500 },
    'K': { min: 3500, max: 5000, default: 4250 },
    'M': { min: 2000, max: 3500, default: 3000 },
    'L': { min: 1300, max: 2000, default: 1650 },
    'T': { min: 500, max: 1300, default: 900 },
    'Y': { min: 250, max: 500, default: 375 },
    'D': { min: 3000, max: 30000, default: 10000 }, // White dwarfs vary widely
    'PSR': { min: 1000000, max: 1000000, default: 1000000 }, // Neutron stars (surface)
    'SMBH': { min: 0, max: 0, default: null }, // Black holes don't have temperature in the same sense
    'LBV': { min: 10000, max: 50000, default: 25000 },
    'WR': { min: 25000, max: 50000, default: 35000 },
    'WO': { min: 100000, max: 200000, default: 150000 }
};

// Get primary spectral type from type string
function getPrimarySpectralType(type) {
    if (!type) return null;
    
    const match = type.match(/^([A-Z]+)/);
    if (!match) return null;
    
    const primaryType = match[1];
    
    // Special handling for white dwarfs
    if (primaryType.startsWith('D')) {
        return 'D';
    }
    
    // Special handling for pulsars
    if (primaryType === 'PSR') {
        return 'PSR';
    }
    
    // Special handling for black holes
    if (primaryType === 'SMBH') {
        return 'SMBH';
    }
    
    // Special handling for LBV
    if (primaryType === 'LBV') {
        return 'LBV';
    }
    
    // Special handling for Wolf-Rayet
    if (primaryType.startsWith('W')) {
        return primaryType.substring(0, 2) === 'WO' ? 'WO' : 'WR';
    }
    
    return primaryType.charAt(0);
}

// Get temperature from spectral type
function getTemperatureFromSpectralType(type) {
    const primaryType = getPrimarySpectralType(type);
    if (!primaryType) return null;
    
    const tempRange = spectralTypeTemperatures[primaryType];
    if (!tempRange) return null;
    
    // For black holes, return null (they don't have stellar temperature)
    if (primaryType === 'SMBH') return null;
    
    // Extract subtype number if available (e.g., "M5.5Ve" -> 5.5)
    const subtypeMatch = type.match(/(\d+\.?\d*)/);
    if (subtypeMatch && tempRange.min !== tempRange.max) {
        const subtype = parseFloat(subtypeMatch[1]);
        // Scale subtype (0-9) to temperature range
        const normalized = subtype / 9.5; // Use 9.5 to allow some stars to be near max
        return tempRange.min + (normalized * (tempRange.max - tempRange.min));
    }
    
    return tempRange.default;
}

// Calculate absolute magnitude from apparent magnitude and distance
function calculateAbsoluteMagnitude(apparentMagnitude, distanceLy) {
    // Convert light years to parsecs (1 parsec = 3.26156 light years)
    const distancePc = distanceLy / 3.26156;
    
    // Distance modulus formula: M = m - 5 * log10(d/10)
    // Where M is absolute magnitude, m is apparent magnitude, d is distance in parsecs
    if (distancePc <= 0) return apparentMagnitude;
    
    const absoluteMagnitude = apparentMagnitude - 5 * Math.log10(distancePc / 10);
    return absoluteMagnitude;
}

// Calculate luminosity from absolute magnitude (in solar luminosities)
function calculateLuminosity(absoluteMagnitude) {
    // Luminosity formula: L = L_sun * 10^(0.4 * (M_sun - M))
    // Where M_sun = 4.83 (absolute magnitude of the Sun)
    const M_sun = 4.83;
    const luminosity = Math.pow(10, 0.4 * (M_sun - absoluteMagnitude));
    return luminosity;
}

// Prepare star data for HR diagram
function prepareStarDataForHR() {
    const hrData = [];
    
    // Include Sun
    const sunData = {
        name: "Sun",
        type: "G2V",
        temperature: 5778,
        absoluteMagnitude: 4.83,
        luminosity: 1.0,
        apparentMagnitude: -26.8,
        distance: 0.0000158
    };
    hrData.push(sunData);
    
    // Process all stars from star_map.js, excluding pulsars and black holes
    stars.forEach(star => {
        const primaryType = getPrimarySpectralType(star.type);
        
        // Exclude pulsars (PSR) and black holes (SMBH) from HR diagram
        if (primaryType === 'PSR' || primaryType === 'SMBH') {
            return;
        }
        
        const temperature = getTemperatureFromSpectralType(star.type);
        if (temperature === null) return; // Skip invalid types
        
        const absoluteMagnitude = calculateAbsoluteMagnitude(star.magnitude, star.distance);
        const luminosity = calculateLuminosity(absoluteMagnitude);
        
        hrData.push({
            name: star.name,
            type: star.type,
            temperature: temperature,
            absoluteMagnitude: absoluteMagnitude,
            luminosity: luminosity,
            apparentMagnitude: star.magnitude,
            distance: star.distance
        });
    });
    
    return hrData;
}

// Create HR Diagram
function createHRDiagram() {
    const hrData = prepareStarDataForHR();
    
    const ctx = document.getElementById('hrDiagram');
    if (!ctx) return;
    
    // Sort by temperature for better visualization
    hrData.sort((a, b) => b.temperature - a.temperature);
    
    // Extract data for chart
    const temperatures = hrData.map(star => star.temperature);
    const luminosities = hrData.map(star => star.luminosity);
    const colors = hrData.map(star => getStarColorForHR(star.type));
    
    // Create scatter plot
    const chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Stars',
                data: hrData.map(star => ({
                    x: star.temperature,
                    y: star.luminosity,
                    name: star.name,
                    type: star.type
                })),
                backgroundColor: colors,
                borderColor: colors.map(c => adjustBrightness(c, -0.3)),
                borderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return [
                                `Name: ${point.name}`,
                                `Type: ${point.type}`,
                                `Temperature: ${point.x.toFixed(0)} K`,
                                `Luminosity: ${point.y.toFixed(4)} L☉`
                            ];
                        }
                    },
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    reverse: true, // HR diagram has temperature reversed (hottest on left)
                    title: {
                        display: true,
                        text: 'Temperature (K)',
                        color: '#fff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                },
                y: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'Luminosity (L☉)',
                        color: '#fff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                }
            }
        }
    });
}

// Get star color for HR diagram
function getStarColorForHR(type) {
    const primaryType = getPrimarySpectralType(type);
    
    switch(primaryType) {
        case 'O': return '#9bb0ff';
        case 'B': return '#aabfff';
        case 'A': return '#cad7ff';
        case 'F': return '#f8f7ff';
        case 'G': return '#fff4ea';
        case 'K': return '#ffd2a1';
        case 'M': return '#ffcc6f';
        case 'D': return '#ffffff';
        case 'L': return '#ff8800';
        case 'T': return '#cc6600';
        case 'Y': return '#994400';
        case 'PSR': return '#00ffff';
        case 'LBV': return '#9bb0ff';
        case 'WR': case 'WO': return '#9bb0ff';
        default: return '#ffffff';
    }
}

// Adjust brightness of color
function adjustBrightness(color, factor) {
    // Remove # if present
    color = color.replace('#', '');
    
    // Parse RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // Adjust
    const newR = Math.max(0, Math.min(255, Math.round(r * (1 + factor))));
    const newG = Math.max(0, Math.min(255, Math.round(g * (1 + factor))));
    const newB = Math.max(0, Math.min(255, Math.round(b * (1 + factor))));
    
    // Convert back to hex
    return '#' + newR.toString(16).padStart(2, '0') + 
                 newG.toString(16).padStart(2, '0') + 
                 newB.toString(16).padStart(2, '0');
}

// Create distance distribution chart
function createDistanceChart() {
    // Group stars by distance ranges
    const ranges = [
        { label: '0-5 ly', min: 0, max: 5 },
        { label: '5-10 ly', min: 5, max: 10 },
        { label: '10-15 ly', min: 10, max: 15 },
        { label: '15-20 ly', min: 15, max: 20 },
        { label: '20+ ly', min: 20, max: Infinity }
    ];
    
    const counts = ranges.map(range => {
        return stars.filter(star => star.distance >= range.min && star.distance < range.max).length;
    });
    
    // Include Sun in closest range
    counts[0]++;
    
    const ctx = document.getElementById('distanceChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ranges.map(r => r.label),
            datasets: [{
                label: 'Number of Stars',
                data: counts,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(192, 132, 252, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(99, 102, 241, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(192, 132, 252, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#9ca3af',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create spectral type distribution chart
function createSpectralTypeChart() {
    const typeCounts = {};
    
    // Count stars by primary spectral type
    stars.forEach(star => {
        const primaryType = getPrimarySpectralType(star.type);
        if (primaryType) {
            typeCounts[primaryType] = (typeCounts[primaryType] || 0) + 1;
        }
    });
    
    // Include Sun
    typeCounts['G'] = (typeCounts['G'] || 0) + 1;
    
    // Sort by standard order
    const typeOrder = ['O', 'B', 'A', 'F', 'G', 'K', 'M', 'L', 'T', 'Y', 'D', 'PSR', 'SMBH', 'LBV', 'WR', 'WO'];
    const labels = [];
    const data = [];
    const colors = [];
    
    typeOrder.forEach(type => {
        if (typeCounts[type]) {
            labels.push(type);
            data.push(typeCounts[type]);
            colors.push(getStarColorForHR(type));
        }
    });
    
    const ctx = document.getElementById('spectralTypeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => adjustBrightness(c, -0.3)),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#fff',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            }
        }
    });
}

// Create magnitude distribution chart
function createMagnitudeChart() {
    // Group stars by magnitude ranges
    const ranges = [
        { label: '< -1', min: -Infinity, max: -1 },
        { label: '-1 to 0', min: -1, max: 0 },
        { label: '0 to 3', min: 0, max: 3 },
        { label: '3 to 6', min: 3, max: 6 },
        { label: '6 to 9', min: 6, max: 9 },
        { label: '9 to 12', min: 9, max: 12 },
        { label: '12 to 15', min: 12, max: 15 },
        { label: '15+', min: 15, max: Infinity }
    ];
    
    const counts = ranges.map(range => {
        return stars.filter(star => star.magnitude >= range.min && star.magnitude < range.max).length;
    });
    
    // Sun is very bright (< -1)
    counts[0]++;
    
    const ctx = document.getElementById('magnitudeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ranges.map(r => r.label),
            datasets: [{
                label: 'Number of Stars',
                data: counts,
                backgroundColor: 'rgba(251, 191, 36, 0.8)',
                borderColor: 'rgba(251, 191, 36, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#9ca3af',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update summary statistics
function updateSummaryStats() {
    // Total stars (including Sun)
    const totalStars = stars.length + 1;
    document.getElementById('totalStars').textContent = totalStars.toLocaleString();
    
    // Average distance
    const totalDistance = stars.reduce((sum, star) => sum + star.distance, 0);
    const avgDistance = totalDistance / stars.length;
    document.getElementById('avgDistance').textContent = avgDistance.toFixed(2) + ' ly';
    
    // Brightest star (lowest magnitude = brightest)
    const brightestStar = stars.reduce((brightest, star) => {
        return star.magnitude < brightest.magnitude ? star : brightest;
    }, stars[0]);
    
    // Sun is actually brightest but we'll show brightest visible star
    if (brightestStar) {
        document.getElementById('brightestStar').textContent = brightestStar.magnitude.toFixed(2);
    }
    
    // Closest star
    const closestStar = stars.reduce((closest, star) => {
        return star.distance < closest.distance ? star : closest;
    }, stars[0]);
    
    if (closestStar) {
        document.getElementById('closestStar').textContent = closestStar.distance.toFixed(2) + ' ly';
    }
}

// Initialize all charts and stats when page loads
function initStarStats() {
    // Wait for Chart.js to be loaded
    if (typeof Chart === 'undefined') {
        setTimeout(initStarStats, 100);
        return;
    }
    
    // Wait for star data to be loaded
    if (typeof stars === 'undefined') {
        setTimeout(initStarStats, 100);
        return;
    }
    
    createHRDiagram();
    createDistanceChart();
    createSpectralTypeChart();
    createMagnitudeChart();
    updateSummaryStats();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStarStats);
} else {
    initStarStats();
}

