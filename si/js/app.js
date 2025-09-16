// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize storage with sample data
    Storage.init();

    // Render initial state
    Inventory.render();
    Till.render();
    Transactions.render();

    // Add item button
    document.getElementById('add-item-btn').addEventListener('click', () => {
        document.getElementById('item-form').reset();
        delete document.getElementById('item-form').dataset.id;
        document.getElementById('item-modal').showModal();
    });

    // Cancel item modal
    document.getElementById('cancel-item-btn').addEventListener('click', () => {
        document.getElementById('item-modal').close();
    });

    // Handle item form submission
    document.getElementById('item-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('item-description').value;
        const price = document.getElementById('item-price').value;
        const quantity = document.getElementById('item-quantity').value;
        const id = e.target.dataset.id;

        if (id) {
            Inventory.update(id, description, price, quantity);
        } else {
            Inventory.add(description, price, quantity);
        }
        document.getElementById('item-modal').close();
    });

    // Auto-save till start
    document.getElementById('till-start').addEventListener('change', (e) => {
        const start = e.target.value;
        if (start) {
            Till.saveStart(start);
        }
    });

    // Handle till form submission for end of shift
    document.getElementById('till-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const end = document.getElementById('till-end').value;
        if (end) {
            Till.saveEnd(end);
            e.target.reset();
        }
    });

    // Export data
    document.getElementById('export-btn').addEventListener('click', () => {
        Storage.exportData();
    });

    // Import data
    document.getElementById('import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            Storage.importData(file);
            e.target.value = ''; // Reset file input
        }
    });
});