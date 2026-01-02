// Money Jars App - Complete Working Version
// All features included: Bill management, transaction editing, and more

// =========================================================================
// DATA MODEL AND STATE MANAGEMENT
// =========================================================================

// App state
const AppState = {
    currentScreen: 'homeScreen',
    currentJarId: null,
    currentBillId: null,
    currentTransactionId: null,
    categories: ['Food', 'Coffee', 'Groceries', 'Clothes', 'Family', 'Something else'],
    lastNudgeDate: null,
    isInitialized: false,
    billHistoryMonths: 6
};

// Data models
const DataModel = {
    // Initialize default data structure
    init: function() {
        // Check if app is already initialized
        if (localStorage.getItem('moneyJars_initialized') === 'true') {
            this.loadFromStorage();
            AppState.isInitialized = true;
            return;
        }

        // Create default jars
        this.jars = [
            {
                id: 'bills-jar',
                name: 'Bills',
                amount: 0,
                removable: false,
                color: '#5B8CFF'
            },
            {
                id: 'everyday-jar',
                name: 'Everyday',
                amount: 0,
                removable: false,
                color: '#FF9F5B'
            },
            {
                id: 'savings-jar',
                name: 'Savings',
                amount: 0,
                removable: true,
                color: '#5BCF7F'
            }
        ];

        // Initialize other data structures
        this.movements = [];
        this.bills = [];
        this.billPaymentHistory = [];
        this.appState = {
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear(),
            lastNudgeDate: null
        };

        // Save to localStorage
        this.saveToStorage();
        localStorage.setItem('moneyJars_initialized', 'true');
        AppState.isInitialized = true;
    },

    // Save all data to localStorage
    saveToStorage: function() {
        localStorage.setItem('moneyJars_jars', JSON.stringify(this.jars));
        localStorage.setItem('moneyJars_movements', JSON.stringify(this.movements));
        localStorage.setItem('moneyJars_bills', JSON.stringify(this.bills));
        localStorage.setItem('moneyJars_billPaymentHistory', JSON.stringify(this.billPaymentHistory));
        localStorage.setItem('moneyJars_appState', JSON.stringify(this.appState));
    },

    // Load all data from localStorage
    loadFromStorage: function() {
        this.jars = JSON.parse(localStorage.getItem('moneyJars_jars') || '[]');
        this.movements = JSON.parse(localStorage.getItem('moneyJars_movements') || '[]');
        this.bills = JSON.parse(localStorage.getItem('moneyJars_bills') || '[]');
        this.billPaymentHistory = JSON.parse(localStorage.getItem('moneyJars_billPaymentHistory') || '[]');
        this.appState = JSON.parse(localStorage.getItem('moneyJars_appState') || '{"currentMonth":0,"currentYear":2023,"lastNudgeDate":null}');
    },

    // Get total balance across all jars
    getTotalBalance: function() {
        return this.jars.reduce((total, jar) => total + jar.amount, 0);
    },

    // Get a jar by ID
    getJarById: function(id) {
        return this.jars.find(jar => jar.id === id);
    },

    // Get a movement by ID
    getMovementById: function(id) {
        return this.movements.find(movement => movement.id === id);
    },

    // Add a money movement
    addMovement: function(amount, direction, jarId, description, note = '') {
        const movement = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            direction: direction,
            jarId: jarId,
            date: new Date().toISOString(),
            description: description,
            note: note
        };

        this.movements.push(movement);

        // Update jar amount
        const jar = this.getJarById(jarId);
        if (jar) {
            if (direction === 'in') {
                jar.amount += parseFloat(amount);
            } else {
                jar.amount -= parseFloat(amount);
            }
        }

        this.saveToStorage();
        return movement;
    },

    // Update a money movement
    updateMovement: function(movementId, newAmount, newJarId, newNote = '') {
        const movement = this.getMovementById(movementId);
        if (!movement) return false;
        
        const oldAmount = movement.amount;
        const oldJarId = movement.jarId;
        const oldDirection = movement.direction;
        
        // First, reverse the old transaction
        const oldJar = this.getJarById(oldJarId);
        if (oldJar) {
            if (oldDirection === 'in') {
                oldJar.amount -= oldAmount;
            } else {
                oldJar.amount += oldAmount;
            }
        }
        
        // Update movement details
        movement.amount = parseFloat(newAmount);
        movement.jarId = newJarId;
        movement.note = newNote;
        movement.updatedDate = new Date().toISOString();
        
        // Apply the updated transaction
        const newJar = this.getJarById(newJarId);
        if (newJar) {
            if (oldDirection === 'in') {
                newJar.amount += parseFloat(newAmount);
            } else {
                newJar.amount -= parseFloat(newAmount);
            }
        }
        
        this.saveToStorage();
        return true;
    },

    // Remove a money movement
    removeMovement: function(movementId) {
        const movementIndex = this.movements.findIndex(m => m.id === movementId);
        if (movementIndex === -1) return false;
        
        const movement = this.movements[movementIndex];
        
        // Reverse the transaction on the jar
        const jar = this.getJarById(movement.jarId);
        if (jar) {
            if (movement.direction === 'in') {
                jar.amount -= movement.amount;
            } else {
                jar.amount += movement.amount;
            }
        }
        
        // Remove the movement
        this.movements.splice(movementIndex, 1);
        this.saveToStorage();
        return true;
    },

    // Add a bill
    addBill: function(name, frequency, amount, dueDay) {
        const bill = {
            id: Date.now().toString(),
            name: name.trim(),
            frequency: frequency,
            amount: parseFloat(amount),
            dueDay: parseInt(dueDay),
            lastPaidMonth: null,
            lastPaidYear: null,
            lastAmount: frequency === 'variable' ? parseFloat(amount) : null,
            createdDate: new Date().toISOString()
        };

        this.bills.push(bill);
        this.saveToStorage();
        return bill;
    },

    // Find bills with similar names (for duplicate detection)
    findSimilarBills: function(billName) {
        if (!billName || billName.trim().length < 3) {
            return [];
        }
        
        const searchName = billName.trim().toLowerCase();
        return this.bills.filter(bill => {
            const billNameLower = bill.name.toLowerCase();
            return billNameLower === searchName || 
                   billNameLower.includes(searchName) || 
                   searchName.includes(billNameLower);
        });
    },

    // Mark a bill as paid
    markBillAsPaid: function(billId, amount = null) {
        const bill = this.bills.find(b => b.id === billId);
        if (!bill) return false;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        bill.lastPaidMonth = currentMonth;
        bill.lastPaidYear = currentYear;
        
        const paidAmount = amount !== null ? parseFloat(amount) : bill.amount;
        if (bill.frequency === 'variable') {
            bill.lastAmount = paidAmount;
        }

        // Record in payment history
        this.recordBillPayment(billId, bill.name, paidAmount, currentMonth, currentYear);

        // Deduct from bills jar
        const billsJar = this.getJarById('bills-jar');
        if (billsJar) {
            billsJar.amount -= paidAmount;
            
            // Create a movement for the bill payment
            this.addMovement(
                paidAmount, 
                'out', 
                'bills-jar', 
                bill.name, 
                'Bill payment'
            );
        }

        this.saveToStorage();
        return true;
    },

    // Record bill payment in history
    recordBillPayment: function(billId, billName, amount, month, year) {
        let billHistory = this.billPaymentHistory.find(h => h.billId === billId);
        
        if (!billHistory) {
            billHistory = {
                billId: billId,
                billName: billName,
                payments: []
            };
            this.billPaymentHistory.push(billHistory);
        }
        
        billHistory.payments.push({
            month: month,
            year: year,
            amount: amount,
            paidDate: new Date().toISOString()
        });
        
        billHistory.payments.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
        
        if (billHistory.payments.length > AppState.billHistoryMonths) {
            billHistory.payments = billHistory.payments.slice(0, AppState.billHistoryMonths);
        }
        
        this.saveToStorage();
    },

    // Get bills for the current month
    getBillsForCurrentMonth: function() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const today = currentDate.getDate();
        
        const upcoming = [];
        const paid = [];
        
        this.bills.forEach(bill => {
            const isPaid = bill.lastPaidMonth === currentMonth && bill.lastPaidYear === currentYear;
            
            if (isPaid) {
                paid.push(bill);
            } else {
                const daysUntilDue = bill.dueDay - today;
                upcoming.push({
                    ...bill,
                    daysUntilDue: daysUntilDue
                });
            }
        });
        
        upcoming.sort((a, b) => a.dueDay - b.dueDay);
        
        return { upcoming, paid };
    },

    // Get bill payment history for display
    getBillPaymentHistory: function() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const months = [];
        for (let i = 0; i < AppState.billHistoryMonths; i++) {
            let month = currentMonth - i;
            let year = currentYear;
            
            if (month < 0) {
                month += 12;
                year -= 1;
            }
            
            months.push({
                month: month,
                year: year,
                name: this.getMonthName(month)
            });
        }
        
        const billHistory = this.bills.map(bill => {
            const history = {
                billId: bill.id,
                billName: bill.name,
                dueDay: bill.dueDay,
                months: []
            };
            
            months.forEach(monthData => {
                const payment = this.billPaymentHistory
                    .find(h => h.billId === bill.id)
                    ?.payments.find(p => p.month === monthData.month && p.year === monthData.year);
                
                history.months.push({
                    ...monthData,
                    paid: !!payment,
                    amount: payment ? payment.amount : bill.amount,
                    isCurrentMonth: monthData.month === currentMonth && monthData.year === currentYear
                });
            });
            
            return history;
        });
        
        return billHistory;
    },

    // Get month name
    getMonthName: function(month) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[month];
    },

    // Get movements for a specific jar
    getMovementsForJar: function(jarId, limit = 10) {
        return this.movements
            .filter(movement => movement.jarId === jarId)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },

    // Get all movements for the current month
    getRecentMovements: function(limit = 50) {
        return this.movements
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },

    // Check if bills are covered
    areBillsCovered: function() {
        const billsJar = this.getJarById('bills-jar');
        if (!billsJar) return false;
        
        const currentMonthBills = this.getBillsForCurrentMonth();
        const totalUpcoming = currentMonthBills.upcoming.reduce((total, bill) => {
            return total + (bill.frequency === 'variable' ? bill.lastAmount || bill.amount : bill.amount);
        }, 0);
        
        return billsJar.amount >= totalUpcoming;
    },

    // Check if we should show a nudge
    shouldShowNudge: function() {
        if (AppState.lastNudgeDate) {
            const lastNudge = new Date(AppState.lastNudgeDate);
            const now = new Date();
            const daysSinceLastNudge = Math.floor((now - lastNudge) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastNudge < 7) {
                return false;
            }
        }
        
        const savingsJar = this.getJarById('savings-jar');
        const today = new Date();
        const dayOfMonth = today.getDate();
        
        if (dayOfMonth > 25 && savingsJar && savingsJar.amount < 100) {
            return "You could put a little in savings before the month ends.";
        }
        
        if (!this.areBillsCovered() && dayOfMonth > 20) {
            return "Let's make sure bills are covered this month.";
        }
        
        return null;
    },
        // Get a bill by ID
    getBillById: function(id) {
        return this.bills.find(bill => bill.id === id);
    },

    // Update a bill
    updateBill: function(billId, newName, newFrequency, newAmount, newDueDay) {
        const bill = this.getBillById(billId);
        if (!bill) return false;
        
        bill.name = newName.trim();
        bill.frequency = newFrequency;
        bill.amount = parseFloat(newAmount);
        bill.dueDay = parseInt(newDueDay);
        
        if (bill.frequency === 'variable' && bill.lastAmount === null) {
            bill.lastAmount = parseFloat(newAmount);
        }
        
        // Update bill name in payment history if it exists
        const billHistory = this.billPaymentHistory.find(h => h.billId === billId);
        if (billHistory) {
            billHistory.billName = newName.trim();
        }
        
        this.saveToStorage();
        return true;
    },

    // Remove a bill
    removeBill: function(billId) {
        const billIndex = this.bills.findIndex(b => b.id === billId);
        if (billIndex === -1) return false;
        
        // Remove bill from bills array
        this.bills.splice(billIndex, 1);
        
        // Remove bill from payment history
        const historyIndex = this.billPaymentHistory.findIndex(h => h.billId === billId);
        if (historyIndex !== -1) {
            this.billPaymentHistory.splice(historyIndex, 1);
        }
        
        this.saveToStorage();
        return true;
    },

    // Unmark a bill as paid (reverse payment)
    unmarkBillAsPaid: function(billId) {
        const bill = this.getBillById(billId);
        if (!bill) return false;
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Check if bill is actually marked as paid this month
        if (bill.lastPaidMonth !== currentMonth || bill.lastPaidYear !== currentYear) {
            return false;
        }
        
        // Reset bill payment status
        bill.lastPaidMonth = null;
        bill.lastPaidYear = null;
        
        // Find the payment in history
        const billHistory = this.billPaymentHistory.find(h => h.billId === billId);
        if (billHistory && billHistory.payments.length > 0) {
            // Remove the most recent payment (current month)
            billHistory.payments = billHistory.payments.filter(p => 
                !(p.month === currentMonth && p.year === currentYear)
            );
        }
        
        // Add back to bills jar
        const billsJar = this.getJarById('bills-jar');
        if (billsJar) {
            const paidAmount = bill.frequency === 'variable' ? bill.lastAmount || bill.amount : bill.amount;
            billsJar.amount += paidAmount;
            
            // Create a reverse movement
            this.addMovement(
                paidAmount, 
                'in', 
                'bills-jar', 
                `Return: ${bill.name}`, 
                'Bill payment reversed'
            );
        }
        
        this.saveToStorage();
        return true;
    }
    
};

