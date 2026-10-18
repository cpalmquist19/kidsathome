const canvas = document.getElementById('view');
const stage = document.getElementById('stage');
const modeLabel = document.getElementById('weapon-mode-label');
const help = document.getElementById('weapon-help');
const sizeInput = document.getElementById('weaponSize');
const strengthInput = document.getElementById('weaponStrength');
const speedInput = document.getElementById('weaponSpeed');
const sizeValue = document.getElementById('weaponSizeValue');
const strengthValue = document.getElementById('weaponStrengthValue');
const speedValue = document.getElementById('weaponSpeedValue');
const weaponButtons = [...document.querySelectorAll('.weapon-button')];

let weapon = 'none';
let isApplyingDamage = false;
let weaponFiring = false;
let animationFrame = 0;

const WEAPONS = {
  none: { label: 'Brush mode', help: 'Choose a weapon, then tap an image target.' },
  missile: { label: 'Missile armed', help: 'Tap a target to launch an explosive missile.' },
  laser: { label: 'Laser armed', help: 'Tap a target to burn and pixelate the impact point.' },
  gravity: { label: 'Gravity bomb armed', help: 'Tap a target to pull the image into a gravity well.' },
};

function syncWeaponReadouts() {
  sizeValue.textContent = sizeInput.value;
  strengthValue.textContent = `${Number(strengthInput.value).toFixed(2)}×`;
  speedValue.textContent = speedInput.value;
}

[sizeInput, strengthInput, speedInput].forEach((input) => input.addEventListener('input', syncWeaponReadouts));
syncWeaponReadouts();

function setWeapon(nextWeapon) {
  weapon = nextWeapon;
  const details = WEAPONS[weapon];
  modeLabel.textContent = details.label;
  help.textContent = details.help;
  weaponButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.weapon === weapon));
  canvas.classList.toggle('weapon-armed', weapon !== 'none');
}

weaponButtons.forEach((button) => button.addEventListener('click', () => setWeapon(button.dataset.weapon)));

function findGuiInput(label) {
  const controller = [...document.querySelectorAll('.lil-gui .controller')].find(
    (element) => element.querySelector('.name')?.textContent.trim() === label,
  );
  return controller?.querySelector('input') || null;
}

function setGuiInput(input, value) {
  if (!input) return;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function selectBrushTool(label) {
  const button = [...document.querySelectorAll('#palette .tool')].find(
    (element) => element.textContent.includes(label),
  );
  button?.click();
}

function canvasClientPoint(x, y) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: rect.left + (x / canvas.width) * rect.width,
    y: rect.top + (y / canvas.height) * rect.height,
  };
}

function weaponCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  };
}

function createOverlay() {
  const overlay = document.createElement('canvas');
  overlay.className = 'weapon-overlay';
  document.body.appendChild(overlay);
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  overlay.width = Math.max(1, Math.round(rect.width * ratio));
  overlay.height = Math.max(1, Math.round(rect.height * ratio));
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  const context = overlay.getContext('2d');
  context.scale(ratio, ratio);
  return { overlay, context, rect };
}

function clearOverlay(overlay) {
  overlay.remove();
  cancelAnimationFrame(animationFrame);
}

function runEngineEffect(tool, impact, duration = 120) {
  const activeTool = document.querySelector('#palette .tool.active')?.textContent.trim().split('\n')[0];
  const brushSize = findGuiInput('Size (px)');
  const brushStrength = findGuiInput('Strength');
  const savedSize = brushSize?.value;
  const savedStrength = brushStrength?.value;
  const point = canvasClientPoint(impact.x, impact.y);
  const size = Number(sizeInput.value);
  const strength = Number(strengthInput.value);
  const originalCapture = canvas.setPointerCapture;

  selectBrushTool(tool);
  setGuiInput(brushSize, size);
  setGuiInput(brushStrength, strength);
  isApplyingDamage = true;
  canvas.setPointerCapture = () => {};

  canvas.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true, button: 0, pointerId: 905, clientX: point.x, clientY: point.y,
  }));

  window.setTimeout(() => {
    canvas.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true, button: 0, pointerId: 905, clientX: point.x, clientY: point.y,
    }));
    canvas.setPointerCapture = originalCapture;
    setGuiInput(brushSize, savedSize);
    setGuiInput(brushStrength, savedStrength);
    if (activeTool) selectBrushTool(activeTool);
    isApplyingDamage = false;
  }, duration);
}

function animateWeapon(kind, target) {
  weaponFiring = true;
  const { overlay, context, rect } = createOverlay();
  const destination = canvasClientPoint(target.x, target.y);
  const end = { x: destination.x - rect.left, y: destination.y - rect.top };
  const start = { x: rect.width * 0.5, y: rect.height + 20 };
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const duration = Math.max(160, Math.min(1050, (distance / Number(speedInput.value)) * 1000));
  const started = performance.now();

  const draw = (now) => {
    const progress = Math.min(1, (now - started) / duration);
    context.clearRect(0, 0, rect.width, rect.height);
    const x = start.x + (end.x - start.x) * progress;
    const y = start.y + (end.y - start.y) * progress;
    context.save();
    context.globalCompositeOperation = 'lighter';

    if (kind === 'laser') {
      const gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
      gradient.addColorStop(0, 'rgba(255, 40, 120, 0)');
      gradient.addColorStop(0.7, 'rgba(255, 35, 100, 0.7)');
      gradient.addColorStop(1, '#fff2f7');
      context.strokeStyle = gradient;
      context.lineWidth = Math.max(3, Number(sizeInput.value) / 24);
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    } else {
      context.fillStyle = kind === 'gravity' ? '#a78bfa' : '#fb7185';
      context.shadowColor = context.fillStyle;
      context.shadowBlur = 18;
      context.beginPath();
      context.arc(x, y, Math.max(5, Number(sizeInput.value) / 18), 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#fff7ed';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(x, y);
      context.stroke();
    }
    context.restore();

    if (progress < 1) {
      animationFrame = requestAnimationFrame(draw);
      return;
    }

    const effect = kind === 'missile' ? 'Explode' : kind === 'laser' ? 'Pixelate' : 'Black hole';
    runEngineEffect(effect, target, kind === 'gravity' ? 260 : 130);
    window.setTimeout(() => {
      clearOverlay(overlay);
      weaponFiring = false;
    }, 90);
  };

  animationFrame = requestAnimationFrame(draw);
}

canvas.addEventListener('pointerdown', (event) => {
  if (weapon === 'none' || isApplyingDamage || weaponFiring || event.button !== 0) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  animateWeapon(weapon, weaponCanvasPoint(event));
}, true);
