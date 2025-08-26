// Data Models
let transactions = [];
let savingsGoals = [];
let projections = { weekly: 0, monthly: 0 };
let savingsStreak = { weeks: [], badgeAwarded: false };
let whatIfAdjustments = {};
let dismissedPopups = JSON.parse(localStorage.getItem('dismissedPopups')) || [];

// Sample Data for Testing
/*
transactions = [
    { id: 1, type: 'income', category: 'Job Income', amount: 15000, estimatedAmount: 0, date: '2025-08-01', description: 'Salary', recurring: false, recurringDay: '', goalId: null },
    { id: 2, type: 'expense', category: 'Rent', amount: 5000, estimatedAmount: 0, date: '2025-08-01', description: '', recurring: true, recurringDay: '1', goalId: null },
    { id: 3, type: 'expense', category: 'Worker Wages', amount: 2000, estimatedAmount: 0, date: '2025-08-05', description: 'Juan', recurring: true, recurringDay: '5', goalId: null },
    { id: 4, type: 'income', category: 'Job Income', amount: 5000, estimatedAmount: 0, date: '2025-08-10', description: 'Freelance', recurring: false, recurringDay: '', goalId: null },
    { id: 5, type: 'expense', category: 'Utilities', amount: 1000, estimatedAmount: 1200, date: '2025-08-15', description: 'Electricity', recurring: true, recurringDay: '15', goalId: null },
    { id: 6, type: 'expense', category: 'Food', amount: 300, estimatedAmount: 0, date: '2025-08-20', description: '', recurring: false, recurringDay: '', goalId: null },
    { id: 7, type: 'expense', category: 'Big Expense', amount: 6000, estimatedAmount: 0, date: '2025-08-25', description: 'Car Repair', recurring: false, recurringDay: '', goalId: null },
    { id: 8, type: 'expense', category: 'Savings Transfer', amount: 1000, estimatedAmount: 0, date: '2025-08-25', description: 'Emergency Buffer', recurring: false, recurringDay: '', goalId: 1 }
];
savingsGoals = [
    { id: 1, name: 'Emergency Buffer', targetAmount: 10000, targetDate: '2025-12-31', currentAmount: 1000 }
];
*/

// Initialize data from localStorage and set up forms
function init() {
    loadData();
    updateDashboard();
    setDefaultDate();
    setupFormListeners();
    requestNotificationPermission();
    checkReminders();
    updateSavingsGoals();
    updateForecast();
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
    const whatIfForm = document.getElementById('what-if-form');
    const recurringCheckbox = document.getElementById('recurring');
    const recurringDaySelect = document.getElementById('recurring-day');
    const recurringLabel = document.querySelector('label[for="recurring-day"]');
    const categorySelect = document.getElementById('category');
    const estimatedAmountInput = document.getElementById('estimated-amount');
    const estimatedLabel = document.querySelector('label[for="estimated-amount"]');
    const horizonSelect = document.getElementById('forecast-horizon');
    const eduDismiss = document.getElementById('edu-dismiss');

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

    // Update forecast on horizon change
    horizonSelect.addEventListener('change', updateForecast);

    // Dismiss educational pop-up
    eduDismiss.addEventListener('click', () => {
        const popup = document.getElementById('edu-popup');
        const message = document.getElementById('edu-message').textContent;
        dismissedPopups.push(message);
        localStorage.setItem('dismissedPopups', JSON.stringify(dismissedPopups));
        popup.classList.add('hidden');
    });

    transactionForm.addEventListener('submit', handleAddTransaction);
    savingsGoalForm.addEventListener('submit', handleAddSavingsGoal);
    whatIfForm.addEventListener('submit', handleWhatIfSimulation);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
    localStorage.setItem('projections', JSON.stringify(projections));
    localStorage.setItem('savingsStreak', JSON.stringify(savingsStreak));
    localStorage.setItem('dismissedPopups', JSON.stringify(dismissedPopups));
}