// =========================================================================
// DOM ELEMENT REFERENCES
// =========================================================================

// Screens
const screens = {
    home: document.getElementById('homeScreen'),
    addMoney: document.getElementById('addMoneyScreen'),
    spendMoney: document.getElementById('spendMoneyScreen'),
    bills: document.getElementById('billsScreen'),
    addBill: document.getElementById('addBillScreen'),
    billHistory: document.getElementById('billHistoryScreen'),
    jarDetail: document.getElementById('jarDetailScreen'),
    allActivity: document.getElementById('allActivityScreen')
};

// Home screen elements
const totalBalanceEl = document.getElementById('totalBalance');
const statusMessageEl = document.getElementById('statusMessage');
const nudgeMessageEl = document.getElementById('nudgeMessage');
const jarsContainerEl = document.getElementById('jarsContainer');
const currentMonthEl = document.getElementById('currentMonth');

// Forms
const addMoneyForm = document.getElementById('addMoneyForm');
const spendMoneyForm = document.getElementById('spendMoneyForm');
const addBillForm = document.getElementById('addBillForm');

// Bill management elements
const billNameInput = document.getElementById('billName');
const existingBillsList = document.getElementById('existingBillsList');
const viewBillHistoryBtn = document.getElementById('viewBillHistoryBtn');
const backToBillsBtn = document.getElementById('backToBillsBtn');
const billHistoryContainer = document.getElementById('billHistoryContainer');

