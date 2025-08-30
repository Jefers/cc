import { createWorker } from 'tesseract.js';

export async function processImage(file) {
  const worker = await createWorker({ logger: (m) => console.log(m) });
  try {
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // Preprocess image and pass blob directly
    const processedImage = await preprocessImage(file);
    const { data: { text } } = await worker.recognize(processedImage);
    console.log('OCR Raw Text:', text);
    const numbers = text.match(/\b\d{4,}\b/g); // Match numbers with 4+ digits
    if (!numbers) throw new Error('No numbers found in image');
    return numbers[0];
  } catch (error) {
    throw new Error('OCR processing failed: ' + error.message);
  } finally {
    await worker.terminate();
  }
}

function preprocessImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxWidth = 1000;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'grayscale(100%) contrast(200%) brightness(110%)';
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    };
    img.src = URL.createObjectURL(file);
  });
}