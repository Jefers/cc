// inventory.js
const Inventory = {
    render() {
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = '';
        const inventory = Storage.getInventory();

        inventory.forEach(item => {
            const li = document.createElement('li');
            li.setAttribute('draggable', true);
            li.setAttribute('data-id', item.id);
            li.innerHTML = `
                ${item.description} - $${item.price.toFixed(2)} - Qty: ${item.quantity}
                <div>
                    <button onclick="Inventory.edit('${item.id}')" aria-label="Edit ${item.description}">Edit</button>
                    <button onclick="Inventory.delete('${item.id}')" aria-label="Delete ${item.description}">Delete</button>
                </div>
            `;
            inventoryList.appendChild(li);
        });

        // Enable drag-and-drop
        inventoryList.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.id);
        });

        inventoryList.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        inventoryList.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            const targetId = e.target.closest('li').dataset.id;
            const inventory = Storage.getInventory();
            const draggedIndex = inventory.findIndex(item => item.id === draggedId);
            const targetIndex = inventory.findIndex(item => item.id === targetId);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                const [draggedItem] = inventory.splice(draggedIndex, 1);
                inventory.splice(targetIndex, 0, draggedItem);
                Storage.saveInventory(inventory);
                Inventory.render();
            }
        });
    },

    add(description, price, quantity) {
        const inventory = Storage.getInventory();
        const id = Date.now().toString();
        inventory.push({ id, description, price: parseFloat(price), quantity: parseInt(quantity) });
        Storage.saveInventory(inventory);
        Inventory.render();
        Transactions.calculate();
    },

    edit(id) {
        const inventory = Storage.getInventory();
        const item = inventory.find(item => item.id === id);
        if (item) {
            document.getElementById('item-description').value = item.description;
            document.getElementById('item-price').value = item.price;
            document.getElementById('item-quantity').value = item.quantity;
            document.getElementById('item-form').dataset.id = id;
            document.getElementById('item-modal').showModal();
        }
    },

    update(id, description, price, quantity) {
        const inventory = Storage.getInventory();
        const itemIndex = inventory.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            inventory[itemIndex] = { id, description, price: parseFloat(price), quantity: parseInt(quantity) };
            Storage.saveInventory(inventory);
            Inventory.render();
            Transactions.calculate();
        }
    },

    delete(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            const inventory = Storage.getInventory();
            const updatedInventory = inventory.filter(item => item.id !== id);
            Storage.saveInventory(updatedInventory);
            Inventory.render();
            Transactions.calculate();
        }
    }
};