// Activity elements
const allActivityContainer = document.getElementById('allActivityContainer');
const viewAllActivityBtn = document.getElementById('viewAllActivityBtn');
const backToHomeFromActivityBtn = document.getElementById('backToHomeFromActivityBtn');

// Modal elements
const editTransactionModal = document.getElementById('editTransactionModal');
const modalClose = document.getElementById('modalClose');
const transactionDateEl = document.getElementById('transactionDate');
const transactionDescriptionEl = document.getElementById('transactionDescription');
const editAmountInput = document.getElementById('editAmount');
const editJarSelect = document.getElementById('editJar');
const editNoteInput = document.getElementById('editNote');
const editNoteContainer = document.getElementById('editNoteContainer');
const removeTransactionBtn = document.getElementById('removeTransactionBtn');
const saveTransactionBtn = document.getElementById('saveTransactionBtn');

// Bill edit modal elements
const editBillModal = document.getElementById('editBillModal');
const editBillModalClose = document.getElementById('editBillModalClose');
const editBillNameDisplay = document.getElementById('editBillNameDisplay');
const editBillNameInput = document.getElementById('editBillName');
const editFrequencyFixed = document.getElementById('editFrequencyFixed');
const editFrequencyVariable = document.getElementById('editFrequencyVariable');
const editBillAmountInput = document.getElementById('editBillAmount');
const editBillDueDayInput = document.getElementById('editBillDueDay');
const removeBillBtn = document.getElementById('removeBillBtn');
const saveBillChangesBtn = document.getElementById('saveBillChangesBtn');

