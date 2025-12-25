// script.js - Complete working version for your hours tracker

const nameInput = document.getElementById('nameInput');
const chartTitle = document.getElementById('chartTitle');
const editNameBtn = document.getElementById('editNameBtn');
const csvInput = document.getElementById('csvFile');
const exportBtn = document.getElementById('exportBtn');
const chart = document.getElementById('chart');
const summaryEl = document.getElementById('summary');

let currentData = []; // Array of {date: 'YYYY-MM-DD', totalHours: number, displayTime: string}

// Load saved name from localStorage
const savedName = localStorage.getItem('hoursTrackerName') || "Someone";
chartTitle.textContent = `${savedName}'s Hours`;

editNameBtn.onclick = () => {
  nameInput.style.display = 'inline-block';
  nameInput.value = savedName;
  nameInput.focus();
  editNameBtn.style.display = 'none';
};

nameInput.onblur = () => {
  if (nameInput.value.trim()) {
    const newName = nameInput.value.trim();
    localStorage.setItem('hoursTrackerName', newName);
    chartTitle.textContent = `${newName}'s Hours`;
  }
  nameInput.style.display = 'none';
  editNameBtn.style.display = 'inline-block';
};

nameInput.onkeydown = (e) => {
  if (e.key === 'Enter') nameInput.blur();
};

// ─────────────────────────────────────────────────────────────────────────────
// CSV Import Handling
// ─────────────────────────────────────────────────────────────────────────────

csvInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => parseCSV(ev.target.result);
  reader.readAsText(file);
});

function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  currentData = [];

  // Skip header row (line 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [datePart, timePart] = line.split(',').map(s => s.trim());

    if (!datePart || !timePart) continue;

    let dateStr = datePart.trim();

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.warn(`Invalid date format on line ${i + 1}: ${datePart}`);
      continue;
    }

    // Parse time HH:MM
    const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      console.warn(`Invalid time format on line ${i + 1}: ${timePart}`);
      continue;
    }

    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    if (isNaN(hours) || isNaN(minutes) || minutes > 59) continue;

    const totalHours = hours + minutes / 60;

    currentData.push({
      date: dateStr,
      totalHours,
      displayTime: timePart
    });
  }

  if (currentData.length === 0) {
    summaryEl.textContent = "No valid data found in CSV";
    exportBtn.style.display = 'none';
    chart.innerHTML = '<div style="color:#f66; padding:20px; text-align:center;">No valid entries found</div>';
    return;
  }

  // Sort by date
  currentData.sort((a, b) => a.date.localeCompare(b.date));

  exportBtn.style.display = 'inline-block';
  renderChart();
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV Export
// ─────────────────────────────────────────────────────────────────────────────

exportBtn.addEventListener('click', () => {
  if (!currentData.length) return;

  const rows = [['Date', 'Hours']];
  currentData.forEach(item => {
    rows.push([item.date, item.displayTime]);
  });

  const csvContent = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${chartTitle.textContent.replace("'s Hours", "")}_hours_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

// ─────────────────────────────────────────────────────────────────────────────
// Render the bar chart - shows all dates from CSV
// ─────────────────────────────────────────────────────────────────────────────

function renderChart() {
  chart.innerHTML = ''; // Clear previous bars

  let totalMinutes = 0;
  let daysWithHours = 0;
  // Before the loop – find max hours in dataset
const maxHours = Math.max(...currentData.map(item => item.totalHours), 1);  // at least 1 to avoid division by zero

  currentData.forEach(item => {
    const { totalHours, displayTime, date } = item;

    if (totalHours > 0) {
      totalMinutes += Math.round(totalHours * 60);
      daysWithHours++;
    }

    // Create bar wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'bar-wrapper';

    // Create bar
    const bar = document.createElement('div');
    bar.className = 'bar';
    // Inside the loop, instead of fixed /8
    const heightPercent = (totalHours / maxHours) * 100;
    bar.style.height = `${heightPercent}%`;
    bar.dataset.tooltip = `${displayTime} • ${totalHours.toFixed(2)}h`;

    // Apply color classes
    if (totalHours <= 2) bar.classList.add('purple');
    else if (totalHours <= 4) bar.classList.add('orange');
    else if (totalHours <= 6) bar.classList.add('yellow');
    else bar.classList.add('green');

    // Create label
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric'
    });

    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    chart.appendChild(wrapper);
  });

  // Summary statistics
  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;
  const avgMin = daysWithHours > 0 ? Math.round(totalMinutes / daysWithHours) : 0;
  const avgH = Math.floor(avgMin / 60);
  const avgM = avgMin % 60;

  summaryEl.innerHTML = `
    Total: <strong>${totalH}h ${totalM}m</strong>  
      •  
    Avg/day: <strong>${avgH}h ${avgM}m</strong> 
      (${daysWithHours}/${currentData.length} days with hours)
  `;
}