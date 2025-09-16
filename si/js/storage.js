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
        }
        if (!localStorage.getItem('till')) {
            localStorage.setItem('till', JSON.stringify([]));
        }
        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
        }
    },

    // Inventory storage
    getInventory() {
        return JSON.parse(localStorage.getItem('inventory')) || [];
    },

    saveInventory(inventory) {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    },

    // Till storage
    getTill() {
        return JSON.parse(localStorage.getItem('till')) || [];
    },

    saveTill(till) {
        localStorage.setItem('till', JSON.stringify(till));
    },

    // Transactions storage
    getTransactions() {
        return JSON.parse(localStorage.getItem('transactions')) || [];
    },

    saveTransactions(transactions) {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
};