// Success message
const successMessageEl = document.getElementById('successMessage');

// =========================================================================
// UTILITY FUNCTIONS
// =========================================================================

// Format a number as currency (without symbol)
function formatNumber(amount) {
    return parseFloat(amount).toFixed(2);
}

// Format a date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format date for modal display
function formatDateForModal(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show a success message
function showSuccessMessage(message) {
    successMessageEl.textContent = message;
    successMessageEl.style.display = 'block';
    
    setTimeout(() => {
        successMessageEl.style.display = 'none';
    }, 2000);
}

// Switch between screens
function showScreen(screenId) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        AppState.currentScreen = screenId;
    }
    
    document.querySelectorAll('.nav-item').forEach(navItem => {
        if (navItem.getAttribute('data-screen') === screenId) {
            navItem.classList.add('active');
        } else {
            navItem.classList.remove('active');
        }
    });
    
    if (screenId === 'homeScreen') {
        renderHomeScreen();
    } else if (screenId === 'billsScreen') {
        renderBillsScreen();
    } else if (screenId === 'billHistoryScreen') {
        renderBillHistoryScreen();
    } else if (screenId === 'allActivityScreen') {
        renderAllActivityScreen();
    }
}

// Show modal
function showModal() {
    editTransactionModal.classList.add('active');
}

// Hide modal
function hideModal() {
    editTransactionModal.classList.remove('active');
}

// Populate jar select dropdowns
function populateJarSelects() {
    const jarSelects = document.querySelectorAll('.select-jar');
    
    jarSelects.forEach(select => {
        while (select.options.length > 0) {
            select.remove(0);
        }
        
        if (select.id !== 'editJar') {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Choose a jar';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);
        }
        
        DataModel.jars.forEach(jar => {
            const option = document.createElement('option');
            option.value = jar.id;
            option.textContent = jar.name;
            select.appendChild(option);
        });
    });
}

// Show bill edit modal
function showEditBillModal() {
    editBillModal.classList.add('active');
}

// Hide bill edit modal
function hideEditBillModal() {
    editBillModal.classList.remove('active');
}

// Open bill editing modal
function openEditBillModal(billId) {
    const bill = DataModel.getBillById(billId);
    if (!bill) return;
    
    AppState.currentBillId = billId;
    
    editBillNameDisplay.textContent = bill.name;
    editBillNameInput.value = bill.name;
    editBillAmountInput.value = formatNumber(bill.amount);
    editBillDueDayInput.value = bill.dueDay;
    
    if (bill.frequency === 'fixed') {
        editFrequencyFixed.checked = true;
    } else {
        editFrequencyVariable.checked = true;
    }
    
    showEditBillModal();
}

// Open bill payment reversal modal
function openReverseBillPaymentModal(billId) {
    const bill = DataModel.getBillById(billId);
    if (!bill) return;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Check if bill is actually paid this month
    if (bill.lastPaidMonth !== currentMonth || bill.lastPaidYear !== currentYear) {
        showSuccessMessage('This bill is not marked as paid this month');
        return;
    }
    
    const paidAmount = bill.frequency === 'variable' ? bill.lastAmount || bill.amount : bill.amount;
    
    if (confirm(`Unmark ${bill.name} as paid and return ${formatNumber(paidAmount)} to Bills jar?`)) {
        const success = DataModel.unmarkBillAsPaid(billId);
        
        if (success) {
            showSuccessMessage('Bill payment reversed');
            renderBillsScreen();
            if (AppState.currentScreen === 'billHistoryScreen') {
                renderBillHistoryScreen();
            }
        } else {
            showSuccessMessage('Could not reverse payment');
        }
    }
}

// =========================================================================
// TRANSACTION EDITING FUNCTIONS
// =========================================================================

// Open transaction editing modal
function openEditTransactionModal(movementId) {
    const movement = DataModel.getMovementById(movementId);
    if (!movement) return;
    
    AppState.currentTransactionId = movementId;
    
    transactionDateEl.textContent = formatDateForModal(movement.date);
    transactionDescriptionEl.textContent = movement.description;
    editAmountInput.value = formatNumber(movement.amount);
    editNoteInput.value = movement.note || '';
    
    populateJarSelects();
    
    setTimeout(() => {
        editJarSelect.value = movement.jarId;
    }, 0);
    
    if (movement.description === 'Money came in') {
        editNoteContainer.style.display = 'block';
        editNoteInput.placeholder = 'Where did it come from?';
    } else if (movement.description === 'Money went out') {
        editNoteContainer.style.display = 'block';
        editNoteInput.placeholder = 'What was it for?';
    } else {
        editNoteContainer.style.display = 'block';
        editNoteInput.placeholder = 'Add a note';
    }
    
    showModal();
}

// =========================================================================
// BILL MANAGEMENT FUNCTIONS
// =========================================================================

