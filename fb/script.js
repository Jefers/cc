// Data Models
let transactions = [];
let savingsGoals = [];
let projections = { weekly: 0, monthly: 0 };
let savingsStreak = { weeks: [], badgeAwarded: false };

// Initialize data from localStorage and set up forms
function init() {
    loadData();
    updateDashboard();
    setDefaultDate();
    setupFormListeners();
    requestNotificationPermission();
    checkReminders();
    updateSavingsGoals();
}

// Request browser notification permission
function requestNotificationPermission() {
    if ('Notification' in window && localStorage.getItem('notificationPermission') !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                localStorage.setItem('notificationPermission', 'granted');
            }
        });
    }
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Set up form event listeners
function setupFormListeners() {
    const transactionForm = document.getElementById('transaction-form');
    const savingsGoalForm = document.getElementById('savings-goal-form');
    const recurringCheckbox = document.getElementById('recurring');
    const recurringDaySelect = document.getElementById('recurring-day');
    const recurringLabel = document.querySelector('label[for="recurring-day"]');
    const categorySelect = document.getElementById('category');
    const estimatedAmountInput = document.getElementById('estimated-amount');
    const estimatedLabel = document.querySelector('label[for="estimated-amount"]');

    // Show/hide recurring day select
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

    // Show/hide estimated amount for utilities
    categorySelect.addEventListener('change', () => {
        const isUtilities = categorySelect.value === 'Utilities';
        estimatedAmountInput.classList.toggle('hidden', !isUtilities);
        estimatedLabel.classList.toggle('hidden', !isUtilities);
        if (isUtilities) {
            estimatedAmountInput.setAttribute('required', 'true');
        } else {
            estimatedAmountInput.removeAttribute('required');
        }
    });

    transactionForm.addEventListener('submit', handleAddTransaction);
    savingsGoalForm.addEventListener('submit', handleAddSavingsGoal);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
    localStorage.setItem('projections', JSON.stringify(projections));
    localStorage.setItem('savingsStreak', JSON.stringify(savingsStreak));
}

// Load data from localStorage
function loadData() {
    const savedTransactions = localStorage.getItem('transactions');
    const savedGoals = localStorage.getItem('savingsGoals');
    const savedProjections = localStorage.getItem('projections');
    const savedStreak = localStorage.getItem('savingsStreak');

    if (savedTransactions) transactions = JSON.parse(savedTransactions);
    if (savedGoals) savingsGoals = JSON.parse(savedGoals);
    if (savedProjections) projections = JSON.parse(savedProjections);
    if (savedStreak) savingsStreak = JSON.parse(savedStreak);
}

// Handle adding a new transaction
function handleAddTransaction(event) {
    event.preventDefault();
    const form = event.target;
    const type = form.type.value;
    const category = form.category.value;
    const amount = parseFloat(form.amount.value);
    const estimatedAmount = category === 'Utilities' ? parseFloat(form['estimated-amount'].value) || 0 : 0;
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
        id: Date.now(),
        type,
        category,
        amount,
        estimatedAmount,
        date,
        description,
        recurring,
        recurringDay,
        goalId: null // For Savings Transfer allocation
    };

    // Handle Savings Transfer allocation
    if (category === 'Savings Transfer' && savingsGoals.length > 0) {
        const goalNames = savingsGoals.map(g => g.name).join(', ');
        const goalName = prompt(`Allocate to which savings goal? (${goalNames})`);
        const goal = savingsGoals.find(g => g.name.toLowerCase() === goalName?.toLowerCase());
        if (goal) {
            transaction.goalId = goal.id;
            goal.currentAmount = (goal.currentAmount || 0) + amount;
        } else if (goalName) {
            alert('Invalid goal name. Transaction added without allocation.');
        }
    }

    transactions.push(transaction);
    saveData();
    updateDashboard();
    checkReminders();
    updateSavingsGoals();
    checkSavingsStreak();

    // Suggest allocating 10% for income
    if (type === 'income' && savingsGoals.length > 0) {
        const suggestedAmount = amount * 0.1;
        const defaultGoal = savingsGoals.find(g => g.name.toLowerCase().includes('buffer')) || savingsGoals[0];
        if (confirm(`Allocate ₱${suggestedAmount.toFixed(2)} (10%) to ${defaultGoal.name}?`)) {
            const savingsTransaction = {
                id: Date.now() + 1,
                type: 'expense',
                category: 'Savings Transfer',
                amount: suggestedAmount,
                estimatedAmount: 0,
                date,
                description: `Auto-allocated to ${defaultGoal.name}`,
                recurring: false,
                recurringDay: '',
                goalId: defaultGoal.id
            };
            defaultGoal.currentAmount = (defaultGoal.currentAmount || 0) + suggestedAmount;
            transactions.push(savingsTransaction);
            saveData();
            updateDashboard();
            updateSavingsGoals();
            checkSavingsStreak();
        }
    }

    form.reset();
    setDefaultDate();
}

