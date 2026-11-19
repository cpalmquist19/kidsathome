// Procedural sprites for the quark surfaces and the Calabi–Yau visualization.
window.MATTER_EATER_ART = (() => {
    const TAU = 2 * Math.PI;
    const clamp = value => Math.max(0, Math.min(1, value));
    const mix = (a, b, t) => a + (b - a) * t;
    const smooth = t => t * t * (3 - 2 * t);
    const marbleColors = {
        s: [[117, 38, 166], [239, 132, 255], [143, 120, 33], [255, 245, 140]],
        c: [[22, 43, 141], [90, 200, 255], [136, 84, 10], [255, 232, 84]],
        b: [[123, 21, 30], [255, 133, 104], [14, 101, 57], [112, 255, 166]],
    };

    function hash(x, y, seed) {
        const n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + seed;
        const bits = Math.imul(n ^ (n >>> 13), 1274126177);
        return ((bits ^ (bits >>> 16)) >>> 0) / 4294967295;
    }

    function noise(x, y, seed) {
        const i = Math.floor(x), j = Math.floor(y);
        const fx = smooth(x - i), fy = smooth(y - j);
        return mix(mix(hash(i, j, seed), hash(i + 1, j, seed), fx),
            mix(hash(i, j + 1, seed), hash(i + 1, j + 1, seed), fx), fy);
    }

    function marblePixel(x, y, seed, colors, light, pixels, idx) {
        const warpX = x + 0.5 * (noise(x * 3, y * 3, seed) - 0.5);
        const warpY = y + 0.5 * (noise(x * 3, y * 3, seed + 9) - 0.5);
        const coarse = 0.73 * noise(warpX * 3.5, warpY * 3.5, seed + 27)
            + 0.21 * noise(warpX * 9, warpY * 9, seed + 41)
            + 0.06 * noise(x * 33, y * 33, seed);
        const band = smooth(clamp((coarse - 0.44) * 11));
        const fine = noise(warpX * 19, warpY * 19, seed + 71) + 0.4 * noise(x * 52, y * 52, seed);
        const glow = clamp((fine - 0.25) * 1.12 + 0.19 * (1 - Math.abs(band * 2 - 1)));
        for (let channel = 0; channel < 3; channel++) {
            const cool = mix(colors[0][channel], colors[1][channel], glow);
            const warm = mix(colors[2][channel], colors[3][channel], glow);
            pixels[idx + channel] = light * mix(cool, warm, band);
        }
    }

    function spongePixel(x, y, light, pixels, idx) {
        const u = x * 3.5 + 1.1 * (noise(x * 4.5, y * 4.5, 103) - 0.5);
        const v = y * 4.1 + 1.1 * (noise(x * 4.5, y * 4.5, 491) - 0.5);
        const col = Math.floor(u), row = Math.floor(v);
        let nearest = Infinity, next = Infinity;
        for (let j = row - 1; j <= row + 1; j++) {
            for (let i = col - 1; i <= col + 1; i++) {
                const dx = u - i - 0.15 - 0.7 * hash(i, j, 123);
                const dy = v - j - 0.15 - 0.7 * hash(i, j, 849);
                const distance = dx * dx + dy * dy;
                if (distance < nearest) {
                    next = nearest;
                    nearest = distance;
                } else if (distance < next) {
                    next = distance;
                }
            }
        }
        const grain = noise(x * 35, y * 35, 67);
        const ridge = Math.exp(-(2.4 + 1.35 * grain) * (Math.sqrt(next) - Math.sqrt(nearest)));
        pixels[idx] = (52 + 204 * ridge) * light;
        pixels[idx + 1] = (11 + (137 + 39 * grain) * ridge) * light;
        pixels[idx + 2] = (28 + (113 + 27 * grain) * ridge) * light;
    }

    function makeQuarkSurface(symbol, lowPower) {
        const sprite = document.createElement('canvas');
        const size = lowPower ? 88 : 164;
        sprite.width = sprite.height = size;
        const paint = sprite.getContext('2d');
        const image = paint.createImageData(size, size);
        const pixels = image.data;
        const seed = symbol.charCodeAt(0) * 101;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const x = 2.06 * (col + 0.5) / size - 1.03, y = 2.06 * (row + 0.5) / size - 1.03;
                const radius = Math.hypot(x, y);
                const angle = Math.atan2(y, x);
                const edge = symbol === 't' ? 0.975 + 0.038 * Math.cos(7 * angle) + 0.018 * Math.sin(19 * angle)
                    : 0.993 + 0.009 * Math.sin(17 * angle);
                if (radius > edge + 0.012) continue;
                const depth = Math.sqrt(Math.max(0, 1 - radius * radius));
                const light = 0.73 + 0.32 * depth - 0.10 * y - 0.08 * x;
                const idx = (row * size + col) * 4;
                if (symbol === 't') spongePixel(x, y, light, pixels, idx);
                else marblePixel(x, y, seed, marbleColors[symbol], light, pixels, idx);
                pixels[idx + 3] = 255 * clamp((edge - radius + 0.012) * size / 2.06);
            }
        }
        paint.putImageData(image, 0, 0);
        return sprite;
    }

    function makeManifoldFrame(phase, lowPower) {
        const sprite = document.createElement('canvas');
        const size = lowPower ? 96 : 176;
        sprite.width = sprite.height = size;
        const paint = sprite.getContext('2d');
        paint.translate(size / 2, size / 2);
        paint.scale(size / 3.3, size / 3.3);
        const halo = paint.createRadialGradient(0, 0, 0, 0, 0, 1.62);
        halo.addColorStop(0, '#7332ff91');
        halo.addColorStop(0.54, '#5e26f347');
        halo.addColorStop(1, '#5622ff00');
        paint.fillStyle = halo;
        paint.fillRect(-1.65, -1.65, 3.3, 3.3);
        paint.globalCompositeOperation = 'lighter';
        const sheetGlow = paint.createLinearGradient(-0.8, -0.9, 0.8, 1.1);
        sheetGlow.addColorStop(0, '#8373ffef');
        sheetGlow.addColorStop(0.5, '#6444ffa8');
        sheetGlow.addColorStop(1, '#a879ffd8');
        paint.fillStyle = sheetGlow;

        // Contours of translucent sheets, layered from the floating tendrils up.
        const sheets = lowPower ? 6 : 9, contours = lowPower ? 5 : 10;
        for (let sheet = sheets - 1; sheet >= 0; sheet--) {
            const twist = sheet * 2.39996;
            const cy = -0.84 + sheet * 1.72 / (sheets - 1);
            const width = 0.51 + 0.43 * Math.sin(Math.PI * (sheet + 1) / (sheets + 1));
            paint.strokeStyle = sheet % 3 === 0 ? '#b1a9ff' : '#8c67ff';
            for (let line = 0; line < contours; line++) {
                const cross = line / (contours - 1);
                paint.globalAlpha = line === 0 || line === contours - 1 ? 0.47 : 0.18;
                paint.lineWidth = line === 0 || line === contours - 1 ? 0.017 : 0.011;
                paint.beginPath();
                for (let i = 0; i <= 56; i++) {
                    const angle = i * TAU / 56;
                    const drift = twist + phase;
                    const fold = Math.cos(angle * 3 + drift) * 0.17 + Math.sin(angle * 5 - drift) * 0.065;
                    const x = (width + fold - cross * 0.31) * Math.cos(angle) + 0.14 * Math.cos(drift);
                    const y = cy + (0.32 - cross * 0.11) * Math.sin(angle)
                        + (0.18 + cross * 0.08) * Math.sin(2 * angle + twist)
                        + 0.23 * Math.cos(angle + drift) + 0.09 * Math.sin(angle * 4 + phase);
                    if (i === 0) paint.moveTo(x, y);
                    else paint.lineTo(x, y);
                }
                paint.closePath();
                if (line === 0) {
                    paint.globalAlpha = 0.13;
                    paint.fill();
                    paint.globalAlpha = 0.47;
                }
                paint.stroke();
            }
        }

        paint.strokeStyle = '#b398ff';
        paint.globalAlpha = 0.34;
        paint.lineWidth = 0.012;
        for (let i = 0; i < (lowPower ? 9 : 16); i++) {
            const a = i * 2.39996, side = Math.cos(a);
            paint.beginPath();
            paint.moveTo(side * 0.55, -0.39 + Math.sin(a) * 0.17);
            paint.bezierCurveTo(-side * 0.98, 0.19, side * 1.37, 0.69,
                side * 1.1 + 0.15 * Math.sin(phase + a), 1.08 + 0.23 * Math.cos(phase + a));
            paint.stroke();
        }
        return sprite;
    }

    return { makeQuarkSurface, makeManifoldFrame };
})();