// Show existing bills as user types
function showExistingBillsSuggestions(searchTerm) {
    existingBillsList.innerHTML = '';
    
    if (!searchTerm || searchTerm.trim().length < 2) {
        existingBillsList.style.display = 'none';
        return;
    }
    
    const similarBills = DataModel.findSimilarBills(searchTerm);
    
    if (similarBills.length === 0) {
        existingBillsList.style.display = 'none';
        return;
    }
    
    const exactMatch = similarBills.find(bill => 
        bill.name.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    
    if (exactMatch) {
        const duplicateItem = document.createElement('div');
        duplicateItem.className = 'existing-bill-item existing-bill-duplicate';
        duplicateItem.innerHTML = `
            <div class="existing-bill-name">${exactMatch.name}</div>
            <div class="existing-bill-details">
                Already exists • Due day ${exactMatch.dueDay} • ${exactMatch.frequency === 'fixed' ? 'Fixed amount' : 'Variable amount'}
            </div>
            <div class="text-very-muted mt-xs">This looks like the same bill</div>
        `;
        
        duplicateItem.addEventListener('click', function() {
            billNameInput.value = exactMatch.name;
            document.getElementById('billDueDay').value = exactMatch.dueDay;
            document.getElementById('billAmount').value = formatNumber(exactMatch.amount);
            
            if (exactMatch.frequency === 'fixed') {
                document.getElementById('frequencyFixed').checked = true;
            } else {
                document.getElementById('frequencyVariable').checked = true;
            }
            
            existingBillsList.style.display = 'none';
        });
        
        existingBillsList.appendChild(duplicateItem);
    }
    
    similarBills.forEach(bill => {
        if (exactMatch && bill.id === exactMatch.id) {
            return;
        }
        
        const billItem = document.createElement('div');
        billItem.className = 'existing-bill-item';
        billItem.innerHTML = `
            <div class="existing-bill-name">${bill.name}</div>
            <div class="existing-bill-details">
                Due day ${bill.dueDay} • ${bill.frequency === 'fixed' ? 'Fixed amount' : 'Variable amount'}
            </div>
        `;
        
        billItem.addEventListener('click', function() {
            billNameInput.value = bill.name;
            existingBillsList.style.display = 'none';
        });
        
        existingBillsList.appendChild(billItem);
    });
    
    existingBillsList.style.display = 'block';
}

// Render bill history screen
function renderBillHistoryScreen() {
    const billHistory = DataModel.getBillPaymentHistory();
    
    if (billHistory.length === 0) {
        billHistoryContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <p>No bill history yet</p>
                <p class="text-very-muted mt-sm">Bill payment history will appear here</p>
            </div>
        `;
        return;
    }
    
    let historyHTML = '';
    
    billHistory.forEach(bill => {
        const currentBill = DataModel.getBillById(bill.billId);
        if (!currentBill) return;
        
        historyHTML += `
            <div class="history-item bill-history-item" data-bill-id="${bill.billId}">
                <div class="history-header">
                    <div>
                        <div class="bill-name">${bill.billName}</div>
                        <div class="bill-details">Due day ${bill.dueDay}</div>
                    </div>
                    <button class="btn-small btn-outline edit-bill-btn" data-bill-id="${bill.billId}">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
                <div class="history-months">
        `;
        
        bill.months.forEach(month => {
            const monthClass = month.isCurrentMonth ? 'history-month-current' : '';
            const amountClass = month.paid ? 'history-month-paid' : 'history-month-unpaid';
            const statusText = month.paid ? 'Paid' : 'Not paid';
            
            historyHTML += `
                <div class="history-month ${monthClass}">
                    <div class="history-month-name">${month.name}</div>
                    <div class="history-month-amount ${amountClass}">${formatNumber(month.amount)}</div>
                    <div class="text-very-muted" style="font-size: 11px; margin-top: 2px;">${statusText}</div>
                </div>
            `;
        });
        
        historyHTML += `
                </div>
            </div>
        `;
    });
    
    billHistoryContainer.innerHTML = historyHTML;
    
    // Add click handlers to history items
    document.querySelectorAll('.bill-history-item[data-bill-id]').forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking the edit button
            if (!e.target.closest('.edit-bill-btn')) {
                const billId = this.getAttribute('data-bill-id');
                const currentBill = DataModel.getBillById(billId);
                
                if (currentBill) {
                    // Check if bill is paid this month
                    const currentDate = new Date();
                    const currentMonth = currentDate.getMonth();
                    const currentYear = currentDate.getFullYear();
                    
                    if (currentBill.lastPaidMonth === currentMonth && currentBill.lastPaidYear === currentYear) {
                        openReverseBillPaymentModal(billId);
                    } else {
                        openEditBillModal(billId);
                    }
                }
            }
        });
    });
    
    // Add click handlers to edit buttons
    document.querySelectorAll('.edit-bill-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const billId = this.getAttribute('data-bill-id');
            openEditBillModal(billId);
        });
    });
}

// =========================================================================
// ACTIVITY SCREEN FUNCTIONS
// =========================================================================

// Render all activity screen
function renderAllActivityScreen() {
    const movements = DataModel.getRecentMovements(50);
    
    if (movements.length === 0) {
        allActivityContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>No activity yet</p>
                <p class="text-very-muted mt-sm">Add or spend money to see activity here</p>
            </div>
        `;
        return;
    }
    
    let activityHTML = '';
    
    const groupedByDate = {};
    movements.forEach(movement => {
        const date = new Date(movement.date);
        const dateKey = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(movement);
    });
    
    Object.keys(groupedByDate).forEach(dateKey => {
        activityHTML += `<div class="section-title">${dateKey}</div>`;
        
        groupedByDate[dateKey].forEach(movement => {
            const jar = DataModel.getJarById(movement.jarId);
            const jarName = jar ? jar.name : 'Unknown jar';
            const amountClass = movement.direction === 'in' ? 'activity-amount-in' : 'activity-amount-out';
            const amountPrefix = movement.direction === 'in' ? '+' : '-';
            
            activityHTML += `
                <div class="activity-item" data-movement-id="${movement.id}">
                    <div class="activity-description">
                        <div>${movement.description}</div>
                        <div class="activity-note">
                            ${movement.note || ''}
                            ${movement.note ? ' • ' : ''}${jarName}
                        </div>
                        <div class="activity-date">${new Date(movement.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div class="${amountClass}">
                        ${amountPrefix}${formatNumber(movement.amount)}
                    </div>
                </div>
            `;
        });
    });
    
    allActivityContainer.innerHTML = activityHTML;
    
    document.querySelectorAll('.activity-item[data-movement-id]').forEach(item => {
        item.addEventListener('click', function() {
            const movementId = this.getAttribute('data-movement-id');
            openEditTransactionModal(movementId);
        });
    });
}

// =========================================================================
// RENDER FUNCTIONS
// =========================================================================

// Render the home screen
function renderHomeScreen() {
    const totalBalance = DataModel.getTotalBalance();
    totalBalanceEl.textContent = formatNumber(totalBalance);
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = new Date().getMonth();
    currentMonthEl.textContent = monthNames[currentMonth];
    
    const billsCovered = DataModel.areBillsCovered();
    statusMessageEl.textContent = billsCovered 
        ? 'Bills look covered 👍' 
        : 'Let\'s keep an eye on things.';
    
    const nudgeMessage = DataModel.shouldShowNudge();
    if (nudgeMessage) {
        nudgeMessageEl.textContent = nudgeMessage;
        nudgeMessageEl.style.display = 'block';
        AppState.lastNudgeDate = new Date().toISOString();
    } else {
        nudgeMessageEl.style.display = 'none';
    }
    
    renderJars();
}

// Render the jar cards
function renderJars() {
    jarsContainerEl.innerHTML = '';
    
    DataModel.jars.forEach(jar => {
        const jarCard = document.createElement('div');
        jarCard.className = 'card jar-card';
        jarCard.setAttribute('data-jar-id', jar.id);
        
        jarCard.innerHTML = `
            <div class="jar-card-info">
                <h3>${jar.name}</h3>
                <div class="text-muted">You have</div>
            </div>
            <div class="jar-card-amount">${formatNumber(jar.amount)}</div>
        `;
        
        jarCard.addEventListener('click', () => {
            AppState.currentJarId = jar.id;
            renderJarDetailScreen();
            showScreen('jarDetailScreen');
        });
        
        jarsContainerEl.appendChild(jarCard);
    });
}

// Render the jar detail screen
function renderJarDetailScreen() {
    const jar = DataModel.getJarById(AppState.currentJarId);
    if (!jar) return;
    
    document.getElementById('jarDetailName').textContent = jar.name;
    document.getElementById('jarDetailBalance').textContent = formatNumber(jar.amount);
    
    const activityListEl = document.getElementById('jarActivityList');
    const movements = DataModel.getMovementsForJar(jar.id);
    
    if (movements.length === 0) {
        activityListEl.innerHTML = `
            <h3>Recent activity</h3>
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>No activity yet</p>
            </div>
        `;
    } else {
        let activityHTML = '<h3>Recent activity</h3>';
        
        movements.forEach(movement => {
            const amountClass = movement.direction === 'in' ? 'activity-amount-in' : 'activity-amount-out';
            const amountPrefix = movement.direction === 'in' ? '+' : '-';
            
            activityHTML += `
                <div class="activity-item" data-movement-id="${movement.id}">
                    <div class="activity-description">
                        <div>${movement.description}</div>
                        ${movement.note ? `<div class="activity-note">${movement.note}</div>` : ''}
                        <div class="activity-date">${formatDate(movement.date)}</div>
                    </div>
                    <div class="${amountClass}">
                        ${amountPrefix}${formatNumber(movement.amount)}
                    </div>
                </div>
            `;
        });
        
        activityListEl.innerHTML = activityHTML;
        
        document.querySelectorAll('.activity-item[data-movement-id]').forEach(item => {
            item.addEventListener('click', function() {
                const movementId = this.getAttribute('data-movement-id');
                openEditTransactionModal(movementId);
            });
        });
    }
    
    document.getElementById('addToJarBtn').onclick = () => {
        const jarSelect = document.getElementById('addMoneyJar');
        if (jarSelect) {
            jarSelect.value = jar.id;
        }
        showScreen('addMoneyScreen');
    };
    
    document.getElementById('spendFromJarBtn').onclick = () => {
        const jarSelect = document.getElementById('spendMoneyJar');
        if (jarSelect) {
            jarSelect.value = jar.id;
        }
        showScreen('spendMoneyScreen');
    };
}

// Render the bills screen
function renderBillsScreen() {
    const { upcoming, paid } = DataModel.getBillsForCurrentMonth();
    const upcomingBillsEl = document.getElementById('upcomingBills');
    const paidBillsEl = document.getElementById('paidBills');
    
    if (upcoming.length === 0) {
        upcomingBillsEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📄</div><p>No bills coming up</p></div>';
    } else {
        upcomingBillsEl.innerHTML = '';
        
        upcoming.forEach(bill => {
            const billItem = document.createElement('div');
            billItem.className = 'card bill-item';
            billItem.setAttribute('data-bill-id', bill.id);
            
            const dueText = bill.daysUntilDue === 0 ? 'Due today' : 
                           bill.daysUntilDue === 1 ? 'Due tomorrow' : 
                           bill.daysUntilDue < 0 ? `Overdue by ${Math.abs(bill.daysUntilDue)} days` : 
                           `Due in ${bill.daysUntilDue} days`;
            
            billItem.innerHTML = `
                <div class="bill-info">
                    <div class="bill-name">${bill.name}</div>
                    <div class="bill-details">${dueText} • Day ${bill.dueDay}</div>
                </div>
                <div class="bill-amount">${formatNumber(bill.amount)}</div>
            `;
            
            // For upcoming bills, click to mark as paid
            billItem.addEventListener('click', (e) => {
                e.stopPropagation();
                AppState.currentBillId = bill.id;
                
                if (bill.frequency === 'variable') {
                    const amount = prompt(`How much was ${bill.name} this month?`, bill.lastAmount || bill.amount);
                    if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
                        DataModel.markBillAsPaid(bill.id, parseFloat(amount));
                        showSuccessMessage('Bill marked as paid 👍');
                        renderBillsScreen();
                    }
                } else {
                    DataModel.markBillAsPaid(bill.id);
                    showSuccessMessage('Bill marked as paid 👍');
                    renderBillsScreen();
                }
            });
            
            // Add edit button for upcoming bills
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-small btn-outline';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.style.marginTop = '8px';
            editBtn.style.width = 'auto';
            editBtn.style.padding = '4px 12px';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditBillModal(bill.id);
            });
            
            billItem.appendChild(editBtn);
            upcomingBillsEl.appendChild(billItem);
        });
    }
    
    if (paid.length === 0) {
        paidBillsEl.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>No bills paid yet</p></div>';
    } else {
        paidBillsEl.innerHTML = '';
        
        paid.forEach(bill => {
            const billItem = document.createElement('div');
            billItem.className = 'card bill-item bill-paid';
            billItem.setAttribute('data-bill-id', bill.id);
            
            billItem.innerHTML = `
                <div class="bill-info">
                    <div class="bill-name">${bill.name}</div>
                    <div class="bill-details">Paid • Day ${bill.dueDay}</div>
                </div>
                <div class="bill-amount">${formatNumber(bill.amount)}</div>
            `;
            
            // For paid bills, click to reverse payment
            billItem.addEventListener('click', (e) => {
                e.stopPropagation();
                openReverseBillPaymentModal(bill.id);
            });
            
            // Add edit button for paid bills
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-small btn-outline';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.style.marginTop = '8px';
            editBtn.style.width = 'auto';
            editBtn.style.padding = '4px 12px';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditBillModal(bill.id);
            });
            
            billItem.appendChild(editBtn);
            paidBillsEl.appendChild(billItem);
        });
    }
}

