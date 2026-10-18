import { GifEncoder } from './gif_encoder.js';

const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('view');
const urlForm = document.getElementById('image-url-form');
const urlInput = document.getElementById('imageUrlInput');
const loadUrlButton = document.getElementById('loadUrlBtn');
const recordButton = document.getElementById('recordGifBtn');
const libraryStatus = document.getElementById('image-library-status');

const RECORDING_MS = 5000;
const FRAMES_PER_SECOND = 8;
const MAX_GIF_EDGE = 640;
let recorder = null;

function enableGuiDrag(attempt = 0) {
  const gui = document.querySelector('.lil-gui.root');
  const handle = gui?.querySelector('.title');
  if (!gui || !handle) {
    if (attempt < 12) requestAnimationFrame(() => enableGuiDrag(attempt + 1));
    return;
  }

  let drag = null;
  let suppressClick = false;

  const move = (event) => {
    if (!drag) return;
    const maxLeft = Math.max(0, window.innerWidth - gui.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - gui.offsetHeight);
    const left = Math.min(maxLeft, Math.max(0, drag.left + event.clientX - drag.x));
    const top = Math.min(maxTop, Math.max(0, drag.top + event.clientY - drag.y));
    gui.style.setProperty('left', `${left}px`, 'important');
    gui.style.setProperty('top', `${top}px`, 'important');
    gui.style.setProperty('right', 'auto', 'important');
    gui.style.setProperty('bottom', 'auto', 'important');
    drag.moved ||= Math.abs(event.clientX - drag.x) > 3 || Math.abs(event.clientY - drag.y) > 3;
  };

  const end = () => {
    if (!drag) return;
    suppressClick = drag.moved;
    drag = null;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
  };

  handle.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const bounds = gui.getBoundingClientRect();
    drag = { x: event.clientX, y: event.clientY, left: bounds.left, top: bounds.top, moved: false };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
  });
  handle.addEventListener('click', (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
  }, true);
}

enableGuiDrag();

function setStatus(message) {
  if (libraryStatus) libraryStatus.textContent = message;
}

function loadIntoPlayground(file) {
  if (!fileInput) throw new Error('Image loader is unavailable.');
  const transfer = new DataTransfer();
  transfer.items.add(file);
  fileInput.files = transfer.files;
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
}

function filenameFromUrl(value, contentType) {
  const pathname = new URL(value).pathname;
  const fromPath = pathname.split('/').pop();
  if (fromPath && fromPath.includes('.')) return fromPath;
  const extension = contentType === 'image/png' ? 'png' : contentType === 'image/gif' ? 'gif' : 'jpg';
  return `remote-image.${extension}`;
}

urlForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const remoteUrl = urlInput?.value.trim();
  if (!remoteUrl) return;

  try {
    const parsed = new URL(remoteUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Use an HTTP or HTTPS image URL.');

    if (loadUrlButton) loadUrlButton.disabled = true;
    setStatus('Loading remote image…');
    const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(remoteUrl)}`);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'The image could not be loaded.');
    }

    const contentType = response.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
    const image = new File([await response.blob()], filenameFromUrl(remoteUrl, contentType), { type: contentType });
    loadIntoPlayground(image);
    setStatus(`Loaded ${image.name}`);
  } catch (error) {
    setStatus(error.message || 'Could not load that image URL.');
  } finally {
    if (loadUrlButton) loadUrlButton.disabled = false;
  }
});

function stopRecording() {
  if (!recorder) return;
  const finished = recorder;
  recorder = null;
  clearInterval(finished.timer);
  clearTimeout(finished.timeout);

  if (recordButton) {
    recordButton.disabled = true;
    recordButton.classList.remove('is-recording');
    recordButton.textContent = 'Encoding GIF…';
  }
  setStatus('Encoding animated GIF…');

  window.setTimeout(() => {
    try {
      const gif = GifEncoder.encode({
        width: finished.width,
        height: finished.height,
        frames: finished.frames,
        delayCentiseconds: Math.round(100 / FRAMES_PER_SECOND),
      });
      const blob = new Blob([gif], { type: 'image/gif' });
      const download = document.createElement('a');
      download.href = URL.createObjectURL(blob);
      download.download = 'image-playground-animation.gif';
      download.click();
      window.setTimeout(() => URL.revokeObjectURL(download.href), 5000);
      setStatus(`Saved ${finished.frames.length}-frame animated GIF.`);
    } catch (error) {
      console.error('GIF export failed:', error);
      setStatus('Could not export the animated GIF.');
    } finally {
      if (recordButton) {
        recordButton.disabled = false;
        recordButton.textContent = '⏺ Record GIF';
      }
    }
  }, 0);
}

function startRecording() {
  if (!canvas?.width || !canvas?.height) {
    setStatus('Load an image before recording.');
    return;
  }

  const scale = Math.min(1, MAX_GIF_EDGE / Math.max(canvas.width, canvas.height));
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));
  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = width;
  captureCanvas.height = height;
  const captureContext = captureCanvas.getContext('2d', { willReadFrequently: true });
  if (!captureContext) {
    setStatus('GIF recording is not available in this browser.');
    return;
  }

  const captureFrame = () => {
    captureContext.drawImage(canvas, 0, 0, width, height);
    recorder.frames.push(GifEncoder.quantizeRGBA(captureContext.getImageData(0, 0, width, height).data));
  };

  recorder = {
    width,
    height,
    frames: [],
    timer: 0,
    timeout: 0,
  };
  captureFrame();
  recorder.timer = window.setInterval(captureFrame, 1000 / FRAMES_PER_SECOND);
  recorder.timeout = window.setTimeout(stopRecording, RECORDING_MS);

  if (recordButton) {
    recordButton.classList.add('is-recording');
    recordButton.textContent = '⏹ Stop & Export';
  }
  setStatus('Recording for up to 5 seconds — apply effects, then stop to export.');
}

recordButton?.addEventListener('click', () => {
  if (recorder) stopRecording();
  else startRecording();
});
