// Data Models
let transactions = [];
let savingsGoals = [];
let projections = { weekly: 0, monthly: 0 };
let savingsStreak = { weeks: [], badgeAwarded: false };
let whatIfAdjustments = {};
let dismissedPopups = JSON.parse(localStorage.getItem('dismissedPopups')) || [];

// Sample CSV Data for Testing (48 transactions, June–August 2025)
/*
budget.csv content:
id,type,amount,date,category,description,dueDate,isBig,recurring
1,income,₱12000,2025-06-01,Job Income,Salary,,false,
2,income,₱3000,2025-06-03,Job Income,Freelance,,false,
3,expense,₱6000,2025-06-10,Rent,,2025-06-10,false,true,10
4,expense,₱1000,2025-06-10,Utilities,Electricity,2025-06-10,false,true,10
5,expense,₱2000,2025-06-10,Worker Wages,Juan,2025-06-10,false,true,10
6,expense,₱1500,2025-06-10,Worker Wages,Maria,2025-06-10,false,true,10
7,expense,₱500,2025-06-11,Food,Groceries,,false,
8,expense,₱500,2025-06-12,Food,Groceries,,false,
9,expense,₱500,2025-06-13,Food,Groceries,,false,
10,expense,₱500,2025-06-14,Food,Groceries,,false,
11,expense,₱300,2025-06-15,Food,Restaurant,,false,
12,expense,₱1000,2025-06-20,Savings Transfer,Emergency Buffer,,false,,1
13,income,₱8000,2025-07-01,Job Income,Salary,,false,
14,income,₱4000,2025-07-05,Job Income,Freelance,,false,
15,expense,₱6000,2025-07-10,Rent,,2025-07-10,false,true,10
16,expense,₱1200,2025-07-10,Utilities,Electricity,2025-07-10,false,true,10
17,expense,₱2000,2025-07-10,Worker Wages,Juan,2025-07-10,false,true,10
18,expense,₱1500,2025-07-10,Worker Wages,Maria,2025-07-10,false,true,10
19,expense,₱500,2025-07-11,Food,Groceries,,false,
20,expense,₱500,2025-07-12,Food,Groceries,,false,
21,expense,₱500,2025-07-13,Food,Groceries,,false,
22,expense,₱500,2025-07-14,Food,Groceries,,false,
23,expense,₱300,2025-07-15,Food,Restaurant,,false,
24,expense,₱5000,2025-07-20,Big Expense,Dental Work,,true,
25,income,₱15000,2025-08-01,Job Income,Salary,,false,
26,income,₱2000,2025-08-03,Job Income,Freelance,,false,
27,expense,₱6000,2025-08-10,Rent,,2025-08-10,false,true,10
28,expense,₱1100,2025-08-10,Utilities,Electricity,2025-08-10,false,true,10
29,expense,₱2000,2025-08-10,Worker Wages,Juan,2025-08-10,false,true,10
30,expense,₱1500,2025-08-10,Worker Wages,Maria,2025-08-10,false,true,10
31,expense,₱500,2025-08-11,Food,Groceries,,false,
32,expense,₱500,2025-08-12,Food,Groceries,,false,
33,expense,₱500,2025-08-13,Food,Groceries,,false,
34,expense,₱500,2025-08-14,Food,Groceries,,false,
35,expense,₱300,2025-08-15,Food,Restaurant,,false,
36,expense,₱1000,2025-08-25,Savings Transfer,Emergency Buffer,,false,,1
37,expense,₱500,2025-06-16,Food,Groceries,,false,
38,expense,₱500,2025-06-17,Food,Groceries,,false,
39,expense,₱500,2025-06-18,Food,Groceries,,false,
40,expense,₱500,2025-06-19,Food,Groceries,,false,
41,expense,₱500,2025-07-16,Food,Groceries,,false,
42,expense,₱500,2025-07-17,Food,Groceries,,false,
43,expense,₱500,2025-07-18,Food,Groceries,,false,
44,expense,₱500,2025-07-19,Food,Groceries,,false,
45,expense,₱500,2025-08-16,Food,Groceries,,false,
46,expense,₱500,2025-08-17,Food,Groceries,,false,
47,expense,₱500,2025-08-18,Food,Groceries,,false,
48,expense,₱500,2025-08-19,Food,Groceries,,false,
*/