// Populate category radio buttons
function populateCategories() {
    const categoryGroup = document.getElementById('spendCategoryGroup');
    categoryGroup.innerHTML = '';
    
    AppState.categories.forEach(category => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'radio-option';
        
        const inputId = `category-${category.toLowerCase().replace(' ', '-')}`;
        
        optionDiv.innerHTML = `
            <input type="radio" id="${inputId}" name="category" value="${category}" class="radio-input" ${category === 'Something else' ? 'checked' : ''}>
            <label for="${inputId}" class="radio-label">${category}</label>
        `;
        
        categoryGroup.appendChild(optionDiv);
    });
}

// =========================================================================
// EVENT HANDLERS AND FORM SUBMISSIONS
// =========================================================================

// Handle add money form submission
addMoneyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = document.getElementById('addMoneyAmount').value;
    const jarId = document.getElementById('addMoneyJar').value;
    const source = document.getElementById('addMoneySource').value;
    
    if (!amount || parseFloat(amount) <= 0 || !jarId) {
        return;
    }
    
    DataModel.addMovement(
        parseFloat(amount), 
        'in', 
        jarId, 
        'Money came in', 
        source || undefined
    );
    
    showSuccessMessage('Money added 👍');
    addMoneyForm.reset();
    showScreen('homeScreen');
});

