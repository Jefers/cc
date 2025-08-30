export async function processImage(file) {
  try {
    // Preprocess image
    const processedImage = await preprocessImage(file);
    
    // Perform OCR with Tesseract.js
    const { data: { text } } = await Tesseract.recognize(processedImage, 'eng', {
      logger: (m) => console.log(m),
      tessedit_char_whitelist: '0123456789', // Restrict to digits
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // Single block for meter readings
    });
    console.log('OCR Raw Text:', text);

    // Clean and validate result
    const numbers = text.match(/\b\d{4,}\b/g); // Match 4+ digits
    if (!numbers) throw new Error('No valid meter reading found in image');
    return numbers[0];
  } catch (error) {
    throw new Error('OCR processing failed: ' + error.message);
  }
}

function preprocessImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxWidth = 800;
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