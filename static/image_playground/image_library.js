const fileInput = document.getElementById('fileInput');
const status = document.getElementById('image-library-status');

function updateStatus(message) {
  if (status) status.textContent = message;
}

document.querySelectorAll('.library-image').forEach((button) => {
  button.addEventListener('click', async () => {
    if (!fileInput || button.disabled) return;

    const { imageName, imageUrl } = button.dataset;
    button.disabled = true;
    updateStatus(`Loading ${imageName}…`);

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Could not load image (${response.status})`);

      const imageFile = new File([await response.blob()], imageName, {
        type: response.headers.get('content-type') || 'image/*',
      });
      const transfer = new DataTransfer();
      transfer.items.add(imageFile);
      fileInput.files = transfer.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      document.querySelectorAll('.library-image.is-selected').forEach((item) => item.classList.remove('is-selected'));
      button.classList.add('is-selected');
      updateStatus(`Loaded ${imageName}`);
    } catch (error) {
      updateStatus(`Could not load ${imageName}.`);
      console.error('Image library load failed:', error);
    } finally {
      button.disabled = false;
    }
  });
});
