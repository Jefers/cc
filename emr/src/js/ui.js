export function showScreen(screenId) {
  const screens = ['mainScreen', 'cameraScreen', 'cropScreen', 'ocrScreen', 'confirmScreen'];
  screens.forEach(id => {
    const element = document.getElementById(id);
    if (id === screenId) {
      element.classList.remove('hidden');
      element.classList.add('fade-in');
    } else {
      element.classList.add('hidden');
      element.classList.remove('fade-in');
    }
  });
}

export function showError(message) {
  document.getElementById('errorText').textContent = message;
  document.getElementById('errorMessage').classList.remove('hidden');
  setTimeout(() => document.getElementById('errorMessage').classList.add('hidden'), 5000);
}

export function showSuccess(message) {
  document.getElementById('successText').textContent = message;
  document.getElementById('successMessage').classList.remove('hidden');
  setTimeout(() => document.getElementById('successMessage').classList.add('hidden'), 3000);
}

export function updateStats() {
  const readings = loadReadings();
  document.getElementById('totalReadings').textContent = readings.length;
  document.getElementById('lastReading').textContent = readings.length > 0 ? `${readings[0].value} kWh` : '-';
}