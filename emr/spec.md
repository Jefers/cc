I want to build a mobile-first responsive web app to read electricity meter values by taking a photo, extracting the meter reading digits using OCR, and storing the reading with a date and time stamp in local storage. Purpose: Allow users to capture and record electricity meter readings easily.
Target Users: Homeowners or tenants tracking electricity meter readings.
Key Screen: A main screen with a prominent "Read Meter" button that opens the mobile camera. After capturing the photo, display a cropping interface to select the meter reading digits, show the extracted reading for confirmation or manual correction, and list the reading history with timestamps.
Must-Have Features:Capture a photo using the mobile device’s camera.
Crop the image to focus on the meter reading digits.
Use OCR to extract the numeric meter reading (e.g., “12345”).
Allow manual correction of the OCR result.
Store the reading and timestamp (e.g., “12345 units at 8/30/2025, 08:27 AM”) in local storage.
Display a history of saved readings.

Mobile-First Design Priorities:Fully responsive, touch-optimized UI.
Fast loading and processing.
Accessible (screen reader support, ARIA attributes).
Small image previews (e.g., max height 300px).

Tech Stack: Prefer JavaScript, HTML, CSS (e.g., Tailwind CSS), Tesseract.js for OCR, Cropper.js for cropping, and Vite for building. Open to other suggestions if simpler or more reliable.
Data Storage: LocalStorage for client-side persistence.
Security: No authentication required; data stays local.
Deployment: Web app, PWA-capable for Android installation.

Please provide clean, modular, production-ready code with best practices, including error handling, debugging logs, and a responsive UI. Ensure the OCR is robust with cropping to improve accuracy and a manual input fallback for failed OCR attempts. Include a .gitignore for Node.js projects.

