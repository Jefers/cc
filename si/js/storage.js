// storage.js
const Storage = {
    // Initialize storage with sample data if empty
    init() {
        if (!localStorage.getItem('inventory')) {
            const sampleInventory = [
                { id: '1', description: 'Coffee Mug', price: 5.99, quantity: 10 },
                { id: '2', description: 'Notebook', price: 3.50, quantity: 15 },
                { id: '3', description: 'Pen', price: 1.25, quantity: 20 }
            ];
            localStorage.setItem('inventory', JSON.stringify(sampleInventory));
            // Initialize previous inventory as a copy of sample data
            localStorage.setItem('previousInventory', JSON.stringify(sampleInventory));
        }
        if (!localStorage.getItem('till')) {
            localStorage.setItem('till', JSON.stringify([]));
        }
        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
        }
        // Initialize current till start if not set
        if (!localStorage.getItem('currentTillStart')) {
            localStorage.setItem('currentTillStart', JSON.stringify(null));
        }
    },

    // Inventory storage
    getInventory() {
        return JSON.parse(localStorage.getItem('inventory')) || [];
    },

    saveInventory(inventory) {
        // Save current inventory as previous before updating
        const currentInventory = Storage.getInventory();
        localStorage.setItem('previousInventory', JSON.stringify(currentInventory));
        localStorage.setItem('inventory', JSON.stringify(inventory));
    },

    getPreviousInventory() {
        return JSON.parse(localStorage.getItem('previousInventory')) || [];
    },

    // Till storage
    getTill() {
        return JSON.parse(localStorage.getItem('till')) || [];
    },

    saveTill(till) {
        localStorage.setItem('till', JSON.stringify(till));
    },

    // Current till start
    getCurrentTillStart() {
        return JSON.parse(localStorage.getItem('currentTillStart'));
    },

    saveCurrentTillStart(amount) {
        localStorage.setItem('currentTillStart', JSON.stringify(amount));
    },

    // Transactions storage
    getTransactions() {
        return JSON.parse(localStorage.getItem('transactions')) || [];
    },

    saveTransactions(transactions) {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    },

    // Export all data as JSON
    exportData() {
        const data = {
            inventory: Storage.getInventory(),
            previousInventory: Storage.getPreviousInventory(),
            till: Storage.getTill(),
            currentTillStart: Storage.getCurrentTillStart(),
            transactions: Storage.getTransactions()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shop-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Import data from JSON
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.inventory) Storage.saveInventory(data.inventory);
                if (data.previousInventory) localStorage.setItem('previousInventory', JSON.stringify(data.previousInventory));
                if (data.till) Storage.saveTill(data.till);
                if (data.currentTillStart !== undefined) Storage.saveCurrentTillStart(data.currentTillStart);
                if (data.transactions) Storage.saveTransactions(data.transactions);
                // Re-render UI after import
                Inventory.render();
                Till.render();
                Transactions.render();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    }
};