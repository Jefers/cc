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

    // Handle till form submission
    document.getElementById('till-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const start = document.getElementById('till-start').value;
        const end = document.getElementById('till-end').value;
        Till.save(start, end);
        e.target.reset();
    });
});