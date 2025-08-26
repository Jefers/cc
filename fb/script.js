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

// Update dashboard with current balance and recent transactions
function updateDashboard() {
    const balance = transactions.reduce((total, t) => {
        return t.type === 'income' ? total + t.amount : total - t.amount;
    }, 0);

    document.getElementById('balance').textContent = `Current Balance: ₱${balance.toFixed(2)}`;

    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    // Show last 5 transactions
    transactions.slice(-5).reverse().forEach(t => {
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}`;
        li.textContent = `${t.date} | ${t.category} | ₱${t.amount.toFixed(2)} | ${t.description || '-'} ${t.recurring ? `(Recurring on day ${t.recurringDay})` : ''}`;
        transactionList.appendChild(li);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', init);