// Handle spend money form submission
spendMoneyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = document.getElementById('spendMoneyAmount').value;
    const jarId = document.getElementById('spendMoneyJar').value;
    const category = document.querySelector('input[name="category"]:checked').value;
    
    if (!amount || parseFloat(amount) <= 0 || !jarId) {
        return;
    }
    
    const jar = DataModel.getJarById(jarId);
    if (jar && jar.amount < parseFloat(amount)) {
        // Still allow spending even if negative
    }
    
    DataModel.addMovement(
        parseFloat(amount), 
        'out', 
        jarId, 
        category, 
        'Money went out'
    );
    
    showSuccessMessage('Money spent');
    spendMoneyForm.reset();
    showScreen('homeScreen');
});

// Handle add bill form submission
addBillForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('billName').value.trim();
    const frequency = document.querySelector('input[name="frequency"]:checked').value;
    const amount = document.getElementById('billAmount').value;
    const dueDay = document.getElementById('billDueDay').value;
    
    if (!name || !amount || parseFloat(amount) <= 0 || !dueDay || dueDay < 1 || dueDay > 31) {
        return;
    }
    
    const exactDuplicate = DataModel.bills.find(bill => 
        bill.name.toLowerCase() === name.toLowerCase()
    );
    
    if (exactDuplicate) {
        showSuccessMessage('Bill already exists');
        return;
    }
    
    DataModel.addBill(name, frequency, parseFloat(amount), parseInt(dueDay));
    
    showSuccessMessage('Bill added');
    addBillForm.reset();
    existingBillsList.style.display = 'none';
    
    renderBillsScreen();
    showScreen('billsScreen');
});

// Handle bill name input for showing existing bills
billNameInput.addEventListener('input', function() {
    showExistingBillsSuggestions(this.value);
});

// Handle clicking outside to hide suggestions
document.addEventListener('click', function(e) {
    if (!billNameInput.contains(e.target) && !existingBillsList.contains(e.target)) {
        existingBillsList.style.display = 'none';
    }
});

// Handle view bill history button
viewBillHistoryBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showScreen('billHistoryScreen');
});

// Handle back to bills button
backToBillsBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showScreen('billsScreen');
});

// Handle view all activity button
viewAllActivityBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showScreen('allActivityScreen');
});

// Handle back to home from activity button
backToHomeFromActivityBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showScreen('homeScreen');
});

