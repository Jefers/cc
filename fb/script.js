// Data Models
let transactions = [];
let savingsGoals = [];
let projections = {
    weekly: 0,
    monthly: 0
};

// Initialize data from localStorage and set up form
function init() {
    loadData();
    updateDashboard();
    setDefaultDate();
    setupFormListeners();
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Set up form event listeners
function setupFormListeners() {
    const form = document.getElementById('transaction-form');
    const recurringCheckbox = document.getElementById('recurring');
    const recurringDaySelect = document.getElementById('recurring-day');
    const recurringLabel = document.querySelector('label[for="recurring-day"]');

    // Show/hide recurring day select based on checkbox
    recurringCheckbox.addEventListener('change', () => {
        const isChecked = recurringCheckbox.checked;
        recurringDaySelect.classList.toggle('hidden', !isChecked);
        recurringLabel.classList.toggle('hidden', !isChecked);
        if (isChecked) {
            recurringDaySelect.setAttribute('required', 'true');
        } else {
            recurringDaySelect.removeAttribute('required');
        }
    });

    form.addEventListener('submit', handleAddTransaction);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
    localStorage.setItem('projections', JSON.stringify(projections));
}

// Load data from localStorage
function loadData() {
    const savedTransactions = localStorage.getItem('transactions');
    const savedGoals = localStorage.getItem('savingsGoals');
    const savedProjections = localStorage.getItem('projections');

    if (savedTransactions) transactions = JSON.parse(savedTransactions);
    if (savedGoals) savingsGoals = JSON.parse(savedGoals);
    if (savedProjections) projections = JSON.parse(savedProjections);
}

// Handle adding a new transaction
function handleAddTransaction(event) {
    event.preventDefault();
    const form = event.target;
    const type = form.type.value;
    const category = form.category.value;
    const amount = parseFloat(form.amount.value);
    const date = form.date.value;
    const description = form.description.value.trim();
    const recurring = form.recurring.checked;
    const recurringDay = recurring ? form['recurring-day'].value : '';

    // Validate Worker Wages note
    if (category === 'Worker Wages' && !description) {
        alert('Please provide a worker name for Worker Wages.');
        return;
    }

    const transaction = {
        id: Date.now(), // Unique ID based on timestamp
        type,
        category,
        amount,
        date,
        description,
        recurring,
        recurringDay
    };

    transactions.push(transaction);
    saveData();
    updateDashboard();
    form.reset();
    setDefaultDate(); // Reset date to today
}

// Update dashboard with balance, burn rate, weekly calendar, and pie chart
function updateDashboard() {
    // Calculate current balance
    const balance = transactions.reduce((total, t) => {
        return t.type === 'income' ? total + t.amount : total - t.amount;
    }, 0);
    document.getElementById('balance').textContent = `Current Balance: ₱${balance.toFixed(2)}`;

    // Calculate monthly burn rate
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((total, t) => total + t.amount, 0);
    const burnRate = daysInMonth > 0 ? monthlyExpenses / daysInMonth : 0;
    document.getElementById('burn-rate').textContent = `Monthly Burn Rate: ₱${burnRate.toFixed(2)}/day`;

    // Weekly calendar
    updateWeeklyCalendar();

    // Category pie chart
    updateCategoryChart();
}

// Update weekly calendar
function updateWeeklyCalendar() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start on Sunday

    // Generate header with dates
    const headerRow = document.getElementById('calendar-header');
    headerRow.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const th = document.createElement('th');
        th.textContent = `${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
        headerRow.appendChild(th);
    }

    // Group transactions by day
    const bodyRow = document.getElementById('calendar-body');
    bodyRow.innerHTML = '<tr></tr>';
    const row = bodyRow.querySelector('tr');

    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dayString = day.toISOString().split('T')[0];
        const dayTransactions = transactions.filter(t => t.date === dayString);

        const td = document.createElement('td');
        dayTransactions.forEach(t => {
            const div = document.createElement('div');
            div.className = `transaction-item ${t.type}`;
            div.textContent = `${t.category}: ₱${t.amount.toFixed(2)} ${t.description ? `(${t.description})` : ''}`;
            td.appendChild(div);
        });
        row.appendChild(td);
    }
}

// Update category pie chart
function updateCategoryChart() {
    const canvas = document.getElementById('category-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aggregate amounts by category
    const categoryTotals = {};
    transactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    const total = amounts.reduce((sum, val) => sum + val, 0);

    // Define colors for categories
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
    ];

    // Draw pie chart
    let startAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 10;

    categories.forEach((category, i) => {
        const sliceAngle = (amounts[i] / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        startAngle += sliceAngle;

        // Draw label
        const labelAngle = startAngle - sliceAngle / 2;
        const labelX = centerX + (radius + 20) * Math.cos(labelAngle);
        const labelY = centerY + (radius + 20) * Math.sin(labelAngle);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`${category} (${((amounts[i] / total) * 100).toFixed(1)}%)`, labelX, labelY);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', init);