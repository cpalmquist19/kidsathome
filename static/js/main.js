// Asset versioned via Flask static_file helper (?v=mtime). Change triggers cache bust.
document.addEventListener('DOMContentLoaded', function() {
    // Get the color select and custom color picker elements
    const colorSelect = document.getElementById('star-color-type');
    const customColorPicker = document.getElementById('custom-color-picker');

    // Add event listener to the color select
    colorSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customColorPicker.classList.remove('hidden');
        } else {
            customColorPicker.classList.add('hidden');
        }
    });

    // Ensure color picker is hidden on page load
    customColorPicker.classList.add('hidden');

    document.getElementById('generate-btn').addEventListener('click', async () => {
        try {
            const starType = document.getElementById('star-type').value;
            const isAdvancedView = document.querySelector('.view-btn[data-view="advanced"]').classList.contains('active');

            let requestData = { starType };

            // Add advanced parameters if in advanced view
            if (isAdvancedView) {
                const colorSelect = document.getElementById('star-color-type');
                const starColor = document.getElementById('star-color');
                requestData.starColor = colorSelect.value === 'custom'
                    ? starColor.value  // Send the actual color value from the color picker
                    : colorSelect.value;
                requestData.starSize = document.getElementById('star-size').value;
                requestData.giantType = document.getElementById('giant-type').value;
            }

            const response = await fetch('/generate-system', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            const data = await response.json();

            if (response.ok) {
                const resultDiv = document.getElementById('result');
                let html = `
                    <div class="system-name">
                        <span class="star-emoji">🌟</span> The ${data.star.name} System
                    </div>
                    <div class="system-summary">
                        <div class="summary-card">
                            <h4>Star</h4>
                            <p>${data.star.name} (${data.star.type}-class)</p>
                        </div>
                        <div class="summary-card">
                            <h4>Planets</h4>
                            <p>${data.planets.length}</p>
                        </div>
                        <div class="summary-card">
                            <h4>Habitable Worlds</h4>
                            <p>${data.planets.filter(p => p.habitable).length}</p>
                        </div>
                    </div>
                    <div class="star-system-visual">
                        <div class="star-header">
                            <span class="star-emoji">⭐</span>
                            <div class="star-classification">
                                ${data.giantType && data.giantType !== 'main'
                                    ? `${data.giantType.charAt(0).toUpperCase() + data.giantType.slice(1)} Star`
                                    : data.star.type === 'MGTR'
                                        ? 'Magnetar Star'
                                        : ['P', 'N'].includes(data.star.type)
                                            ? 'Degenerate Star'
                                            : data.star.type === 'D'
                                                ? 'White Dwarf Star'
                                                : 'Main Sequence Star'}
                            </div>
                        </div>
                        <div class="celestial-object">
                            <div class="star type-${data.star.type.replace('MGTR', 'magnetar')}"
                                ${data.star.customColor ? `style="background-color: ${data.star.customColor};"` : ''}>
                            </div>
                            <div class="celestial-info">
                                <h4>${data.star.name}</h4>
                                <p>${data.star.type === 'MGTR' ? 'Magnetar' : `${data.star.type}-class star`}</p>
                                <p><span class="label">Temperature:</span> <span class="measurement">${Number(data.star.temperature).toLocaleString(undefined, {maximumFractionDigits: 0})} K</span></p>
                                <p><span class="label">Mass:</span> <span class="measurement">${Number(data.star.mass).toLocaleString(undefined, {maximumFractionDigits: 2})} M☉</span></p>
                                <p><span class="label">Radius:</span> <span class="measurement">
                                    ${['P', 'N', 'MGTR'].includes(data.star.type)
                                        ? `${(Number(data.star.radius) * 695700).toLocaleString(undefined, {maximumFractionDigits: 2})} km`
                                        : `${Number(data.star.radius).toLocaleString(undefined, {maximumFractionDigits: 2})} R☉`}
                                </span></p>
                                <p><span class="label">Luminosity:</span> <span class="measurement">${Number(data.star.luminosity).toLocaleString(undefined, {maximumFractionDigits: 5})} L☉</span></p>
                            </div>
                        </div>
                        <div class="planets-header">
                            <span class="planet-emoji">🪐</span> Planets
                        </div>
                        ${data.planets.map(planet => {
                            const [earthMass, jupiterMass] = planet.mass.split('\n');
                            const [earthRadius, jupiterRadius] = planet.radius.split('\n');

                            return `
                                <div class="planet-orbit">
                                    <div class="planet-visual ${planet.type.toLowerCase().replace(' ', '-')}"></div>
                                    <div class="celestial-info">
                                        <h4>${planet.name.split('(')[1].split(')')[0]} (${planet.name.split('(')[0].trim()} ${planet.name.split(')')[1].trim()})</h4>
                                        <p>Type: ${planet.type}</p>
                                        <p><span class="label">Earth Mass:</span> <span class="measurement">${earthMass}</span></p>
                                        <p><span class="label">Jupiter Mass:</span> <span class="measurement">${jupiterMass}</span></p>
                                        <p><span class="label">Earth Radius:</span> <span class="measurement">${earthRadius}</span></p>
                                        <p><span class="label">Jupiter Radius:</span> <span class="measurement">${jupiterRadius}</span></p>
                                        <p><span class="label">Distance:</span> <span class="measurement">${planet.distance}</span></p>
                                        ${planet.habitable ? '<p class="habitable-tag">✨ Potentially Habitable!</p>' : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                resultDiv.innerHTML = html;
            } else {
                throw new Error('Failed to generate star system');
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = `
                <p class="error">Failed to generate star system. Please try again.</p>
            `;
        }
    });

    document.getElementById('releases-btn').addEventListener('click', () => {
        const content = document.getElementById('releases-content');
        content.classList.toggle('hidden');
    });

    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const advancedElements = document.querySelectorAll('.advanced-only');
            const starTypeSelect = document.getElementById('star-type');

            if (button.dataset.view === 'advanced') {
                advancedElements.forEach(el => el.classList.remove('hidden'));
                starTypeSelect.classList.add('hidden');
            } else {
                advancedElements.forEach(el => el.classList.add('hidden'));
                starTypeSelect.classList.remove('hidden');
            }
        });
    });

    // Color picker toggle logic
    document.getElementById('star-color-type').addEventListener('change', (e) => {
        const customColorPicker = document.getElementById('custom-color-picker');
        const starColor = document.getElementById('star-color');

        if (e.target.value === 'custom') {
            customColorPicker.classList.remove('hidden');
        } else {
            customColorPicker.classList.add('hidden');
            starColor.value = e.target.value;
        }
    });

    // Ensure correct initial state on page load
    const starTypeSelect = document.getElementById('star-type');
    starTypeSelect.classList.remove('hidden');
});