// Initialize data and setup
function init() {
 loadData();
 // Uncomment to load test data for Francine's scenarios
 // loadTestData();
 updateDashboard();
 setDefaultDate();
 setupFormListeners();
 requestNotificationPermission();
 checkReminders();
 updateSavingsGoals();
 updateForecast();
 updateHistoryTable();
 toggleClearDataButton();
}

// Load test data for Francine's scenarios
function loadTestData() {
 transactions = [
 { id: 1, type: 'income', category: 'Job Income', amount: 12000, estimatedAmount: 0, date: '2025-06-01', description: 'Salary', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 2, type: 'income', category: 'Job Income', amount: 3000, estimatedAmount: 0, date: '2025-06-03', description: 'Freelance', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 3, type: 'expense', category: 'Rent', amount: 6000, estimatedAmount: 0, date: '2025-06-10', description: '', dueDate: '2025-06-10', isBig: false, recurring: '10', goalId: null },
 { id: 4, type: 'expense', category: 'Utilities', amount: 1000, estimatedAmount: 1200, date: '2025-06-10', description: 'Electricity', dueDate: '2025-06-10', isBig: false, recurring: '10', goalId: null },
 { id: 5, type: 'expense', category: 'Worker Wages', amount: 2000, estimatedAmount: 0, date: '2025-06-10', description: 'Juan', dueDate: '2025-06-10', isBig: false, recurring: '10', goalId: null },
 { id: 6, type: 'expense', category: 'Worker Wages', amount: 1500, estimatedAmount: 0, date: '2025-06-10', description: 'Maria', dueDate: '2025-06-10', isBig: false, recurring: '10', goalId: null },
 { id: 7, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-06-11', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 8, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-06-12', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 9, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-06-13', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 10, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-06-14', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 11, type: 'expense', category: 'Food', amount: 300, estimatedAmount: 0, date: '2025-06-15', description: 'Restaurant', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 12, type: 'expense', category: 'Savings Transfer', amount: 1000, estimatedAmount: 0, date: '2025-06-20', description: 'Emergency Buffer', dueDate: '', isBig: false, recurring: '', goalId: 1 },
 { id: 13, type: 'income', category: 'Job Income', amount: 8000, estimatedAmount: 0, date: '2025-07-01', description: 'Salary', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 14, type: 'income', category: 'Job Income', amount: 4000, estimatedAmount: 0, date: '2025-07-05', description: 'Freelance', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 15, type: 'expense', category: 'Rent', amount: 6000, estimatedAmount: 0, date: '2025-07-10', description: '', dueDate: '2025-07-10', isBig: false, recurring: '10', goalId: null },
 { id: 16, type: 'expense', category: 'Utilities', amount: 1200, estimatedAmount: 1300, date: '2025-07-10', description: 'Electricity', dueDate: '2025-07-10', isBig: false, recurring: '10', goalId: null },
 { id: 17, type: 'expense', category: 'Worker Wages', amount: 2000, estimatedAmount: 0, date: '2025-07-10', description: 'Juan', dueDate: '2025-07-10', isBig: false, recurring: '10', goalId: null },
 { id: 18, type: 'expense', category: 'Worker Wages', amount: 1500, estimatedAmount: 0, date: '2025-07-10', description: 'Maria', dueDate: '2025-07-10', isBig: false, recurring: '10', goalId: null },
 { id: 19, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-07-11', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 20, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-07-12', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 21, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-07-13', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 22, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-07-14', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 23, type: 'expense', category: 'Food', amount: 300, estimatedAmount: 0, date: '2025-07-15', description: 'Restaurant', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 24, type: 'expense', category: 'Big Expense', amount: 5000, estimatedAmount: 0, date: '2025-07-20', description: 'Dental Work', dueDate: '', isBig: true, recurring: '', goalId: null },
 { id: 25, type: 'income', category: 'Job Income', amount: 15000, estimatedAmount: 0, date: '2025-08-01', description: 'Salary', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 26, type: 'income', category: 'Job Income', amount: 2000, estimatedAmount: 0, date: '2025-08-03', description: 'Freelance', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 27, type: 'expense', category: 'Rent', amount: 6000, estimatedAmount: 0, date: '2025-08-10', description: '', dueDate: '2025-08-10', isBig: false, recurring: '10', goalId: null },
 { id: 28, type: 'expense', category: 'Utilities', amount: 1100, estimatedAmount: 1200, date: '2025-08-10', description: 'Electricity', dueDate: '2025-08-10', isBig: false, recurring: '10', goalId: null },
 { id: 29, type: 'expense', category: 'Worker Wages', amount: 2000, estimatedAmount: 0, date: '2025-08-10', description: 'Juan', dueDate: '2025-08-10', isBig: false, recurring: '10', goalId: null },
 { id: 30, type: 'expense', category: 'Worker Wages', amount: 1500, estimatedAmount: 0, date: '2025-08-10', description: 'Maria', dueDate: '2025-08-10', isBig: false, recurring: '10', goalId: null },
 { id: 31, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-08-11', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 32, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-08-12', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 33, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-08-13', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 34, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-08-14', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 35, type: 'expense', category: 'Food', amount: 300, estimatedAmount: 0, date: '2025-08-15', description: 'Restaurant', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 36, type: 'expense', category: 'Savings Transfer', amount: 1000, estimatedAmount: 0, date: '2025-08-25', description: 'Emergency Buffer', dueDate: '', isBig: false, recurring: '', goalId: 1 },
 { id: 37, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-06-16', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 38, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-06-17', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 39, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-06-18', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 40, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-06-19', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 41, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-07-16', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 42, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-07-17', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 43, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-07-18', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 44, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-07-19', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 45, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-08-16', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 46, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-08-17', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 47, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-08-18', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null },
 { id: 48, type: 'expense', category: 'Food', amount: 500, estimatedAmount: 0, date: '2025-08-19', description: 'Groceries', dueDate: '', isBig: false, recurring: '', goalId: null }
 ];
 savingsGoals = [
 { id: 1, name: 'Emergency Buffer', targetAmount: 10000, targetDate: '2025-11-26', currentAmount: 2000 }
 ];
 saveData();
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
 document.getElementById('edit-date').value = today;
}

// Toggle Clear Data button visibility based on query param
function toggleClearDataButton() {
 const isTestMode = window.location.search.includes('test=true');
 document.getElementById('clear-data-container').classList.toggle('hidden', !isTestMode);
}

// Set up form event listeners
function setupFormListeners() {
 const transactionForm = document.getElementById('transaction-form');
 const savingsGoalForm = document.getElementById('savings-goal-form');
 const whatIfForm = document.getElementById('what-if-form');
 const editTransactionForm = document.getElementById('edit-transaction-form');
 const recurringCheckbox = document.getElementById('recurring');
 const recurringDaySelect = document.getElementById('recurring-day');
 const recurringLabel = document.querySelector('label[for="recurring-day"]');
 const categorySelect = document.getElementById('category');
 const estimatedAmountInput = document.getElementById('estimated-amount');
 const estimatedLabel = document.querySelector('label[for="estimated-amount"]');
 const editRecurringCheckbox = document.getElementById('edit-recurring');
 const editRecurringDaySelect = document.getElementById('edit-recurring-day');
 const editRecurringLabel = document.querySelector('label[for="edit-recurring-day"]');
 const editCategorySelect = document.getElementById('edit-category');
 const editEstimatedAmountInput = document.getElementById('edit-estimated-amount');
 const editEstimatedLabel = document.querySelector('label[for="edit-estimated-amount"]');
 const horizonSelect = document.getElementById('forecast-horizon');
 const eduDismiss = document.getElementById('edu-dismiss');
 const exportCsvButton = document.getElementById('export-csv');
 const importCsvInput = document.getElementById('import-csv');
 const exportCsvSettingsButton = document.getElementById('export-csv-settings');
 const importCsvSettingsInput = document.getElementById('import-csv-settings');
 const viewHistoryButton = document.getElementById('view-history');
 const backToDashboardButton = document.getElementById('back-to-dashboard');
 const clearDataButton = document.getElementById('clear-data');
 const cancelEditButton = document.getElementById('cancel-edit');

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

 editRecurringCheckbox.addEventListener('change', () => {
 const isChecked = editRecurringCheckbox.checked;
 editRecurringDaySelect.classList.toggle('hidden', !isChecked);
 editRecurringLabel.classList.toggle('hidden', !isChecked);
 if (isChecked) {
 editRecurringDaySelect.setAttribute('required', 'true');
 } else {
 editRecurringDaySelect.removeAttribute('required');
 }
 });

 editCategorySelect.addEventListener('change', () => {
 const isUtilities = editCategorySelect.value === 'Utilities';
 editEstimatedAmountInput.classList.toggle('hidden', !isUtilities);
 editEstimatedLabel.classList.toggle('hidden', !isUtilities);
 if (isUtilities) {
 editEstimatedAmountInput.setAttribute('required', 'true');
 } else {
 editEstimatedAmountInput.removeAttribute('required');
 }
 });

 horizonSelect.addEventListener('change', updateForecast);

 eduDismiss.addEventListener('click', () => {
 const popup = document.getElementById('edu-popup');
 const message = document.getElementById('edu-message').textContent;
 dismissedPopups.push(message);
 localStorage.setItem('dismissedPopups', JSON.stringify(dismissedPopups));
 popup.classList.add('hidden');
 });

 viewHistoryButton.addEventListener('click', () => {
 document.getElementById('dashboard').classList.add('hidden');
 document.getElementById('add-transaction').classList.add('hidden');
 document.getElementById('savings-goals').classList.add('hidden');
 document.getElementById('settings').classList.add('hidden');
 document.getElementById('projections').classList.add('hidden');
 document.getElementById('history').classList.remove('hidden');
 updateHistoryTable();
 });

 backToDashboardButton.addEventListener('click', () => {
 document.getElementById('history').classList.add('hidden');
 document.getElementById('dashboard').classList.remove('hidden');
 document.getElementById('add-transaction').classList.remove('hidden');
 document.getElementById('savings-goals').classList.remove('hidden');
 document.getElementById('settings').classList.remove('hidden');
 document.getElementById('projections').classList.remove('hidden');
 document.getElementById('edit-transaction-form').classList.add('hidden');
 });

 exportCsvButton.addEventListener('click', exportToCsv);
 exportCsvSettingsButton.addEventListener('click', exportToCsv);
 importCsvInput.addEventListener('change', handleImportCsv);
 importCsvSettingsInput.addEventListener('change', handleImportCsv);

 clearDataButton.addEventListener('click', () => {
 if (confirm('Are you sure? This deletes all transactions and goals.')) {
 localStorage.clear();
 transactions = [];
 savingsGoals = [];
 projections = { weekly: 0, monthly: 0 };
 savingsStreak = { weeks: [], badgeAwarded: false };
 whatIfAdjustments = {};
 dismissedPopups = [];
 saveData();
 updateDashboard();
 updateSavingsGoals();
 updateHistoryTable();
 alert('All data cleared.');
 window.location.reload();
 }
 });

 cancelEditButton.addEventListener('click', () => {
 document.getElementById('edit-transaction-form').classList.add('hidden');
 });

 transactionForm.addEventListener('submit', handleAddTransaction);
 savingsGoalForm.addEventListener('submit', handleAddSavingsGoal);
 whatIfForm.addEventListener('submit', handleWhatIfSimulation);
 editTransactionForm.addEventListener('submit', handleEditTransaction);
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

// Export transactions to CSV
function exportToCsv() {
 const headers = ['id', 'type', 'amount', 'date', 'category', 'description', 'dueDate', 'isBig', 'recurring'];
 const csvRows = [headers.join(',')];

 transactions.forEach(t => {
 const row = [
 t.id,
 t.type,
 `₱${t.amount.toFixed(2)}`,
 t.date,
 t.category,
 `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
 t.dueDate || '',
 t.isBig,
 t.recurring || ''
 ];
 csvRows.push(row.join(','));
 });

 const csvContent = csvRows.join('\n');
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.setAttribute('href', url);
 link.setAttribute('download', 'budget.csv');
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
}

// Import transactions from CSV
function handleImportCsv(event) {
 const file = event.target.files[0];
 if (!file) {
 alert('Please select a CSV file.');
 return;
 }

 if (!file.name.endsWith('.csv')) {
 alert('Please upload a valid CSV file.');
 return;
 }

 const reader = new FileReader();
 reader.onload = function(e) {
 try {
 const text = e.target.result;
 const rows = text.split('\n').map(row => row.trim()).filter(row => row);
 if (rows.length < 1) {
 alert('Empty CSV file.');
 return;
 }

 const headers = rows[0].split(',').map(h => h.trim());
 const expectedHeaders = ['id', 'type', 'amount', 'date', 'category', 'description', 'dueDate', 'isBig', 'recurring'];
 if (!headers.every((h, i) => h === expectedHeaders[i])) {
 alert('Invalid CSV: Missing or incorrect headers.');
 return;
 }

 const validCategories = ['Job Income', 'Worker Wages', 'Rent', 'Utilities', 'Food', 'Big Expense', 'Savings Transfer'];
 const validRecurring = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', 'weekly', ''];
 const newTransactions = [];

 for (let i = 1; i < rows.length; i++) {
 const cols = rows[i].split(',').map(col => col.trim());
 if (cols.length !== headers.length) {
 alert(`Invalid CSV: Row ${i + 1} has incorrect number of columns.`);
 return;
 }

 const transaction = {
 id: parseInt(cols[0]),
 type: cols[1],
 amount: parseFloat(cols[2].replace('₱', '')),
 date: cols[3],
 category: cols[4],
 description: cols[5].replace(/^"|"$/g, '').replace(/""/g, '"'),
 dueDate: cols[6] || '',
 isBig: cols[7] === 'true',
 recurring: cols[8] || '',
 goalId: cols[4] === 'Savings Transfer' && savingsGoals.some(g => g.name === cols[5].replace(/^"|"$/g, '').replace(/""/g, '"')) ? savingsGoals.find(g => g.name === cols[5].replace(/^"|"$/g, '').replace(/""/g, '"')).id : null
 };

 // Validation
 if (isNaN(transaction.id)) {
 alert(`Invalid ID in row ${i + 1}.`);
 return;
 }
 if (!['income', 'expense'].includes(transaction.type)) {
 alert(`Invalid type in row ${i + 1}.`);
 return;
 }
 if (!validCategories.includes(transaction.category)) {
 alert(`Invalid category in row ${i + 1}.`);
 return;
 }
 if (isNaN(transaction.amount) || transaction.amount <= 0) {
 alert(`Amount must be greater than 0 in row ${i + 1}.`);
 return;
 }
 if (!/^\d{4}-\d{2}-\d{2}$/.test(transaction.date) || new Date(transaction.date) > new Date()) {
 alert(`Invalid date in row ${i + 1}.`);
 return;
 }
 if (transaction.category === 'Worker Wages' && !transaction.description) {
 alert(`Worker name required for Worker Wages in row ${i + 1}.`);
 return;
 }
 if (transaction.recurring && !validRecurring.includes(transaction.recurring)) {
 alert(`Invalid recurring value in row ${i + 1}.`);
 return;
 }
 if (transaction.recurring && !transaction.dueDate && transaction.recurring !== 'weekly') {
 alert(`Due date required for recurring transaction (non-weekly) in row ${i + 1}.`);
 return;
 }
 if (transaction.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(transaction.dueDate)) {
 alert(`Invalid due date in row ${i + 1}.`);
 return;
 }
 if (transactions.some(t => t.id === transaction.id)) {
 transaction.id = Date.now() + i; // Ensure unique ID
 }

 newTransactions.push(transaction);
 }

 // Update savings goals for Savings Transfer transactions
 newTransactions.forEach(t => {
 if (t.category === 'Savings Transfer' && t.goalId) {
 const goal = savingsGoals.find(g => g.id === t.goalId);
 if (goal) {
 const prevProgress = goal.currentAmount / goal.targetAmount * 100;
 goal.currentAmount = (goal.currentAmount || 0) + t.amount;
 const newProgress = goal.currentAmount / goal.targetAmount * 100;
 checkGoalMilestones(goal, prevProgress, newProgress);
 }
 }
 });

 transactions.push(...newTransactions);
 saveData();
 updateDashboard();
 updateSavingsGoals();
 updateHistoryTable();
 checkReminders();
 checkSavingsStreak();
 updateForecast();
 alert('Transactions imported successfully!');
 importCsvInput.value = '';
 importCsvSettingsInput.value = '';
 } catch (error) {
 alert('Error importing CSV: ' + error.message);
 }
 };
 reader.readAsText(file);
}

// Handle adding a new transaction with error handling
function handleAddTransaction(event) {
 event.preventDefault();
 const form = event.target;
 const type = form.type.value;
 const category = form.category.value;
 const amount = parseFloat(form.amount.value);
 const estimatedAmount = category === 'Utilities' ? parseFloat(form['estimated-amount'].value) || 0 : 0;
 const date = form.date.value;
 const description = form.description.value.trim();
 const recurring = form.recurring.checked ? form['recurring-day'].value : '';
 const dueDate = recurring && recurring !== 'weekly' ? date : '';

 // Error handling
 if (isNaN(amount) || amount <= 0) {
 alert('Amount must be greater than 0.');
 return;
 }
 if (category === 'Utilities' && estimatedAmount < 0) {
 alert('Estimated amount cannot be negative.');
 return;
 }
 if (!date || new Date(date) > new Date()) {
 alert('Please select a valid past or current date.');
 return;
 }
 if (category === 'Worker Wages' && !description) {
 alert('Please provide a worker name for Worker Wages.');
 return;
 }
 if (recurring && !recurring) {
 alert('Please select a recurring day or frequency.');
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
 dueDate,
 isBig: amount > 5000,
 recurring,
 goalId: null
 };

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
 updateHistoryTable();
 checkReminders();
 updateSavingsGoals();
 checkSavingsStreak();
 updateForecast();

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
 dueDate: '',
 isBig: false,
 recurring: '',
 goalId: goal.id
 };
 const prevProgress = goal.currentAmount / goal.targetAmount * 100;
 goal.currentAmount = (goal.currentAmount || 0) + suggestedAmount;
 const newProgress = goal.currentAmount / goal.targetAmount * 100;
 checkGoalMilestones(goal, prevProgress, newProgress);
 transactions.push(savingsTransaction);
 saveData();
 updateDashboard();
 updateHistoryTable();
 updateSavingsGoals();
 checkSavingsStreak();
 updateForecast();
 }
 }

 form.reset();
 setDefaultDate();
}

// Handle editing a transaction
function handleEditTransaction(event) {
 event.preventDefault();
 const form = event.target;
 const id = parseInt(form['edit-id'].value);
 const type = form['edit-type'].value;
 const category = form['edit-category'].value;
 const amount = parseFloat(form['edit-amount'].value);
 const estimatedAmount = category === 'Utilities' ? parseFloat(form['edit-estimated-amount'].value) || 0 : 0;
 const date = form['edit-date'].value;
 const description = form['edit-description'].value.trim();
 const recurring = form['edit-recurring'].checked ? form['edit-recurring-day'].value : '';
 const dueDate = recurring && recurring !== 'weekly' ? date : '';

 // Error handling
 if (isNaN(amount) || amount <= 0) {
 alert('Amount must be greater than 0.');
 return;
 }
 if (category === 'Utilities' && estimatedAmount < 0) {
 alert('Estimated amount cannot be negative.');
 return;
 }
 if (!date || new Date(date) > new Date()) {
 alert('Please select a valid past or current date.');
 return;
 }
 if (category === 'Worker Wages' && !description) {
 alert('Please provide a worker name for Worker Wages.');
 return;
 }
 if (recurring && !recurring) {
 alert('Please select a recurring day or frequency.');
 return;
 }

 const oldTransaction = transactions.find(t => t.id === id);
 let goalId = oldTransaction.goalId;
 if (oldTransaction.category === 'Savings Transfer' && oldTransaction.goalId) {
 const goal = savingsGoals.find(g => g.id === oldTransaction.goalId);
 if (goal) {
 goal.currentAmount -= oldTransaction.amount; // Revert old amount
 }
 }

 if (category === 'Savings Transfer' && savingsGoals.length > 0) {
 const goalNames = savingsGoals.map(g => g.name).join(', ');
 const goalName = prompt(`Allocate to which savings goal? (${goalNames})`);
 const goal = savingsGoals.find(g => g.name.toLowerCase() === goalName?.toLowerCase());
 if (goal) {
 goalId = goal.id;
 const prevProgress = goal.currentAmount / goal.targetAmount * 100;
 goal.currentAmount = (goal.currentAmount || 0) + amount;
 const newProgress = goal.currentAmount / goal.targetAmount * 100;
 checkGoalMilestones(goal, prevProgress, newProgress);
 } else if (goalName) {
 alert('Invalid goal name. Transaction updated without allocation.');
 goalId = null;
 }
 }

 const updatedTransaction = {
 id,
 type,
 category,
 amount,
 estimatedAmount,
 date,
 description,
 dueDate,
 isBig: amount > 5000,
 recurring,
 goalId
 };

 transactions = transactions.map(t => t.id === id ? updatedTransaction : t);
 saveData();
 updateDashboard();
 updateHistoryTable();
 updateSavingsGoals();
 checkReminders();
 checkSavingsStreak();
 updateForecast();
 form.classList.add('hidden');
}

// Handle deleting a transaction
function deleteTransaction(id) {
 if (confirm('Are you sure you want to delete this transaction?')) {
 const transaction = transactions.find(t => t.id === id);
 if (transaction.category === 'Savings Transfer' && transaction.goalId) {
 const goal = savingsGoals.find(g => g.id === transaction.goalId);
 if (goal) {
 goal.currentAmount -= transaction.amount;
 }
 }
 transactions = transactions.filter(t => t.id !== id);
 saveData();
 updateDashboard();
 updateHistoryTable();
 updateSavingsGoals();
 checkReminders();
 checkSavingsStreak();
 updateForecast();
 }
}

// Update history table
function updateHistoryTable() {
 const historyBody = document.getElementById('history-body');
 historyBody.innerHTML = '';

 transactions.forEach(t => {
 const row = document.createElement('tr');
 row.innerHTML = `
 <td>${t.id}</td>
 <td>${t.type}</td>
 <td>₱${t.amount.toFixed(2)}</td>
 <td>${t.date}</td>
 <td>${t.category}</td>
 <td>${t.description || ''}</td>
 <td>${t.dueDate || ''}</td>
 <td>${t.isBig}</td>
 <td>${t.recurring || ''}</td>
 <td>
 <button onclick="editTransaction(${t.id})">Edit</button>
 <button onclick="deleteTransaction(${t.id})">Delete</button>
 </td>
 `;
 historyBody.appendChild(row);
 });
}

// Edit transaction
function editTransaction(id) {
 const transaction = transactions.find(t => t.id === id);
 if (!transaction) return;

 const form = document.getElementById('edit-transaction-form');
 document.getElementById('edit-id').value = transaction.id;
 document.getElementById('edit-type').value = transaction.type;
 document.getElementById('edit-category').value = transaction.category;
 document.getElementById('edit-amount').value = transaction.amount;
 document.getElementById('edit-estimated-amount').value = transaction.estimatedAmount;
 document.getElementById('edit-date').value = transaction.date;
 document.getElementById('edit-description').value = transaction.description;
 document.getElementById('edit-recurring').checked = !!transaction.recurring;
 document.getElementById('edit-recurring-day').value = transaction.recurring || '';
 document.getElementById('edit-transaction-form').classList.remove('hidden');

 const isUtilities = transaction.category === 'Utilities';
 document.getElementById('edit-estimated-amount').classList.toggle('hidden', !isUtilities);
 document.querySelector('label[for="edit-estimated-amount"]').classList.toggle('hidden', !isUtilities);
 document.getElementById('edit-recurring-day').classList.toggle('hidden', !transaction.recurring);
 document.querySelector('label[for="edit-recurring-day"]').classList.toggle('hidden', !transaction.recurring);
}

// Handle adding a new savings goal with error handling
function handleAddSavingsGoal(event) {
 event.preventDefault();
 const form = event.target;
 const name = form['goal-name'].value.trim();
 const targetAmount = parseFloat(form['goal-target'].value);
 const targetDate = form['goal-date'].value;

 if (!name) {
 alert('Goal name cannot be empty.');
 return;
 }
 if (savingsGoals.some(g => g.name.toLowerCase() === name.toLowerCase())) {
 alert('A goal with this name already exists.');
 return;
 }
 if (isNaN(targetAmount) || targetAmount <= 0) {
 alert('Target amount must be greater than 0.');
 return;
 }
 if (!targetDate || new Date(targetDate) <= new Date()) {
 alert('Target date must be in the future.');
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
 updateForecast();
 form.reset();
}

// Handle what-if simulation with error handling
function handleWhatIfSimulation(event) {
 event.preventDefault();
 const form = event.target;
 const category = form['category-adjust'].value;
 const adjustAmount = parseFloat(form['adjust-amount'].value) || 0;

 if (isNaN(adjustAmount)) {
 alert('Please enter a valid adjustment amount.');
 return;
 }

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
 .filter(t => t.recurring && t.type === 'expense' && t.recurring !== 'weekly')
 .map(t => {
 const dueDay = parseInt(t.recurring);
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
 colors: ['#ff8e9e', '#14b8a6', '#7c3aed', '#facc15']
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

// Calculate forecast with goal-specific advice
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
 const avgDailyIncome = recentIncomes / 30 || 0;

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
 .filter(t => t.recurring && t.type === 'expense' && t.recurring !== 'weekly')
 .map(t => ({ ...t, amount: t.category === 'Utilities' && t.estimatedAmount ? t.estimatedAmount : t.amount }));

 // Forecast daily balances
 const balances = [currentBalance];
 let currentDate = new Date(today);
 for (let i = 1; i <= horizonDays; i++) {
 currentDate.setDate(today.getDate() + i);
 let dailyExpense = 0;

 recurringExpenses.forEach(t => {
 if (parseInt(t.recurring) === currentDate.getDate()) {
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

 // Add savings goal advice
 savingsGoals.forEach(goal => {
 const daysUntilTarget = Math.ceil((new Date(goal.targetDate) - today) / (1000 * 60 * 60 * 24));
 if (daysUntilTarget <= horizonDays && daysUntilTarget > 0) {
 const remainingAmount = goal.targetAmount - goal.currentAmount;
 const weeksLeft = daysUntilTarget / 7;
 if (remainingAmount > 0) {
 const weeklySavings = remainingAmount / weeksLeft;
 if (weeklySavings > 0) {
 warnings.push(`Save ₱${weeklySavings.toFixed(2)}/week to reach ${goal.name} (₱${remainingAmount.toFixed(2)}) in ${Math.ceil(weeksLeft)} weeks`);
 }
 }
 }
 });

 return { balances, warnings };
}

// Update forecast chart and warnings
function updateForecast() {
 const horizonDays = parseInt(document.getElementById('forecast-horizon').value);
 const { balances, warnings } = calculateForecast(horizonDays);

 const canvas = document.getElementById('forecast-chart');
 const ctx = canvas.getContext('2d');
 ctx.clearRect(0, 0, canvas.width, canvas.height);

 const maxBalance = Math.max(...balances, 0);
 const minBalance = Math.min(...balances, 0);
 const range = maxBalance - minBalance || 1;
 const width = canvas.width;
 const height = canvas.height;
 const step = width / (horizonDays + 1);

 ctx.beginPath();
 ctx.moveTo(0, height - 10);
 ctx.lineTo(width, height - 10);
 ctx.strokeStyle = '#2d2d2d';
 ctx.stroke();

 ctx.beginPath();
 ctx.strokeStyle = '#14b8a6'; // Teal for line
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
 div.className = `transaction-item ${t.type} ${t.isBig ? 'big-expense-flag' : ''}`;
 div.innerHTML = `${t.category}: ₱${t.amount.toFixed(2)} ${t.description ? `(${t.description})` : ''}`;
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
 const total = amounts.reduce((sum, val) => sum + val, 0) || 1;

 const colors = ['#ff8e9e', '#14b8a6', '#7c3aed', '#facc15', '#ff4d6a', '#e0f2fe', '#f3e8ff'];
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
 ctx.fillStyle = '#2d2d2d';
 ctx.font = '12px Inter';
 ctx.fillText(`${category} (${((amounts[i] / total) * 100).toFixed(1)}%)`, labelX, labelY);
 });
}

// Initialize app
document.addEventListener('DOMContentLoaded', init);