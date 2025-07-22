// Enhanced app.js - Learning from the original's simplicity and effectiveness

class MealPlannerApp {
    constructor() {
        // Load the default data from sldata.js if available, otherwise start fresh
        this.data = window.DEFAULT_DATA ? { ...DEFAULT_DATA } : {
            items: [],
            meals: [],
            plan: this.initializePlan()
        };
        
        this.currentScreen = 'inventory';
        this.currentDay = 0;
        this.editingItem = null;
        this.currentMealSlot = null;
        this.selectedIngredients = new Map(); // For building meals
        
        this.loadSavedData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupThemeToggle();
        this.renderCurrentScreen();
    }

    initializePlan() {
        const plan = [];
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            plan.push({
                date: date.toISOString().split('T'),
                slots: [null, null, null, null] // breakfast, lunch, dinner, snack
            });
        }
        return plan;
    }

    loadSavedData() {
        const saved = localStorage.getItem('mealPlannerData');
        if (saved) {
            try {
                const savedData = JSON.parse(saved);
                // Merge saved data with default data, preserving user changes
                this.data = {
                    items: savedData.items || this.data.items,
                    meals: savedData.meals || this.data.meals,
                    plan: savedData.plan || this.data.plan || this.initializePlan()
                };
            } catch (e) {
                console.error('Failed to load saved data, using defaults');
            }
        }
    }

    saveData() {
        localStorage.setItem('mealPlannerData', JSON.stringify(this.data));
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
                this.switchDay(parseInt(e.target.dataset.date));
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

        // Shopping list
        document.getElementById('generate-shopping-list').addEventListener('click', () => {
            this.generateShoppingList();
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
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

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Screen management
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
            shopping: 'Shopping List'
        };
        document.getElementById('page-title').textContent = titles[screen] || 'Meal & Stock Planner';

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
                break; // Shopping is rendered on demand
        }
    }

    switchDay(dayIndex) {
        this.currentDay = dayIndex;
        
        document.querySelectorAll('.date-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-date="${dayIndex}"]`).classList.add('active');
        
        this.renderPlan();
    }

    // Inventory management
    renderInventory() {
        const container = document.getElementById('inventory-list');
        
        if (this.data.items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No items in your inventory yet.</p>
                    <p>Tap the + button to add your first item!</p>
                </div>
            `;
            return;
        }

        // Group by category
        const grouped = this.groupItemsByCategory();
        let html = '';

        Object.keys(grouped).forEach(category => {
            html += `<div style="margin-bottom: 1.5rem;">
                <h3 style="color: var(--accent-primary); margin-bottom: 0.5rem; text-transform: capitalize;">${category}</h3>
            `;
            
            grouped[category].forEach(item => {
                const stockClass = item.quantity <= 0 ? 'out-of-stock' : 
                                 item.quantity < 10 ? 'low-stock' : '';
                
                html += `
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
            });
            
            html += '</div>';
        });

        container.innerHTML = html;

        // Add click listeners
        container.querySelectorAll('.item-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                this.openItemModal(itemId);
            });
        });
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

    // Plan management
    renderPlan() {
        const mealSlots = document.querySelectorAll('.meal-slot');
        const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
        
        // Check if we have predefined meals from sldata.js for this day
        const dayPrefix = `day${this.currentDay + 1}`;
        
        mealSlots.forEach((slot, index) => {
            const mealType = mealNames[index].toLowerCase();
            const mealId = `${dayPrefix}-${mealType}`;
            
            // Look for predefined meal first, then user-created meal
            let mealData = this.data.meals.find(m => m.id === mealId);
            if (!mealData && this.data.plan && this.data.plan[this.currentDay]) {
                mealData = this.data.plan[this.currentDay].slots[index];
            }
            
            const mealContent = slot.querySelector('.meal-content');
            
            if (mealData) {
                slot.classList.add('filled');
                let contentHtml = `<div class="meal-card">
                    <h4 style="margin-bottom: 0.5rem;">${mealData.name}</h4>
                `;
                
                if (mealData.calories) {
                    contentHtml += `<span style="color: var(--accent-primary); font-weight: bold;">${mealData.calories} kcal</span>`;
                }
                
                if (mealData.notes) {
                    contentHtml += `<p style="color: var(--text-secondary); margin: 0.25rem 0; font-size: 0.875rem;">${mealData.notes}</p>`;
                }
                
                if (mealData.ingredients && mealData.ingredients.length > 0) {
                    contentHtml += '<div style="margin-top: 0.5rem;">';
                    mealData.ingredients.slice(0, 3).forEach(ing => {
                        contentHtml += `<span class="category-badge" style="margin-right: 0.25rem; margin-bottom: 0.25rem; display: inline-block;">${ing.quantity}${ing.unit} ${ing.name}</span>`;
                    });
                    if (mealData.ingredients.length > 3) {
                        contentHtml += `<span class="category-badge">+${mealData.ingredients.length - 3} more</span>`;
                    }
                    contentHtml += '</div>';
                }
                
                contentHtml += '</div>';
                mealContent.innerHTML = contentHtml;
            } else {
                slot.classList.remove('filled');
                mealContent.innerHTML = 'Tap to add meal';
            }
            
            // Add click listener
            slot.onclick = () => this.openMealSlot(this.currentDay, index);
        });

        // Update daily totals
        this.updateDailyTotals();
    }

    updateDailyTotals() {
        const dayPrefix = `day${this.currentDay + 1}`;
        let totalCalories = 0;
        
        // Count calories from predefined meals
        this.data.meals.forEach(meal => {
            if (meal.id.startsWith(dayPrefix) && meal.calories) {
                totalCalories += meal.calories;
            }
        });
        
        // Add calories from user-created meals
        if (this.data.plan && this.data.plan[this.currentDay]) {
            this.data.plan[this.currentDay].slots.forEach(meal => {
                if (meal && meal.calories && !meal.id.startsWith(dayPrefix)) {
                    totalCalories += meal.calories;
                }
            });
        }
        
        // Update display if element exists
        const totalElement = document.querySelector('.calorie-total');
        if (totalElement) {
            totalElement.textContent = `~${totalCalories} kcal`;
        }
    }

    // Item modal management
    openItemModal(itemId = null) {
        this.editingItem = itemId ? this.data.items.find(item => item.id === itemId) : null;
        const modal = document.getElementById('item-modal');
        const title = document.getElementById('item-modal-title');
        const deleteBtn = document.getElementById('delete-item');
        
        if (this.editingItem) {
            title.textContent = 'Edit Item';
            deleteBtn.style.display = 'block';
            
            document.getElementById('item-name').value = this.editingItem.name;
            document.getElementById('item-category').value = this.editingItem.category;
            document.getElementById('item-unit').value = this.editingItem.unit;
            document.getElementById('item-quantity').value = this.editingItem.quantity;
        } else {
            title.textContent = 'Add Item';
            deleteBtn.style.display = 'none';
            document.getElementById('item-form').reset();
        }
        
        modal.style.display = 'flex';
    }

    closeItemModal() {
        document.getElementById('item-modal').style.display = 'none';
        this.editingItem = null;
    }

    handleItemSubmit(e) {
        e.preventDefault();
        
        const itemData = {
            name: document.getElementById('item-name').value.trim(),
            category: document.getElementById('item-category').value,
            unit: document.getElementById('item-unit').value,
            quantity: parseFloat(document.getElementById('item-quantity').value)
        };

        if (this.editingItem) {
            // Update existing item
            const index = this.data.items.findIndex(item => item.id === this.editingItem.id);
            if (index !== -1) {
                this.data.items[index] = { ...this.editingItem, ...itemData };
            }
        } else {
            // Add new item
            itemData.id = this.generateId();
            this.data.items.push(itemData);
        }

        this.saveData();
        this.closeItemModal();
        if (this.currentScreen === 'inventory') {
            this.renderInventory();
        }
    }

    deleteCurrentItem() {
        if (this.editingItem && confirm('Are you sure you want to delete this item?')) {
            this.data.items = this.data.items.filter(item => item.id !== this.editingItem.id);
            this.saveData();
            this.closeItemModal();
            if (this.currentScreen === 'inventory') {
                this.renderInventory();
            }
        }
    }

    // Meal management
    openMealSlot(dayIndex, slotIndex) {
        this.currentMealSlot = { dayIndex, slotIndex };
        this.selectedIngredients.clear();
        
        if (this.data.items.length === 0) {
            this.showToast('Add some items to your inventory first!');
            return;
        }

        this.renderMealModal();
        document.getElementById('meal-modal').style.display = 'flex';
    }

    renderMealModal() {
        const container = document.getElementById('meal-ingredients');
        
        let html = `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 0.5rem;">Select Ingredients:</h4>
                <div id="ingredient-list">
        `;
        
        this.data.items.forEach(item => {
            const isSelected = this.selectedIngredients.has(item.id);
            const selectedQuantity = isSelected ? this.selectedIngredients.get(item.id) : 0;
            
            html += `
                <div class="item-row" style="margin-bottom: 0.5rem; ${isSelected ? 'background: var(--bg-tertiary);' : ''}">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-details">Available: ${item.quantity} ${item.unit}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="number" 
                            class="form-input ingredient-quantity" 
                            style="width: 80px; padding: 0.5rem;"
                            placeholder="0"
                            value="${selectedQuantity || ''}"
                            min="0"
                            max="${item.quantity}"
                            step="0.1"
                            data-item-id="${item.id}"
                            data-item-name="${item.name}"
                            data-item-unit="${item.unit}">
                        <span style="font-size: 0.875rem; color: var(--text-secondary);">${item.unit}</span>
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
        
        // Selected ingredients preview
        if (this.selectedIngredients.size > 0) {
            html += `
                <div style="margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">Selected Ingredients:</h4>
                    <div>
            `;
            this.selectedIngredients.forEach((quantity, itemId) => {
                const item = this.data.items.find(i => i.id === itemId);
                if (item && quantity > 0) {
                    html += `<span class="category-badge" style="margin-right: 0.25rem; margin-bottom: 0.25rem;">${quantity}${item.unit} ${item.name}</span>`;
                }
            });
            html += `</div></div>`;
        }
        
        container.innerHTML = html;
        
        // Add input listeners
        container.querySelectorAll('.ingredient-quantity').forEach(input => {
            input.addEventListener('input', (e) => {
                const itemId = e.target.dataset.itemId;
                const quantity = parseFloat(e.target.value) || 0;
                
                if (quantity > 0) {
                    this.selectedIngredients.set(itemId, quantity);
                } else {
                    this.selectedIngredients.delete(itemId);
                }
                
                this.renderMealModal(); // Re-render to show selection
            });
        });
    }

    closeMealModal() {
        document.getElementById('meal-modal').style.display = 'none';
        this.currentMealSlot = null;
        this.selectedIngredients.clear();
    }

    saveMeal() {
        if (!this.currentMealSlot || this.selectedIngredients.size === 0) {
            this.showToast('Please add at least one ingredient to create a meal.');
            return;
        }

        const ingredients = [];
        let mealName = '';
        let estimatedCalories = 0;

        // Build ingredients array and estimate calories
        this.selectedIngredients.forEach((quantity, itemId) => {
            const item = this.data.items.find(i => i.id === itemId);
            if (item && quantity > 0) {
                ingredients.push({
                    itemId,
                    name: item.name,
                    quantity,
                    unit: item.unit
                });
                
                // Simple calorie estimation
                const calorieEstimates = {
                    'beef-steak': 2.5, 'eggs': 70, 'milk': 0.6, 'sardines': 2,
                    'butter': 7, 'greek-yogurt': 1, 'white-rice': 3.5,
                    'porridge-oats': 3.8, 'honey': 3, 'satsumas': 35, 'banana': 90
                };
                const caloriePerUnit = calorieEstimates[itemId] || 2;
                estimatedCalories += quantity * caloriePerUnit;
            }
        });

        // Create meal name from ingredients
        mealName = ingredients.map(ing => ing.name).slice(0, 2).join(' & ');
        if (ingredients.length > 2) {
            mealName += ` + ${ingredients.length - 2} more`;
        }

        const mealData = {
            id: this.generateId(),
            name: mealName,
            ingredients,
            calories: Math.round(estimatedCalories)
        };

        // Initialize plan if needed
        if (!this.data.plan) {
            this.data.plan = this.initializePlan();
        }

        // Save to plan
        this.data.plan[this.currentMealSlot.dayIndex].slots[this.currentMealSlot.slotIndex] = mealData;

        // Update inventory quantities
        ingredients.forEach(ing => {
            const itemIndex = this.data.items.findIndex(item => item.id === ing.itemId);
            if (itemIndex !== -1) {
                this.data.items[itemIndex].quantity = Math.max(0, this.data.items[itemIndex].quantity - ing.quantity);
            }
        });

        this.saveData();
        this.closeMealModal();
        this.renderPlan();
        this.showToast(`${mealName} added to your meal plan!`);
    }

    // Shopping list
    generateShoppingList() {
        const needed = this.calculateNeededItems();
        const container = document.getElementById('shopping-list');
        
        if (Object.keys(needed).length === 0) {
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
        Object.entries(needed).forEach(([itemId, amount]) => {
            const item = this.data.items.find(i => i.id === itemId);
            if (item) {
                if (!grouped[item.category]) {
                    grouped[item.category] = [];
                }
                grouped[item.category].push({
                    name: item.name,
                    amount: Math.ceil(amount),
                    unit: item.unit
                });
            }
        });

        let html = '';
        Object.keys(grouped).forEach(category => {
            html += `
                <div class="card">
                    <h3 style="margin-bottom: 1rem; text-transform: capitalize; color: var(--accent-primary);">${category}</h3>
                    ${grouped[category].map(item => `
                        <div class="shopping-item">
                            <input type="checkbox" class="shopping-checkbox">
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">Need: ${item.amount} ${item.unit}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        container.innerHTML = html;

        // Add checkbox listeners
        container.querySelectorAll('.shopping-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const item = e.target.closest('.shopping-item');
                item.classList.toggle('checked', e.target.checked);
            });
        });
    }

    calculateNeededItems() {
        const needed = {};
        const totalNeeded = {};
        
        // Calculate from predefined meals
        this.data.meals.forEach(meal => {
            if (meal.ingredients) {
                meal.ingredients.forEach(ingredient => {
                    if (!totalNeeded[ingredient.itemId]) {
                        totalNeeded[ingredient.itemId] = 0;
                    }
                    totalNeeded[ingredient.itemId] += ingredient.quantity;
                });
            }
        });

        // Calculate from user-created meals in plan
        if (this.data.plan) {
            this.data.plan.forEach(day => {
                if (day.slots) {
                    day.slots.forEach(meal => {
                        if (meal && meal.ingredients) {
                            meal.ingredients.forEach(ingredient => {
                                if (!totalNeeded[ingredient.itemId]) {
                                    totalNeeded[ingredient.itemId] = 0;
                                }
                                totalNeeded[ingredient.itemId] += ingredient.quantity;
                            });
                        }
                    });
                }
            });
        }

        // Compare with current inventory
        Object.entries(totalNeeded).forEach(([itemId, neededAmount]) => {
            const item = this.data.items.find(i => i.id === itemId);
            if (item && item.quantity < neededAmount) {
                needed[itemId] = neededAmount - item.quantity;
            }
        });

        return needed;
    }

    // Utility functions
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
    // Add toast animation styles
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    window.app = new MealPlannerApp();
});
