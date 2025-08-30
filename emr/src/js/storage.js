export function saveReading(reading) {
  const readings = loadReadings();
  readings.unshift(reading);
  localStorage.setItem('meterReadings', JSON.stringify(readings));
}

export function loadReadings() {
  const data = localStorage.getItem('meterReadings');
  return data ? JSON.parse(data) : [];
}

export function clearReadings() {
  localStorage.removeItem('meterReadings');
}

export function renderReadings(readings) {
  const container = document.getElementById('readingsList');
  if (readings.length === 0) {
    container.innerHTML = `<div class="text-gray-500 text-center py-8">No readings yet. Take your first photo!</div>`;
    return;
  }

  container.innerHTML = readings.slice(0, 10).map(reading => `
    <div class="reading-item bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-bold text-lg text-gray-800">${reading.value} kWh</div>
          <div class="text-sm text-gray-600">📅 ${reading.date} • 🕐 ${reading.time}</div>
        </div>
        <button onclick="deleteReading(${reading.id})" class="text-red-500 hover:text-red-700 text-sm" aria-label="Delete reading">🗑️</button>
      </div>
    </div>
  `).join('');

  if (readings.length > 10) {
    container.innerHTML += `<div class="text-center text-gray-500 text-sm py-2">... and ${readings.length - 10} more readings</div>`;
  }
}

// Global delete function for inline button
window.deleteReading = (id) => {
  if (confirm('Delete this reading?')) {
    const readings = loadReadings().filter(r => r.id !== id);
    localStorage.setItem('meterReadings', JSON.stringify(readings));
    updateStats();
    renderReadings(readings);
    document.getElementById('successMessage').classList.remove('hidden');
    document.getElementById('successText').textContent = 'Reading deleted';
    setTimeout(() => document.getElementById('successMessage').classList.add('hidden'), 3000);
  }
};