// Load data from localStorage
function loadData() {
    const savedTransactions = localStorage.getItem('transactions');
    const savedGoals = localStorage.getItem('savingsGoals');
    const savedProjections = localStorage.getItem('projections');
    const savedStreak = localStorage.getItem('savingsStreak');
    const savedDismissedPopups = localStorage.getItem('dismissedPopups');

    if (savedTransactions) transactions = JSON.parse(savedTransactions);
    if (savedGoals) savingsGoals = JSON.parse(savedGoals);
    if (savedProjections) projections = JSON.parse(savedProjections);
    if (savedStreak) savingsStreak = JSON.parse(savedStreak);
    if (savedDismissedPopups) dismissedPopups = JSON.parse(savedDismissedPopups);
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
        goalId: null
    };

    // Handle Savings Transfer allocation
    if (category === 'Savings Transfer' && savingsGoals.length > 0) {
        const goalNames = savingsGoals.map(g => g.name).join(', ');
        const goalName = prompt(`Allocate to which savings goal? (${goalNames})`);
        const goal = savingsGoals.find(g => g.name.toLowerCase() === goalName?.toLowerCase());
        if (goal) {
            transaction.goalId = goal.id;
            const prevProgress = goal.currentAmount / goal.targetAmount * 100;
            goal.currentAmount = (goal.currentAmount || 0) + amount;
            const newProgress = goal.currentAmount / goal.targetAmount * 100;
            checkGoalMilestones(goal, prevProgress, newProgress);
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
    updateForecast();

    // Proactive UX: Suggest savings transfer for income
    if (type === 'income' && savingsGoals.length > 0) {
        const suggestedAmount = amount * 0.1;
        const defaultGoal = savingsGoals.find(g => g.name.toLowerCase().includes('buffer')) || savingsGoals[0];
        const goalNames = savingsGoals.map(g => g.name).join(', ');
        const goalName = prompt(`Save ₱${suggestedAmount.toFixed(2)} (10%) to a goal? (${goalNames})`, defaultGoal.name);
        const goal = savingsGoals.find(g => g.name.toLowerCase() === goalName?.toLowerCase());
        if (goal) {
            const savingsTransaction = {
                id: Date.now() + 1,
                type: 'expense',
                category: 'Savings Transfer',
                amount: suggestedAmount,
                estimatedAmount: 0,
                date,
                description: `Auto-allocated to ${goal.name}`,
                recurring: false,
                recurringDay: '',
                goalId: goal.id
            };
            const prevProgress = goal.currentAmount / goal.targetAmount * 100;
            goal.currentAmount = (goal.currentAmount || 0) + suggestedAmount;
            const newProgress = goal.currentAmount / goal.targetAmount * 100;
            checkGoalMilestones(goal, prevProgress, newProgress);
            transactions.push(savingsTransaction);
            saveData();
            updateDashboard();
            updateSavingsGoals();
            checkSavingsStreak();
            updateForecast();
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
        updateForecast();
    } else if (newDay !== null) {
        alert('Please enter a valid day (1-31).');
    }
}

// Handle what-if simulation
function handleWhatIfSimulation(event) {
    event.preventDefault();
    const form = event.target;
    const category = form['category-adjust'].value;
    const adjustAmount = parseFloat(form['adjust-amount'].value) || 0;
    whatIfAdjustments[category] = adjustAmount;
    updateForecast();
    form.reset();
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

        const li = document.createElement('li');
        li.className = 'reminder-item';
        li.textContent = message;
        reminderList.appendChild(li);

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(message);
        }
    });
}

// Check savings streak for badges
function checkSavingsStreak() {
    const today = new Date();
    const weekNumber = Math.floor((today.getTime() / (1000 * 60 * 60 * 24 * 7)) % 52);

    const hasSavingsThisWeek = transactions.some(t => 
        t.category === 'Savings Transfer' && 
        Math.floor((new Date(t.date).getTime() / (1000 * 60 * 60 * 24 * 7)) % 52) === weekNumber
    );

    if (hasSavingsThisWeek && !savingsStreak.weeks.includes(weekNumber)) {
        savingsStreak.weeks.push(weekNumber);
        savingsStreak.weeks = [...new Set(savingsStreak.weeks)].sort((a, b) => a - b);
    }

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

    const badgeList = document.getElementById('badge-list');
    badgeList.innerHTML = '';
    if (savingsStreak.badgeAwarded) {
        const li = document.createElement('li');
        li.className = 'badge-item';
        li.textContent = 'Saved 3 weeks straight!';
        badgeList.appendChild(li);
    }
}

// Check savings goal milestones for confetti
function checkGoalMilestones(goal, prevProgress, newProgress) {
    const milestones = [25, 50, 75, 100];
    milestones.forEach(m => {
        if (prevProgress < m && newProgress >= m) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff6f91', '#00cc99', '#6b48ff', '#ffab00']
            });
        }
    });
}

