// Data Storage Layer
class DataStore {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        const stored = localStorage.getItem('mealPlannerData');
        if (stored) {
            return JSON.parse(stored);
        }
        // Return default data on first load
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    saveData() {
        localStorage.setItem('mealPlannerData', JSON.stringify(this.data));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Items CRUD
    addItem(item) {
        item.id = this.generateId();
        this.data.items.push(item);
        this.saveData();
        return item;
    }

    updateItem(id, updates) {
        const index = this.data.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data.items[index] = { ...this.data.items[index], ...updates };
            this.saveData();
            return this.data.items[index];
        }
        return null;
    }

    deleteItem(id) {
        this.data.items = this.data.items.filter(item => item.id !== id);
        this.saveData();
    }

    getItems() {
        return this.data.items;
    }

    getItem(id) {
        return this.data.items.find(item => item.id === id);
    }

    // Meals
    getMeal(mealId) {
        return this.data.meals.find(m => m.id === mealId);
    }

    updateMeal(mealId, updates) {
        const index = this.data.meals.findIndex(m => m.id === mealId);
        if (index !== -1) {
            this.data.meals[index] = { ...this.data.meals[index], ...updates };
            this.saveData();
            return this.data.meals[index];
        }
        return null;
    }

    addMeal(meal) {
        meal.id = this.generateId();
        this.data.meals.push(meal);
        this.saveData();
        return meal;
    }

    // Plan methods
    setPlanSlot(dayIndex, slotIndex, mealId) {
        if (this.data.plan[dayIndex]) {
            this.data.plan[dayIndex].slots[slotIndex] = mealId;
            this.saveData();
        }
    }

    getPlan() {
        return this.data.plan;
    }

    // Supplements
    getSupplements() {
        return this.data.supplements || [];
    }
}

