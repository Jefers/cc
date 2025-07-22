// app.js - Meal & Stock Planner

class MealPlannerApp {
    constructor() {
        this.data = { ...DEFAULT_DATA };
        this.currentScreen = 'inventory';
        this.currentPlanDay = 0;
        this.editingItem = null;
        this.editingMeal = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.renderInventory();
        this.renderPlan();
        this.renderSupplements();
        this.updateActiveScreen();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.switchScreen(screen);
            });
        });

        // Date tabs
        document.querySelectorAll('.date-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const day = parseInt(e.target.dataset.date);
                this.switchPlanDay(day);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // FAB - Add item
        document.getElementById('add-item-fab').addEventListener('click', () => {
            this.openItemModal();
        });

        // Item modal
        document.getElementById('close-item-modal').addEventListener('click', () => {
            this.closeItemModal();
        });

        document.getElementById('item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem();
        });

        document.getElementById('delete-item').addEventListener('click', () => {
            this.deleteItem();
        });

        // Meal modal
        document.getElementById('close-meal-modal').addEventListener('click', () => {
            this.closeMealModal();
        });

        document.getElementById('save-meal').addEventListener('click', () => {
            this.saveMeal();
        });

        // Shopping list
        document.getElementById('generate-shopping-list').addEventListener('click', () => {
            this.generateShoppingList();
        });

        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    switchScreen(screen) {
        this.currentScreen = screen;
        this.updateActiveScreen();
        
        // Update nav highlighting
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-screen="${screen}"]`).classList.add('active');
    }

    updateActiveScreen() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${this.currentScreen}-screen`).classList.add('active');
    }

    switchPlanDay(day) {
        this.currentPlanDay = day;
        
        // Update tab highlighting
        document.querySelectorAll('.date-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-date="${day}"]`).classList.add('active');
        
        this.renderPlan();
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        this.saveData();
    }

    // Data management
    loadData() {
        const saved = localStorage.getItem('mealPlannerData');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load saved data, using defaults');
            }
        }
        
        const theme = localStorage.getItem('mealPlannerTheme');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    saveData() {
        localStorage.setItem('mealPlannerData', JSON.stringify(this.data));
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('mealPlannerTheme', isDark ? 'dark' : 'light');
    }

    // Inventory rendering
    renderInventory() {
        const container = document.getElementById('inventory-list');
        
        if (this.data.items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No items in inventory</p>
                    <p>Add items using the + button below</p>
                </div>
            `;
            return;
        }

        const grouped = this.groupItemsByCategory();
        let html = '';

        Object.keys(grouped).forEach(category => {
            html += `<div class="category-section">
                <h3 class="category-title">${this.formatCategoryName(category)}</h3>
            `;
            
            grouped[category].forEach(item => {
                const lowStock = item.quantity < 50; // Simple low stock indicator
                html += `
                    <div class="item-card ${lowStock ? 'low-stock' : ''}" onclick="app.editItem('${item.id}')">
                        <div class="item-info">
                            <h4 class="item-name">${item.name}</h4>
                            <span class="item-quantity">${item.quantity} ${item.unit}</span>
                        </div>
                        ${lowStock ? '<div class="low-stock-indicator">!</div>' : ''}
                    </div>
                `;
            });
            
            html += '</div>';
        });

        container.innerHTML = html;
    }

    groupItemsByCategory() {
        const grouped = {};
        this.data.items.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        return grouped;
    }

    formatCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Plan rendering
    renderPlan() {
        const dayMeals = this.getMealsForDay(this.currentPlanDay);
        const mealSlots = ['breakfast', 'lunch', 'dinner', 'snack'];
        
        document.querySelectorAll('.meal-slot').forEach((slot, index) => {
            const meal = dayMeals[index];
            const content = slot.querySelector('.meal-content');
            
            if (meal) {
                content.innerHTML = `
                    <div class="meal-card" onclick="app.editMeal('${meal.id}')">
                        <h4 class="meal-name">${meal.name}</h4>
                        <span class="meal-calories">${meal.calories} kcal</span>
                        ${meal.notes ? `<p class="meal-notes">${meal.notes}</p>` : ''}
                        <div class="meal-ingredients">
                            ${meal.ingredients.map(ing => 
                                `<span class="ingredient-tag">${ing.quantity}${ing.unit} ${ing.name}</span>`
                            ).join('')}
                        </div>
                    </div>
                `;
            } else {
                content.innerHTML = `
                    <div class="empty-meal" onclick="app.addMeal(${this.currentPlanDay}, ${index})">
                        <p>+ Add ${mealSlots[index]}</p>
                    </div>
                `;
            }
        });

        this.updateDailyTotals(dayMeals);
    }

    getMealsForDay(day) {
        const dayPrefix = `day${day + 1}`;
        const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
        
        return mealOrder.map(mealType => {
            return this.data.meals.find(meal => 
                meal.id.startsWith(dayPrefix) && meal.id.includes(mealType)
            );
        });
    }

    updateDailyTotals(meals) {
        const totalCalories = meals.reduce((sum, meal) => {
            return sum + (meal ? meal.calories : 0);
        }, 0);
        
        document.querySelector('.calorie-total').textContent = `~${totalCalories} kcal`;
    }

    // Shopping list
    generateShoppingList() {
        const needed = this.calculateNeededItems();
        const container = document.getElementById('shopping-list');
        
        if (Object.keys(needed).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>You have everything you need!</p>
                </div>
            `;
            return;
        }

        let html = '<div class="card"><h3>Shopping List</h3>';
        
        Object.entries(needed).forEach(([itemId, amount]) => {
            const item = this.data.items.find(i => i.id === itemId);
            if (item) {
                html += `
                    <div class="shopping-item">
                        <span class="shopping-item-name">${item.name}</span>
                        <span class="shopping-item-amount">${amount} ${item.unit}</span>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    calculateNeededItems() {
        const needed = {};
        const totalNeeded = {};
        
        // Calculate total needed for all meals
        this.data.meals.forEach(meal => {
            meal.ingredients.forEach(ingredient => {
                if (!totalNeeded[ingredient.itemId]) {
                    totalNeeded[ingredient.itemId] = 0;
                }
                totalNeeded[ingredient.itemId] += ingredient.quantity;
            });
        });

        // Compare with current inventory
        Object.entries(totalNeeded).forEach(([itemId, neededAmount]) => {
            const item = this.data.items.find(i => i.id === itemId);
            if (item && item.quantity < neededAmount) {
                needed[itemId] = Math.ceil(neededAmount - item.quantity);
            }
        });

        return needed;
    }

    // Supplements
    renderSupplements() {
        const supplements = [
            { name: 'Multivitamin', description: 'General vitamin and mineral support' },
            { name: 'Vitamin D3', description: 'Bone health and immune function' },
            { name: 'Omega-3', description: 'Heart and brain health' },
            { name: 'Magnesium', description: 'Muscle function and sleep' },
            { name: 'Vitamin C', description: 'Immune support (missing fresh produce)' },
            { name: 'B-Complex', description: 'Energy metabolism' }
        ];

        const container = document.getElementById('supplements-list');
        let html = '';

        supplements.forEach(supplement => {
            html += `
                <div class="supplement-item">
                    <strong>${supplement.name}</strong>
                    <p>${supplement.description}</p>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Item management
    openItemModal(item = null) {
        this.editingItem = item;
        const modal = document.getElementById('item-modal');
        const title = document.getElementById('item-modal-title');
        const deleteBtn = document.getElementById('delete-item');
        
        if (item) {
            title.textContent = 'Edit Item';
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-unit').value = item.unit;
            document.getElementById('item-quantity').value = item.quantity;
            deleteBtn.style.display = 'block';
        } else {
            title.textContent = 'Add Item';
            document.getElementById('item-form').reset();
            deleteBtn.style.display = 'none';
        }
        
        modal.style.display = 'flex';
    }

    closeItemModal() {
        document.getElementById('item-modal').style.display = 'none';
        this.editingItem = null;
    }

    saveItem() {
        const name = document.getElementById('item-name').value;
        const category = document.getElementById('item-category').value;
        const unit = document.getElementById('item-unit').value;
        const quantity = parseFloat(document.getElementById('item-quantity').value);

        if (this.editingItem) {
            // Update existing item
            const index = this.data.items.findIndex(i => i.id === this.editingItem.id);
            if (index !== -1) {
                this.data.items[index] = {
                    ...this.editingItem,
                    name,
                    category,
                    unit,
                    quantity
                };
            }
        } else {
            // Add new item
            const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            this.data.items.push({
                id,
                name,
                category,
                unit,
                quantity
            });
        }

        this.saveData();
        this.renderInventory();
        this.closeItemModal();
    }

    deleteItem() {
        if (this.editingItem && confirm('Delete this item?')) {
            this.data.items = this.data.items.filter(i => i.id !== this.editingItem.id);
            this.saveData();
            this.renderInventory();
            this.closeItemModal();
        }
    }

    editItem(itemId) {
        const item = this.data.items.find(i => i.id === itemId);
        if (item) {
            this.openItemModal(item);
        }
    }

    // Meal management
    editMeal(mealId) {
        const meal = this.data.meals.find(m => m.id === mealId);
        if (meal) {
            this.openMealModal(meal);
        }
    }

    addMeal(day, slot) {
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        const mealType = mealTypes[slot];
        const newMeal = {
            id: `day${day + 1}-${mealType}`,
            name: `New ${mealType}`,
            calories: 0,
            ingredients: []
        };
        this.openMealModal(newMeal, true);
    }

    openMealModal(meal, isNew = false) {
        this.editingMeal = { ...meal, isNew };
        const modal = document.getElementById('meal-modal');
        
        document.getElementById('meal-name').value = meal.name || '';
        document.getElementById('meal-calories').value = meal.calories || '';
        document.getElementById('meal-notes').value = meal.notes || '';
        
        this.renderMealIngredients();
        modal.style.display = 'flex';
    }

    closeMealModal() {
        document.getElementById('meal-modal').style.display = 'none';
        this.editingMeal = null;
    }

    renderMealIngredients() {
        // Simplified ingredient management for now
        const container = document.getElementById('meal-ingredients');
        const ingredients = this.editingMeal.ingredients || [];
        
        if (ingredients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No ingredients added yet.</p>
                    <p>Feature to add ingredients coming soon!</p>
                </div>
            `;
        } else {
            let html = '';
            ingredients.forEach(ingredient => {
                html += `
                    <div class="ingredient-row">
                        <span>${ingredient.name}</span>
                        <span>${ingredient.quantity} ${ingredient.unit}</span>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
    }

    saveMeal() {
        const name = document.getElementById('meal-name').value;
        const calories = parseInt(document.getElementById('meal-calories').value) || 0;
        const notes = document.getElementById('meal-notes').value;

        this.editingMeal.name = name;
        this.editingMeal.calories = calories;
        if (notes) this.editingMeal.notes = notes;

        if (this.editingMeal.isNew) {
            this.data.meals.push(this.editingMeal);
        } else {
            const index = this.data.meals.findIndex(m => m.id === this.editingMeal.id);
            if (index !== -1) {
                this.data.meals[index] = this.editingMeal;
            }
        }

        this.saveData();
        this.renderPlan();
        this.closeMealModal();
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MealPlannerApp();
});
