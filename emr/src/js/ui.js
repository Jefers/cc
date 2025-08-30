export function showResult(message, isError = false) {
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = message;
  resultDiv.className = `text-center mb-4 ${isError ? 'text-red-500' : 'text-green-500'}`;
  resultDiv.setAttribute('role', 'alert');
}

export function updateUI({ processing }) {
  const readMeterBtn = document.getElementById('readMeterBtn');
  readMeterBtn.disabled = processing;
  readMeterBtn.textContent = processing ? 'Processing...' : 'Read Meter';
}