// Handle add bill button click
document.getElementById('addBillBtn').addEventListener('click', function() {
    addBillForm.reset();
    document.getElementById('frequencyFixed').checked = true;
    document.getElementById('addBillTitle').textContent = 'Add a bill';
    existingBillsList.style.display = 'none';
    existingBillsList.innerHTML = '';
    showScreen('addBillScreen');
});

// Handle save transaction changes
saveTransactionBtn.addEventListener('click', function() {
    const movementId = AppState.currentTransactionId;
    const newAmount = editAmountInput.value;
    const newJarId = editJarSelect.value;
    const newNote = editNoteInput.value;
    
    if (!movementId || !newAmount || parseFloat(newAmount) <= 0 || !newJarId) {
        showSuccessMessage('Please fill all fields');
        return;
    }
    
    const success = DataModel.updateMovement(movementId, newAmount, newJarId, newNote);
    
    if (success) {
        showSuccessMessage('Mistake fixed 👍');
        hideModal();
        
        if (AppState.currentScreen === 'jarDetailScreen') {
            renderJarDetailScreen();
        } else if (AppState.currentScreen === 'allActivityScreen') {
            renderAllActivityScreen();
        } else {
            renderHomeScreen();
        }
    } else {
        showSuccessMessage('Could not update');
    }
});

// Handle remove transaction
removeTransactionBtn.addEventListener('click', function() {
    const movementId = AppState.currentTransactionId;
    
    if (!movementId) return;
    
    const movement = DataModel.getMovementById(movementId);
    if (movement && confirm(`Remove ${movement.description} for ${formatNumber(movement.amount)}?`)) {
        const success = DataModel.removeMovement(movementId);
        
        if (success) {
            showSuccessMessage('Removed');
            hideModal();
            
            if (AppState.currentScreen === 'jarDetailScreen') {
                renderJarDetailScreen();
            } else if (AppState.currentScreen === 'allActivityScreen') {
                renderAllActivityScreen();
            } else {
                renderHomeScreen();
            }
        } else {
            showSuccessMessage('Could not remove');
        }
    }
});

// Close modal handlers
modalClose.addEventListener('click', hideModal);
editTransactionModal.addEventListener('click', function(e) {
    if (e.target === editTransactionModal) {
        hideModal();
    }
});

// Handle save bill changes
saveBillChangesBtn.addEventListener('click', function() {
    const billId = AppState.currentBillId;
    const newName = editBillNameInput.value.trim();
    const newFrequency = document.querySelector('input[name="editFrequency"]:checked').value;
    const newAmount = editBillAmountInput.value;
    const newDueDay = editBillDueDayInput.value;
    
    if (!billId || !newName || !newAmount || parseFloat(newAmount) <= 0 || !newDueDay || newDueDay < 1 || newDueDay > 31) {
        showSuccessMessage('Please fill all fields correctly');
        return;
    }
    
    const success = DataModel.updateBill(billId, newName, newFrequency, newAmount, newDueDay);
    
    if (success) {
        showSuccessMessage('Bill updated 👍');
        hideEditBillModal();
        
        // Refresh the current screen
        if (AppState.currentScreen === 'billsScreen') {
            renderBillsScreen();
        } else if (AppState.currentScreen === 'billHistoryScreen') {
            renderBillHistoryScreen();
        }
    } else {
        showSuccessMessage('Could not update bill');
    }
});

// Handle remove bill
removeBillBtn.addEventListener('click', function() {
    const billId = AppState.currentBillId;
    
    if (!billId) return;
    
    const bill = DataModel.getBillById(billId);
    if (bill && confirm(`Remove ${bill.name} bill completely? This cannot be undone.`)) {
        const success = DataModel.removeBill(billId);
        
        if (success) {
            showSuccessMessage('Bill removed');
            hideEditBillModal();
            
            // Refresh the current screen
            if (AppState.currentScreen === 'billsScreen') {
                renderBillsScreen();
            } else if (AppState.currentScreen === 'billHistoryScreen') {
                renderBillHistoryScreen();
            }
        } else {
            showSuccessMessage('Could not remove bill');
        }
    }
});

// Close bill modal handlers
editBillModalClose.addEventListener('click', hideEditBillModal);
editBillModal.addEventListener('click', function(e) {
    if (e.target === editBillModal) {
        hideEditBillModal();
    }
});

// =========================================================================
// NAVIGATION AND INITIALIZATION
// =========================================================================

// Set up navigation
document.querySelectorAll('.nav-item').forEach(navItem => {
    navItem.addEventListener('click', function(e) {
        e.preventDefault();
        const screenId = this.getAttribute('data-screen');
        showScreen(screenId);
    });
});

// Set up back button behavior (simulated with logo click)
document.querySelector('.app-header h1').addEventListener('click', function() {
    if (AppState.currentScreen !== 'homeScreen') {
        showScreen('homeScreen');
    }
});

// Initialize the app
function initApp() {
    DataModel.init();
    populateJarSelects();
    populateCategories();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = new Date().getMonth();
    currentMonthEl.textContent = monthNames[currentMonth];
    
    const appState = DataModel.appState;
    const currentDate = new Date();
    const currentMonthNow = currentDate.getMonth();
    const currentYearNow = currentDate.getFullYear();
    
    if (appState.currentMonth !== currentMonthNow || appState.currentYear !== currentYearNow) {
        DataModel.bills.forEach(bill => {
            bill.lastPaidMonth = null;
            bill.lastPaidYear = null;
        });
        appState.currentMonth = currentMonthNow;
        appState.currentYear = currentYearNow;
        DataModel.saveToStorage();
    }
    
    renderHomeScreen();
    showScreen('homeScreen');
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);