// Update savings goals display
function updateSavingsGoals() {
    const goalList = document.getElementById('goal-items');
    goalList.innerHTML = '';

    savingsGoals.forEach(goal => {
        const li = document.createElement('li');
        li.className = 'goal-item';
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

// Calculate forecast with educational tips
function calculateForecast(horizonDays) {
    const today = new Date();
    const currentBalance = transactions.reduce((total, t) => {
        return t.type === 'income' ? total + t.amount : total - t.amount;
    }, 0);

    // Calculate average daily income (last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const recentIncomes = transactions
        .filter(t => t.type === 'income' && new Date(t.date) >= thirtyDaysAgo)
        .reduce((total, t) => total + t.amount, 0);
    const avgDailyIncome = recentIncomes / 30;

    // Calculate recurring and variable expenses
    const categoryAverages = {};
    transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
        .forEach(t => {
            categoryAverages[t.category] = (categoryAverages[t.category] || 0) + t.amount;
        });
    for (let category in categoryAverages) {
        categoryAverages[category] /= 30;
    }

    // Apply what-if adjustments
    for (let category in whatIfAdjustments) {
        categoryAverages[category] = (categoryAverages[category] || 0) + whatIfAdjustments[category];
    }

    // Calculate recurring expenses
    const recurringExpenses = transactions
        .filter(t => t.recurring && t.type === 'expense' && t.recurringDay)
        .map(t => ({ ...t, amount: t.category === 'Utilities' && t.estimatedAmount ? t.estimatedAmount : t.amount }));

    // Forecast daily balances
    const balances = [currentBalance];
    let currentDate = new Date(today);
    for (let i = 1; i <= horizonDays; i++) {
        currentDate.setDate(today.getDate() + i);
        let dailyExpense = 0;

        recurringExpenses.forEach(t => {
            if (parseInt(t.recurringDay) === currentDate.getDate()) {
                dailyExpense += t.amount;
            }
        });

        for (let category in categoryAverages) {
            dailyExpense += categoryAverages[category] || 0;
        }

        const dailyBalance = balances[i - 1] + avgDailyIncome - dailyExpense;
        balances.push(dailyBalance);
    }

    // Generate warnings and educational tips
    const warnings = [];
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === today.getMonth())
        .reduce((total, t) => total + t.amount, 0);
    const bufferTip = `Build a buffer for surprises: Aim for ₱${monthlyExpenses.toFixed(2)} (1 month's expenses).`;
    if (horizonDays >= 30) {
        const endBalance = balances[balances.length - 1];
        if (endBalance < 0) {
            warnings.push(`At current rate, short ₱${Math.abs(endBalance).toFixed(2)} in ${horizonDays} days`);
        }
        if (!dismissedPopups.includes(bufferTip)) {
            warnings.push(bufferTip);
        }
    }

    return { balances, warnings };
}

// Update forecast chart and warnings
function updateForecast() {
    const horizonDays = parseInt(document.getElementById('forecast-horizon').value);
    const { balances, warnings } = calculateForecast(horizonDays);

    // Draw forecast chart
    const canvas = document.getElementById('forecast-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxBalance = Math.max(...balances, currentBalance);
    const minBalance = Math.min(...balances, currentBalance);
    const range = maxBalance - minBalance || 1;
    const width = canvas.width;
    const height = canvas.height;
    const step = width / (horizonDays + 1);

    ctx.beginPath();
    ctx.moveTo(0, height - 10);
    ctx.lineTo(width, height - 10);
    ctx.strokeStyle = '#333';
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#00cc99'; // Teal for line
    ctx.lineWidth = 2;
    balances.forEach((balance, i) => {
        const x = i * step;
        const y = height - 10 - ((balance - minBalance) / range) * (height - 20);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // Display warnings and educational tips
    const warningList = document.getElementById('forecast-warnings');
    warningList.innerHTML = '';
    const popup = document.getElementById('edu-popup');
    const eduMessage = document.getElementById('edu-message');
    warnings.forEach(w => {
        if (w.includes('Build a buffer')) {
            eduMessage.textContent = w;
            popup.classList.remove('hidden');
        } else {
            const li = document.createElement('li');
            li.className = 'warning-item';
            li.textContent = w;
            warningList.appendChild(li);
        }
    });
}

// Update dashboard
function updateDashboard() {
    const balance = transactions.reduce((total, t) => {
        return t.type === 'income' ? total + t.amount : total - t.amount;
    }, 0);
    document.getElementById('balance').textContent = `Current Balance: ₱${balance.toFixed(2)}`;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((total, t) => total + t.amount, 0);
    const burnRate = daysInMonth > 0 ? monthlyExpenses / daysInMonth : 0;
    document.getElementById('burn-rate').textContent = `Monthly Burn Rate: ₱${burnRate.toFixed(2)}/day`;

    updateWeeklyCalendar();
    updateCategoryChart();
    updateForecast();
}

// Update weekly calendar with big expense flagging
function updateWeeklyCalendar() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const headerRow = document.getElementById('calendar-header');
    headerRow.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const th = document.createElement('th');
        th.textContent = `${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
        headerRow.appendChild(th);
    }

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
            div.className = `transaction-item ${t.type} ${t.amount > 5000 ? 'big-expense-flag' : ''}`;
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

    const categoryTotals = {};
    transactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    const total = amounts.reduce((sum, val) => sum + val, 0);

    const colors = ['#ff6f91', '#00cc99', '#6b48ff', '#ffab00', '#ff4d4d', '#c3e6ff', '#f4c2ff'];
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