// App Controller
class MealPlannerApp {
    constructor() {
        this.dataStore = new DataStore();
        this.currentScreen = 'inventory';
        this.currentDay = 0;
        this.editingItemId = null;
        this.currentMealSlot = null;
        this.editingMealId = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.setupThemeToggle();
        this.renderCurrentScreen();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.switchScreen(screen);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // FAB
        document.getElementById('add-item-fab').addEventListener('click', () => {
            this.openItemModal();
        });

        // Item modal
        document.getElementById('close-item-modal').addEventListener('click', () => {
            this.closeItemModal();
        });

        document.getElementById('item-form').addEventListener('submit', (e) => {
            this.handleItemSubmit(e);
        });

        document.getElementById('delete-item').addEventListener('click', () => {
            this.deleteCurrentItem();
        });

        // Meal modal
        document.getElementById('close-meal-modal').addEventListener('click', () => {
            this.closeMealModal();
        });

        document.getElementById('save-meal').addEventListener('click', () => {
            this.saveMeal();
        });

        // Date tabs
        document.querySelectorAll('.date-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchDay(parseInt(e.target.dataset.date));
            });
        });

        // Shopping list
        document.getElementById('generate-shopping-list').addEventListener('click', () => {
            this.generateShoppingList();
        });

        // Modal backdrop
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    setupThemeToggle() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    switchScreen(screen) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-screen="${screen}"]`).classList.add('active');

        // Update screens
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });
        document.getElementById(`${screen}-screen`).classList.add('active');

        // Update title and FAB
        const titles = {
            inventory: 'Inventory',
            plan: 'Meal Plan',
            shopping: 'Shopping List',
            supplements: 'Supplements'
        };
        document.getElementById('page-title').textContent = titles[screen];

        const fab = document.getElementById('add-item-fab');
        fab.style.display = screen === 'inventory' ? 'block' : 'none';

        this.currentScreen = screen;
        this.renderCurrentScreen();
    }

    renderCurrentScreen() {
        switch (this.currentScreen) {
            case 'inventory':
                this.renderInventory();
                break;
            case 'plan':
                this.renderPlan();
                break;
            case 'shopping':
                this.renderShopping();
                break;
            case 'supplements':
                this.renderSupplements();
                break;
        }
    }

    renderInventory() {
        const items = this.dataStore.getItems();
        const container = document.getElementById('inventory-list');

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No items in your inventory yet.</p>
                    <p>Tap the + button to add your first item!</p>
                </div>
            `;
            return;
        }

        const itemsHtml = items.map(item => {
            const stockClass = item.quantity <= 0 ? 'out-of-stock' : 
                             item.quantity < 10 && item.unit !== 'g' && item.unit !== 'ml' ? 'low-stock' : '';
            
            return `
                <div class="item-row" data-item-id="${item.id}">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-details">
                            <span class="category-badge">${item.category}</span>
                        </div>
                    </div>
                    <div class="item-quantity ${stockClass}">
                        ${item.quantity} ${item.unit}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = itemsHtml;

        // Add click listeners
        container.querySelectorAll('.item-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                this.openItemModal(itemId);
            });
        });
    }

    renderPlan() {
        const plan = this.dataStore.getPlan();
        const currentPlan = plan[this.currentDay];
        
        const mealSlots = document.querySelectorAll('.meal-slot');
        const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
        
        let dayTotal = 0;

        mealSlots.forEach((slot, index) => {
            const mealId = currentPlan.slots[index];
            const mealData = mealId ? this.dataStore.getMeal(mealId) : null;
            const mealContent = slot.querySelector('.meal-content');
            
            if (mealData) {
                slot.classList.add('filled');
                
                const ingredientsList = mealData.ingredients
                    .map(ing => `${ing.quantity}${ing.unit} ${ing.name}`)
                    .join(', ');
                
                const caloriesText = mealData.calories ? `<div class="meal-calories">${mealData.calories} kcal</div>` : '';
                const notesText = mealData.notes ? `<div class="meal-notes">${mealData.notes}</div>` : '';
                
                mealContent.innerHTML = `
                    <div class="meal-details">${mealData.name}</div>
                    <div class="meal-ingredients">${ingredientsList}</div>
                    ${caloriesText}
                    ${notesText}
                `;
                
                if (mealData.calories) {
                    dayTotal += mealData.calories;
                }
            } else {
                slot.classList.remove('filled');
                mealContent.textContent = 'Tap to add meal';
            }
            
            // Add click listener
            slot.onclick = () => this.openMealSlot(this.currentDay, index, mealId);
        });

        // Update daily totals
        document.querySelector('.calorie-total').textContent = `~${dayTotal} kcal`;
    }

    renderShopping() {
        // Will be populated when button is clicked
    }

    renderSupplements() {
        const supplements = this.dataStore.getSupplements();
        const container = document.getElementById('supplements-list');

        const essentialSupps = supplements.filter(s => s.priority === 'essential');
        const optionalSupps = supplements.filter(s => s.priority === 'optional');

        let html = '';

        if (essentialSupps.length > 0) {
            html += '<h4 style="margin-bottom: 0.75rem; color: var(--accent-primary);">Essential</h4>';
            essentialSupps.forEach(supp => {
                html += `
                    <div class="supplement-item">
                        <div class="supplement-info">
                            <h4>${supp.name}</h4>
                            <div class="supplement-reason">${supp.reason}</div>
                        </div>
                        <div class="supplement-dosage">${supp.dosage}</div>
                    </div>
                `;
            });
        }

        if (optionalSupps.length > 0) {
            html += '<h4 style="margin: 1.5rem 0 0.75rem; color: var(--text-secondary);">Optional</h4>';
            optionalSupps.forEach(supp => {
                html += `
                    <div class="supplement-item">
                        <div class="supplement-info">
                            <h4>${supp.name}</h4>
                            <div class="supplement-reason">${supp.reason}</div>
                        </div>
                        <div class="supplement-dosage">${supp.dosage}</div>
                    </div>
                `;
            });
        }

        // Add notes section
        const notes = this.dataStore.data.notes;
        if (notes) {
            html += `
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-light);">
                    <h4 style="margin-bottom: 0.75rem;">📌 Nutritional Notes</h4>
                    ${notes.nutritionalStatus.map(note => `<p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">• ${note}</p>`).join('')}
                </div>
            `;
        }

        container.innerHTML = html;
    }

    switchDay(dayIndex) {
        this.currentDay = dayIndex;
        
        document.querySelectorAll('.date-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-date="${dayIndex}"]`).classList.add('active');
        
        this.renderPlan();
    }

    openItemModal(itemId = null) {
        this.editingItemId = itemId;
        const modal = document.getElementById('item-modal');
        const title = document.getElementById('item-modal-title');
        const deleteBtn = document.getElementById('delete-item');
        
        if (itemId) {
            const item = this.dataStore.getItem(itemId);
            title.textContent = 'Edit Item';
            deleteBtn.style.display = 'block';
            
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-unit').value = item.unit;
            document.getElementById('item-quantity').value = item.quantity;
        } else {
            title.textContent = 'Add Item';
            deleteBtn.style.display = 'none';
            document.getElementById('item-form').reset();
        }
        
        modal.classList.add('show');
    }

    closeItemModal() {
        document.getElementById('item-modal').classList.remove('show');
        this.editingItemId = null;
    }

    handleItemSubmit(e) {
        e.preventDefault();
        
        const itemData = {
            name: document.getElementById('item-name').value.trim(),
            category: document.getElementById('item-category').value,
            unit: document.getElementById('item-unit').value,
            quantity: parseFloat(document.getElementById('item-quantity').value)
        };

        if (this.editingItemId) {
            this.dataStore.updateItem(this.editingItemId, itemData);
        } else {
            this.dataStore.addItem(itemData);
        }

        this.closeItemModal();
        if (this.currentScreen === 'inventory') {
            this.renderInventory();
        }
    }

    deleteCurrentItem() {
        if (this.editingItemId && confirm('Are you sure you want to delete this item?')) {
            this.dataStore.deleteItem(this.editingItemId);
            this.closeItemModal();
            if (this.currentScreen === 'inventory') {
                this.renderInventory();
            }
        }
    }

    openMealSlot(dayIndex, slotIndex, existingMealId = null) {
        this.currentMealSlot = { dayIndex, slotIndex };
        this.editingMealId = existingMealId;
        
        const modal = document.getElementById('meal-modal');
        const title = document.getElementById('meal-modal-title');
        const items = this.dataStore.getItems();
        
        if (items.length === 0) {
            alert('Add some items to your inventory first!');
            return;
        }

        // Set up the modal for editing
        if (existingMealId) {
            const meal = this.dataStore.getMeal(existingMealId);
            title.textContent = 'Edit Meal';
            document.getElementById('meal-name').value = meal.name || '';
            document.getElementById('meal-calories').value = meal.calories || '';
            document.getElementById('meal-notes').value = meal.notes || '';
        } else {
            title.textContent = 'Add Meal';
            document.getElementById('meal-name').value = '';
            document.getElementById('meal-calories').value = '';
            document.getElementById('meal-notes').value = '';
        }

        this.renderMealIngredients();
        modal.classList.add('show');
    }

    renderMealIngredients() {
        const container = document.getElementById('meal-ingredients');
        const items = this.dataStore.getItems();
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No items available in inventory.</p>
                </div>
            `;
            return;
        }

        // Get existing meal data if editing
        let existingIngredients = {};
        if (this.editingMealId) {
            const meal = this.dataStore.getMeal(this.editingMealId);
            if (meal && meal.ingredients) {
                meal.ingredients.forEach(ing => {
                    existingIngredients[ing.itemId] = ing.quantity;
                });
            }
        }

        const itemsHtml = items.map(item => {
            const existingQty = existingIngredients[item.id] || '';
            
            return `
                <div class="ingredient-row">
                    <div class="item-info" style="flex: 1;">
                        <div class="item-name">${item.name}</div>
                        <div class="item-details" style="font-size: 0.75rem;">Available: ${item.quantity} ${item.unit}</div>
                    </div>
                    <input type="number" 
                           class="ingredient-input"
                           placeholder="0"
                           value="${existingQty}"
                           min="0"
                           step="0.1"
                           data-item-id="${item.id}">
                    <span style="font-size: 0.875rem; color: var(--text-secondary); width: 35px;">${item.unit}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = itemsHtml;
    }

    closeMealModal() {
        document.getElementById('meal-modal').classList.remove('show');
        this.currentMealSlot = null;
        this.editingMealId = null;
    }

    saveMeal() {
        if (!this.currentMealSlot) return;

        const inputs = document.querySelectorAll('#meal-ingredients input[data-item-id]');
        const ingredients = [];

        inputs.forEach(input => {
            const quantity = parseFloat(input.value) || 0;
            if (quantity > 0) {
                const itemId = input.dataset.itemId;
                const item = this.dataStore.getItem(itemId);
                ingredients.push({
                    itemId,
                    name: item.name,
                    quantity,
                    unit: item.unit
                });
            }
        });

        if (ingredients.length === 0) {
            alert('Please add at least one ingredient to create a meal.');
            return;
        }

        const mealName = document.getElementById('meal-name').value.trim();
        const calories = parseInt(document.getElementById('meal-calories').value) || null;
        const notes = document.getElementById('meal-notes').value.trim();

        const mealData = {
            name: mealName || ingredients.map(ing => ing.name).slice(0, 3).join(', '),
            ingredients,
            calories,
            notes
        };

        let mealId;
        if (this.editingMealId) {
            // Update existing meal
            this.dataStore.updateMeal(this.editingMealId, mealData);
            mealId = this.editingMealId;
        } else {
            // Create new meal
            const newMeal = this.dataStore.addMeal(mealData);
            mealId = newMeal.id;
        }

        // Save to plan
        this.dataStore.setPlanSlot(
            this.currentMealSlot.dayIndex, 
            this.currentMealSlot.slotIndex, 
            mealId
        );

        this.closeMealModal();
        this.renderPlan();
        
        this.showToast(`Meal saved successfully!`);
    }

    generateShoppingList() {
        const plan = this.dataStore.getPlan();
        const items = this.dataStore.getItems();
        const shoppingList = new Map();

        // Calculate needed quantities from meal plan
        plan.forEach(day => {
            day.slots.forEach(mealId => {
                const meal = this.dataStore.getMeal(mealId);
                if (meal && meal.ingredients) {
                    meal.ingredients.forEach(ing => {
                        const item = this.dataStore.getItem(ing.itemId);
                        if (item) {
                            const key = `${item.id}`;
                            const current = shoppingList.get(key) || {
                                name: item.name,
                                category: item.category,
                                unit: item.unit,
                                needed: 0,
                                current: item.quantity
                            };
                            current.needed += ing.quantity;
                            shoppingList.set(key, current);
                        }
                    });
                }
            });
        });

        // Calculate what needs to be bought
        const toBuy = [];
        shoppingList.forEach(item => {
            const deficit = item.needed - item.current;
            if (deficit > 0) {
                toBuy.push({
                    ...item,
                    buyQuantity: Math.ceil(deficit * 10) / 10 // Round to 1 decimal
                });
            }
        });

        this.renderShoppingList(toBuy);
    }

    renderShoppingList(shoppingItems) {
        const container = document.getElementById('shopping-list');

        if (shoppingItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>🎉 You have everything you need!</p>
                    <p>Your current inventory covers all planned meals.</p>
                </div>
            `;
            return;
        }

        // Group by category
        const grouped = {};
        shoppingItems.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });

        let html = '';
        Object.keys(grouped).forEach(category => {
            html += `
                <div class="card">
                    <h3 style="margin-bottom: 1rem; text-transform: capitalize; color: var(--accent-primary);">${category}</h3>
                    ${grouped[category].map(item => `
                        <div class="shopping-item">
                            <input type="checkbox" class="shopping-checkbox" data-item="${item.name}">
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">Need: ${item.buyQuantity} ${item.unit} (have ${item.current} ${item.unit})</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        html += `
            <div class="card">
                <button class="btn" id="mark-purchased">Update Inventory from Purchases</button>
            </div>
        `;

        container.innerHTML = html;

        // Add event listeners for checkboxes
        container.querySelectorAll('.shopping-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const item = e.target.closest('.shopping-item');
                if (e.target.checked) {
                    item.classList.add('checked');
                } else {
                    item.classList.remove('checked');
                }
            });
        });

        // Add listener for update inventory button
        const updateBtn = document.getElementById('mark-purchased');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                this.updateInventoryFromPurchases(shoppingItems);
            });
        }
    }

    updateInventoryFromPurchases(shoppingItems) {
        const checkedItems = document.querySelectorAll('.shopping-checkbox:checked');
        let updatedCount = 0;

        checkedItems.forEach(checkbox => {
            const itemName = checkbox.dataset.item;
            const shoppingItem = shoppingItems.find(item => item.name === itemName);
            
            if (shoppingItem) {
                const inventoryItem = this.dataStore.getItems().find(item => item.name === itemName);
                if (inventoryItem) {
                    const newQuantity = inventoryItem.quantity + shoppingItem.buyQuantity;
                    this.dataStore.updateItem(inventoryItem.id, { quantity: newQuantity });
                    updatedCount++;
                }
            }
        });

        if (updatedCount > 0) {
            this.showToast(`Updated ${updatedCount} items in inventory!`);
            this.generateShoppingList(); // Refresh the list
        } else {
            this.showToast('No items were marked as purchased.');
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-primary);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1001;
            font-weight: 500;
            box-shadow: 0 4px 12px var(--shadow);
            animation: slideDown 0.3s ease;
            max-width: 80%;
            text-align: center;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mealPlannerApp = new MealPlannerApp();
});