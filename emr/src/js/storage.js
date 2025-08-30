export function saveReading(reading) {
  const readings = loadReadings();
  readings.push(reading);
  localStorage.setItem('meterReadings', JSON.stringify(readings));
}

export function loadReadings() {
  const data = localStorage.getItem('meterReadings');
  return data ? JSON.parse(data) : [];
}

export function renderReadings(readings) {
  const readingList = document.getElementById('readingList');
  readingList.innerHTML = '';
  readings.forEach((reading) => {
    const li = document.createElement('li');
    li.className = 'reading-item';
    li.innerHTML = `<span>${reading.reading} units</span><span>${reading.timestamp}</span>`;
    readingList.appendChild(li);
  });
}