// Handle adding a new savings goal
function handleAddSavingsGoal(event) {
    event.preventDefault();
    const form = event.target;
    const name = form['goal-name'].value.trim();
    const targetAmount = parseFloat(form['goal-target'].value);
    const targetDate = form['goal-date'].value;

    if (savingsGoals.some(g => g.name.toLowerCase() === name.toLowerCase())) {
        alert('A goal with this name already exists.');
        return;
    }

    const goal = {
        id: Date.now(),
        name,
        targetAmount,
        targetDate,
        currentAmount: 0
    };

    savingsGoals.push(goal);
    saveData();
    updateSavingsGoals();
    form.reset();
}

// Handle editing a transaction's due date
function editTransactionDueDate(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const newDay = prompt('Enter new recurring day (1-31):', transaction.recurringDay);
    if (newDay && !isNaN(newDay) && newDay >= 1 && newDay <= 31) {
        transaction.recurringDay = newDay;
        saveData();
        updateDashboard();
        checkReminders();
    } else if (newDay !== null) {
        alert('Please enter a valid day (1-31).');
    }
}

// Check for upcoming reminders
function checkReminders() {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const reminderList = document.getElementById('reminder-list');
    reminderList.innerHTML = '';

    const reminders = transactions
        .filter(t => t.recurring && t.type === 'expense' && t.recurringDay)
        .map(t => {
            const dueDay = parseInt(t.recurringDay);
            const dueDate = new Date(currentYear, currentMonth, dueDay);
            if (dueDay < currentDay) {
                dueDate.setMonth(currentMonth + 1);
            }
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            return { transaction: t, daysUntilDue, dueDate };
        })
        .filter(r => r.daysUntilDue >= 0 && r.daysUntilDue <= 7);

    reminders.forEach(r => {
        const amount = r.transaction.category === 'Utilities' && r.transaction.estimatedAmount ? r.transaction.estimatedAmount : r.transaction.amount;
        const message = `${r.transaction.category} due in ${r.daysUntilDue} day${r.daysUntilDue === 1 ? '' : 's'} - Prepare ₱${amount.toFixed(2)}`;

        // Dashboard reminder
        const li = document.createElement('li');
        li.className = 'reminder-item';
        li.textContent = message;
        reminderList.appendChild(li);

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(message);
        }
    });
}

// Check savings streak for badges
function checkSavingsStreak() {
    const today = new Date();
    const weekNumber = Math.floor((today.getTime() / (1000 * 60 * 60 * 24 * 7)) % 52);

    // Track weeks with savings transfers
    const hasSavingsThisWeek = transactions.some(t => 
        t.category === 'Savings Transfer' && 
        Math.floor((new Date(t.date).getTime() / (1000 * 60 * 60 * 24 * 7)) % 52) === weekNumber
    );

    if (hasSavingsThisWeek && !savingsStreak.weeks.includes(weekNumber)) {
        savingsStreak.weeks.push(weekNumber);
        savingsStreak.weeks = [...new Set(savingsStreak.weeks)].sort((a, b) => a - b);
    }

    // Check for consecutive weeks (3 weeks for badge)
    let consecutiveWeeks = 0;
    for (let i = 1; i < savingsStreak.weeks.length; i++) {
        if (savingsStreak.weeks[i] === savingsStreak.weeks[i - 1] + 1) {
            consecutiveWeeks++;
        } else {
            consecutiveWeeks = 0;
        }
    }

    if (consecutiveWeeks >= 2 && !savingsStreak.badgeAwarded) {
        savingsStreak.badgeAwarded = true;
        saveData();
    }

    // Update badge display
    const badgeList = document.getElementById('badge-list');
    badgeList.innerHTML = '';
    if (savingsStreak.badgeAwarded) {
        const li = document.createElement('li');
        li.className = 'badge-item';
        li.textContent = 'Saved 3 weeks straight!';
        badgeList.appendChild(li);
    }
}

// Update savings goals display
function updateSavingsGoals() {
    const goalList = document.getElementById('goal-items');
    goalList.innerHTML = '';

    savingsGoals.forEach(goal => {
        const li = document.createElement('li');
        li.className = ' goal-item';
        const progress = goal.currentAmount / goal.targetAmount * 100;
        li.innerHTML = `
            ${goal.name}: ₱${goal.currentAmount.toFixed(2)} / ₱${goal.targetAmount.toFixed(2)} (Due ${goal.targetDate})
            <div class="progress-bar">
                <div class="progress" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
        `;
        goalList.appendChild(li);
    });
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
            div.innerHTML = `${t.category}: ₱${t.amount.toFixed(2)} ${t.description ? `(${t.description})` : ''}`;
            if (t.recurring && t.type === 'expense') {
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit Due Date';
                editButton.onclick = () => editTransactionDueDate(t.id);
                div.appendChild(editButton);
            }
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