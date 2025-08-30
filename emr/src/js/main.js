import { processImage } from './ocr.js';
import { saveReading, loadReadings, renderReadings } from './storage.js';
import { showResult, updateUI } from './ui.js';
import Cropper from 'cropperjs';

document.addEventListener('DOMContentLoaded', () => {
  const readMeterBtn = document.getElementById('readMeterBtn');
  const cameraInput = document.getElementById('cameraInput');
  const cropModal = document.getElementById('cropModal');
  const cropImage = document.getElementById('cropImage');
  const cropBtn = document.getElementById('cropBtn');
  const cancelCropBtn = document.getElementById('cancelCropBtn');
  const confirmReading = document.getElementById('confirmReading');
  const ocrResult = document.getElementById('ocrResult');
  const saveReadingBtn = document.getElementById('saveReadingBtn');
  const recropBtn = document.getElementById('recropBtn');
  let cropper;
  let currentImageUrl;

  // Initialize UI with stored readings
  renderReadings(loadReadings());

  // Trigger camera input
  readMeterBtn.addEventListener('click', () => {
    cameraInput.click();
  });

  // Handle image capture
  cameraInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show cropping modal
    currentImageUrl = URL.createObjectURL(file);
    cropImage.src = currentImageUrl;
    cropModal.classList.remove('hidden');

    // Initialize Cropper.js
    cropper = new Cropper(cropImage, {
      aspectRatio: NaN, // Freeform cropping
      viewMode: 1, // Restrict crop to image
      autoCropArea: 0.3, // Smaller initial crop area for precision
      movable: true,
      zoomable: true,
      scalable: true,
      guides: true, // Show crop guides
      highlight: true, // Highlight crop area
    });

    // Handle crop button
    cropBtn.addEventListener('click', async () => {
      updateUI({ processing: true });
      cropModal.classList.add('hidden');

      try {
        // Get cropped image as blob
        const croppedCanvas = cropper.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
        const croppedBlob = await new Promise((resolve) => {
          croppedCanvas.toBlob(resolve, 'image/jpeg', 0.9);
        });

        // Process cropped image with timeout
        const reading = await Promise.race([
          processImage(croppedBlob),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('OCR processing timed out')), 10000)
          ),
        ]);

        // Update preview with cropped image
        document.getElementById('meterImage').src = URL.createObjectURL(croppedBlob);
        document.getElementById('preview').classList.remove('hidden');

        // Show confirmation input
        ocrResult.value = reading;
        confirmReading.classList.remove('hidden');
        showResult('Please confirm or adjust the meter reading.');

        // Clean up cropper
        cropper.destroy();
      } catch (error) {
        showResult(`Error processing image: ${error.message}. Enter reading manually.`, true);
        console.error(error);
        confirmReading.classList.remove('hidden');
        ocrResult.value = '';
      } finally {
        updateUI({ processing: false });
      }
    }, { once: true });

    // Handle cancel crop
    cancelCropBtn.addEventListener('click', () => {
      cropModal.classList.add('hidden');
      URL.revokeObjectURL(currentImageUrl);
      cropper.destroy();
      cameraInput.value = '';
    }, { once: true });

    // Handle save reading
    saveReadingBtn.addEventListener('click', () => {
      const reading = ocrResult.value;
      if (!reading) {
        showResult('Please enter a valid reading.', true);
        return;
      }
      const timestamp = new Date().toLocaleString();
      saveReading({ reading, timestamp });
      showResult(`Meter Reading: ${reading} units at ${timestamp}`);
      renderReadings(loadReadings());
      confirmReading.classList.add('hidden');
      URL.revokeObjectURL(currentImageUrl);
      cameraInput.value = '';
    }, { once: true });

    // Handle recrop
    recropBtn.addEventListener('click', () => {
      confirmReading.classList.add('hidden');
      cropImage.src = currentImageUrl;
      cropModal.classList.remove('hidden');
      cropper = new Cropper(cropImage, {
        aspectRatio: NaN,
        viewMode: 1,
        autoCropArea: 0.3,
        movable: true,
        zoomable: true,
        scalable: true,
        guides: true,
        highlight: true,
      });
    }, { once: true });
  });
});