import { processImage } from './ocr.js';
import { saveReading, loadReadings, renderReadings, clearReadings } from './storage.js';
import { showError, showSuccess, showScreen, updateStats } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  let cropper;
  let currentImageUrl;

  // Initialize UI
  updateStats();
  renderReadings(loadReadings());

  // Event Listeners
  document.getElementById('readMeterBtn').addEventListener('click', () => showScreen('cameraScreen'));
  document.getElementById('cancelCameraBtn').addEventListener('click', () => showScreen('mainScreen'));
  document.getElementById('cancelCropBtn').addEventListener('click', () => {
    if (cropper) cropper.destroy();
    showScreen('cameraScreen');
  });
  document.getElementById('cancelConfirmBtn').addEventListener('click', () => {
    if (cropper) cropper.destroy();
    URL.revokeObjectURL(currentImageUrl);
    showScreen('mainScreen');
  });
  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Clear all readings? This cannot be undone.')) {
      clearReadings();
      updateStats();
      renderReadings(loadReadings());
      showSuccess('All readings cleared');
    }
  });
  document.getElementById('closeError').addEventListener('click', () => document.getElementById('errorMessage').classList.add('hidden'));
  document.getElementById('closeSuccess').addEventListener('click', () => document.getElementById('successMessage').classList.add('hidden'));

  // Camera Input
  document.getElementById('cameraInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError('Image too large. Please use an image smaller than 10MB');
      return;
    }

    currentImageUrl = URL.createObjectURL(file);
    document.getElementById('cropImage').src = currentImageUrl;
    showScreen('cropScreen');

    cropper = new Cropper(document.getElementById('cropImage'), {
      aspectRatio: NaN,
      viewMode: 1,
      autoCropArea: 0.8,
      movable: true,
      zoomable: true,
      scalable: true,
      guides: true,
      highlight: true,
    });
  });

  // Crop and Process
  document.getElementById('confirmCropBtn').addEventListener('click', async () => {
    if (!cropper) {
      showError('No image to process');
      return;
    }

    showScreen('ocrScreen');
    try {
      const canvas = cropper.getCroppedCanvas({ maxWidth: 800, maxHeight: 400 });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));

      const reading = await Promise.race([
        processImage(blob),
        new Promise((_, reject) => setTimeout(() => reject(new Error('OCR processing timed out')), 20000)),
      ]);

      document.getElementById('croppedPreview').src = URL.createObjectURL(blob);
      document.getElementById('readingInput').value = reading;
      const now = new Date();
      document.getElementById('currentDate').textContent = now.toLocaleDateString();
      document.getElementById('currentTime').textContent = now.toLocaleTimeString();
      showScreen('confirmScreen');
      cropper.destroy();
    } catch (error) {
      showError(`Failed to extract reading: ${error.message}. Enter manually.`);
      document.getElementById('croppedPreview').src = URL.createObjectURL(blob);
      document.getElementById('readingInput').value = '';
      const now = new Date();
      document.getElementById('currentDate').textContent = now.toLocaleDateString();
      document.getElementById('currentTime').textContent = now.toLocaleTimeString();
      showScreen('confirmScreen');
    }
  });

  // Save Reading
  document.getElementById('saveReadingBtn').addEventListener('click', () => {
    const reading = document.getElementById('readingInput').value.trim();
    if (!reading || isNaN(parseFloat(reading))) {
      showError('Please enter a valid meter reading');
      return;
    }

    const newReading = {
      id: Date.now(),
      value: parseFloat(reading),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
    saveReading(newReading);
    showSuccess(`Reading ${reading} kWh saved successfully!`);
    updateStats();
    renderReadings(loadReadings());
    URL.revokeObjectURL(currentImageUrl);
    showScreen('mainScreen');
  });

  // Accessibility: Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (cropper) cropper.destroy();
      URL.revokeObjectURL(currentImageUrl);
      showScreen('mainScreen');
    }
  });

  // PWA Install Prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.createElement('button');
    installBtn.textContent = '📱 Install App';
    installBtn.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm hover:bg-blue-700';
    installBtn.onclick = () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') console.log('PWA installed');
        deferredPrompt = null;
        installBtn.remove();
      });
    };
    document.body.appendChild(installBtn);
  });
});