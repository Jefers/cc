// ---------- Helper: Pack sizes (in purchase units) ----------
const PACK_SIZES = {
    "chicken-thigh": 4,
    "beef-mince": 400,
    "ribeye-steak": 250,
    "eggs": 12,
    "cooked-ham": 150,
    "sardines": 1,
    "whey-protein": 900,
    "creatine": 500,
    "golden-cow-butter": 250,
    "double-cream": 300,
    "mature-cheddar": 200,
    "french-brie": 190,
    "greek-yogurt": 950,
    "pork-scratchings": 80,
    "sauerkraut": 500,
    "psyllium-husk": 200,
    "apple-cider-vinegar": 500,
    "dark-chocolate-85": 100,
    "instant-coffee": 100,
    "tea-bags": 40,
    "pink-salt": 250,
    "pomegranate-concentrate": 500
};

function roundToPackSize(itemId, neededQty) {
    const pack = PACK_SIZES[itemId];
    if (!pack) return neededQty;
    if (neededQty <= 0) return 0;
    return Math.ceil(neededQty / pack) * pack;
}

// ---------- Helper: Weekday (starting Sunday) ----------
function weekdayToNumber(weekdayStr) {
    // Sun=0, Mon=1, ..., Sat=6
    const map = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    return map[weekdayStr];
}

function getTodayWeekdayNumber() {
    // JS getDay(): 0=Sun,1=Mon,...6=Sat -> perfect
    return new Date().getDay();
}

// ---------- Data Storage ----------
class DataStore {
    constructor() {
        this.data = this.loadData();
        if (!this.data.consumedMeals) this.data.consumedMeals = [];
        // Ensure all items have portionAmount
        this.data.items.forEach(item => {
            if (item.portionAmount === undefined) item.portionAmount = 1;
        });
        this.saveData();
    }
    loadData() {
        const stored = localStorage.getItem('mealPlannerDatak3');
        if (stored) return JSON.parse(stored);
        if (typeof DEFAULT_DATA !== 'undefined') {
            const defaultData = JSON.parse(JSON.stringify(DEFAULT_DATA));
            defaultData.consumedMeals = [];
            return defaultData;
        }
        return { items: [], meals: [], plan: [], supplements: [], notes: {}, consumedMeals: [] };
    }
    saveData() { localStorage.setItem('mealPlannerDatak3', JSON.stringify(this.data)); }
    generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
    addItem(item) {
        if (!item.portionAmount) item.portionAmount = 1;
        item.id = this.generateId();
        this.data.items.push(item);
        this.saveData();
        return item;
    }
    updateItem(id, updates) {
        const idx = this.data.items.findIndex(i => i.id === id);
        if (idx !== -1) {
            this.data.items[idx] = { ...this.data.items[idx], ...updates };
            this.saveData();
            return this.data.items[idx];
        }
        return null;
    }
    deleteItem(id) { this.data.items = this.data.items.filter(i => i.id !== id); this.saveData(); }
    getItems() { return this.data.items; }
    getItem(id) { return this.data.items.find(i => i.id === id); }
    getMeal(id) { return this.data.meals.find(m => m.id === id); }
    updateMeal(id, updates) {
        const idx = this.data.meals.findIndex(m => m.id === id);
        if (idx !== -1) { this.data.meals[idx] = { ...this.data.meals[idx], ...updates }; this.saveData(); return this.data.meals[idx]; }
        return null;
    }
    addMeal(meal) { meal.id = this.generateId(); this.data.meals.push(meal); this.saveData(); return meal; }
    setPlanSlot(dayIdx, slotIdx, mealId) {
        if (this.data.plan[dayIdx]) { this.data.plan[dayIdx].slots[slotIdx] = mealId; this.saveData(); }
    }
    getPlan() { return this.data.plan; }
    getSupplements() { return this.data.supplements || []; }
    getNotes() { return this.data.notes || {}; }

    isMealConsumed(dayIdx, slotIdx) {
        return this.data.consumedMeals.includes(`${dayIdx}-${slotIdx}`);
    }
    markMealConsumed(dayIdx, slotIdx) {
        const key = `${dayIdx}-${slotIdx}`;
        if (!this.data.consumedMeals.includes(key)) {
            this.data.consumedMeals.push(key);
            this.saveData();
            return true;
        }
        return false;
    }
    unmarkMealConsumed(dayIdx, slotIdx) {
        const key = `${dayIdx}-${slotIdx}`;
        this.data.consumedMeals = this.data.consumedMeals.filter(k => k !== key);
        this.saveData();
    }
    resetAllConsumed() {
        this.data.consumedMeals = [];
        this.saveData();
    }

    // Ad‑hoc consumption: reduce quantity by one portion (if enough)
    consumePortion(itemId) {
        const item = this.getItem(itemId);
        if (!item) return false;
        const portion = item.portionAmount || 1;
        if (item.quantity < portion) return false;
        this.updateItem(itemId, { quantity: item.quantity - portion });
        return true;
    }
}

// ---------- App Controller ----------
class MealPlannerApp {
    constructor() {
        this.dataStore = new DataStore();
        this.currentScreen = 'inventory';
        this.currentDay = this.getTodayPlanIndex();
        this.editingItemId = null;
        this.currentMealSlot = null;
        this.editingMealId = null;
        this.initializeApp();
    }

    getTodayPlanIndex() {
        const plan = this.dataStore.getPlan();
        if (!plan.length) return 0;
        const todayWeekdayNum = getTodayWeekdayNumber(); // 0=Sun
        for (let i = 0; i < plan.length; i++) {
            const planDate = new Date(plan[i].date);
            const planWeekdayNum = weekdayToNumber(planDate.toLocaleDateString(undefined, { weekday: 'short' }));
            if (planWeekdayNum === todayWeekdayNum) return i;
        }
        return 0;
    }

    initializeApp() {
        this.setupEventListeners();
        this.setupThemeToggle();
        this.renderCurrentScreen();
        this.generateDateTabs();
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchScreen(e.currentTarget.dataset.screen));
        });
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('add-item-fab').addEventListener('click', () => this.openItemModal());
        document.getElementById('close-item-modal').addEventListener('click', () => this.closeItemModal());
        document.getElementById('item-form').addEventListener('submit', (e) => this.handleItemSubmit(e));
        document.getElementById('delete-item').addEventListener('click', () => this.deleteCurrentItem());
        document.getElementById('close-meal-modal').addEventListener('click', () => this.closeMealModal());
        document.getElementById('save-meal').addEventListener('click', () => this.saveMeal());
        document.getElementById('generate-shopping-list').addEventListener('click', () => this.generateShoppingList());
        document.getElementById('reset-consumed-btn').addEventListener('click', () => this.resetAllConsumedMeals());
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
        });
    }

    setupThemeToggle() {
        const saved = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
    }
    toggleTheme() {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    }

    generateDateTabs() {
        const plan = this.dataStore.getPlan();
        const container = document.getElementById('date-tabs-container');
        if (!container) return;
        container.innerHTML = '';
        const todayIdx = this.getTodayPlanIndex();
        // Reorder plan so that first tab is Sunday? Actually we just display in plan order but with Sunday highlight.
        // To make tabs start from Sunday, we would need to reorder the plan array. Simpler: keep as is but ensure the tab order matches plan order.
        // The user wanted "Days of the week to start on Sunday" – meaning the first tab should be Sunday.
        // We'll sort the plan array based on weekday starting Sunday.
        const sortedPlan = [...plan].sort((a,b) => {
            const aWeekday = weekdayToNumber(new Date(a.date).toLocaleDateString(undefined, { weekday: 'short' }));
            const bWeekday = weekdayToNumber(new Date(b.date).toLocaleDateString(undefined, { weekday: 'short' }));
            return aWeekday - bWeekday;
        });
        sortedPlan.forEach((day, idx) => {
            const dateObj = new Date(day.date);
            const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
            const btn = document.createElement('button');
            btn.className = 'date-tab';
            // Find original index to compare with currentDay
            const originalIdx = plan.findIndex(p => p.date === day.date);
            if (originalIdx === this.currentDay) btn.classList.add('active');
            if (originalIdx === todayIdx) btn.classList.add('today');
            btn.textContent = weekday;
            btn.dataset.date = originalIdx;
            btn.addEventListener('click', () => this.switchDay(originalIdx));
            container.appendChild(btn);
        });
    }

    switchDay(dayIndex) {
        this.currentDay = dayIndex;
        this.generateDateTabs();
        this.renderPlan();
    }

    switchScreen(screen) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-screen="${screen}"]`).classList.add('active');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screen}-screen`).classList.add('active');
        const titles = { inventory:'Inventory', plan:'Meal Plan', shopping:'Shopping List', supplements:'Supplements', use:'Use Items' };
        document.getElementById('page-title').textContent = titles[screen] || 'Keto Planner';
        document.getElementById('add-item-fab').style.display = screen === 'inventory' ? 'block' : 'none';
        this.currentScreen = screen;
        this.renderCurrentScreen();
    }

    renderCurrentScreen() {
        if (this.currentScreen === 'inventory') this.renderInventory();
        else if (this.currentScreen === 'plan') this.renderPlan();
        else if (this.currentScreen === 'shopping') this.renderShopping();
        else if (this.currentScreen === 'supplements') this.renderSupplements();
        else if (this.currentScreen === 'use') this.renderUseScreen();
    }

    renderInventory() {
        const items = this.dataStore.getItems();
        const container = document.getElementById('inventory-list');
        if (!items.length) {
            container.innerHTML = `<div class="empty-state"><p>No items in your inventory yet.</p><p>Tap the + button to add your first item!</p></div>`;
            return;
        }
        container.innerHTML = items.map(item => {
            const stockClass = item.quantity <= 0 ? 'out-of-stock' : (item.quantity < 10 && item.unit !== 'g' && item.unit !== 'ml' ? 'low-stock' : '');
            return `<div class="item-row" data-item-id="${item.id}">
                        <div class="item-info"><div class="item-name">${item.name}</div><div class="item-details"><span class="category-badge">${item.category}</span></div></div>
                        <div class="item-quantity ${stockClass}">${item.quantity} ${item.unit}</div>
                    </div>`;
        }).join('');
        container.querySelectorAll('.item-row').forEach(row => {
            row.addEventListener('click', (e) => this.openItemModal(row.dataset.itemId));
        });
    }

    renderPlan() {
        const plan = this.dataStore.getPlan();
        if (!plan.length) return;
        const currentPlan = plan[this.currentDay];
        const slotsContainer = document.getElementById('meal-slots-container');
        const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Protein Bridge'];
        let plannedTotal = 0;
        let consumedTotal = 0;

        slotsContainer.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const mealId = currentPlan.slots[i];
            const mealData = mealId ? this.dataStore.getMeal(mealId) : null;
            const consumed = this.dataStore.isMealConsumed(this.currentDay, i);
            if (mealData && mealData.calories) {
                plannedTotal += mealData.calories;
                if (consumed) consumedTotal += mealData.calories;
            }
            const slotDiv = document.createElement('div');
            slotDiv.className = `meal-slot ${mealData ? 'filled' : ''} ${consumed ? 'consumed' : ''}`;
            slotDiv.innerHTML = `
                <strong>${mealNames[i]}</strong>
                <button class="eat-btn ${consumed ? 'consumed' : ''}" data-day="${this.currentDay}" data-slot="${i}">${consumed ? '✓' : '✔️'}</button>
                ${consumed ? `<button class="reset-btn" data-day="${this.currentDay}" data-slot="${i}">↺</button>` : ''}
                <div class="meal-content"></div>
            `;
            const contentDiv = slotDiv.querySelector('.meal-content');
            if (mealData) {
                const ingredientsList = mealData.ingredients.map(ing => `${ing.quantity}${ing.unit} ${ing.name}`).join(', ');
                const caloriesText = mealData.calories ? `<div class="meal-calories">${mealData.calories} kcal</div>` : '';
                const notesText = mealData.notes ? `<div class="meal-notes">${mealData.notes}</div>` : '';
                contentDiv.innerHTML = `<div class="meal-details">${mealData.name}</div><div class="meal-ingredients">${ingredientsList}</div>${caloriesText}${notesText}`;
            } else {
                contentDiv.textContent = 'Tap to add meal';
            }

            const eatBtn = slotDiv.querySelector('.eat-btn');
            if (eatBtn) {
                eatBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!consumed) this.markMealAsEaten(this.currentDay, i, mealId);
                });
            }

            const resetBtn = slotDiv.querySelector('.reset-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.resetSingleMeal(this.currentDay, i);
                });
            }

            slotDiv.addEventListener('click', (e) => {
                if (e.target === eatBtn || e.target === resetBtn) return;
                if (!consumed) this.openMealSlot(this.currentDay, i, mealId);
            });
            slotsContainer.appendChild(slotDiv);
        }
        document.getElementById('consumed-calories').textContent = `${consumedTotal} kcal`;
        document.getElementById('planned-calories').textContent = `${plannedTotal} kcal`;
    }

    markMealAsEaten(dayIdx, slotIdx, mealId) {
        if (!mealId) { this.showToast("No meal assigned."); return; }
        if (this.dataStore.isMealConsumed(dayIdx, slotIdx)) { this.showToast("Already eaten."); return; }
        const meal = this.dataStore.getMeal(mealId);
        if (!meal) return;
        let insufficient = false;
        for (const ing of meal.ingredients) {
            const item = this.dataStore.getItem(ing.itemId);
            if (item) {
                const newQty = item.quantity - ing.quantity;
                this.dataStore.updateItem(ing.itemId, { quantity: Math.max(0, newQty) });
                if (newQty < 0) insufficient = true;
            }
        }
        this.dataStore.markMealConsumed(dayIdx, slotIdx);
        this.renderPlan();
        this.renderInventory();
        this.showToast(insufficient ? `⚠️ Some ingredients under‑stocked.` : `✅ ${meal.name} eaten!`);
    }

    resetSingleMeal(dayIdx, slotIdx) {
        this.dataStore.unmarkMealConsumed(dayIdx, slotIdx);
        this.renderPlan();
        this.showToast(`Meal reactivated.`);
    }

    resetAllConsumedMeals() {
        if (confirm("Reset all eaten meals? This will NOT restore inventory – only re‑enable meals.")) {
            this.dataStore.resetAllConsumed();
            this.renderPlan();
            this.showToast("All meals reactivated.");
        }
    }

    renderShopping() { /* on demand */ }

    renderSupplements() {
        const supplements = this.dataStore.getSupplements();
        const notes = this.dataStore.getNotes();
        const container = document.getElementById('supplements-list');
        const essential = supplements.filter(s => s.priority === 'essential');
        const optional = supplements.filter(s => s.priority === 'optional');
        let html = '';
        if (essential.length) {
            html += '<h4 style="margin-bottom:0.75rem;color:var(--accent-primary);">Essential</h4>';
            essential.forEach(s => { html += `<div class="supplement-item"><div class="supplement-info"><h4>${s.name}</h4><div class="supplement-reason">${s.reason}</div></div><div class="supplement-dosage">${s.dosage}</div></div>`; });
        }
        if (optional.length) {
            html += '<h4 style="margin:1.5rem 0 0.75rem;color:var(--text-secondary);">Optional</h4>';
            optional.forEach(s => { html += `<div class="supplement-item"><div class="supplement-info"><h4>${s.name}</h4><div class="supplement-reason">${s.reason}</div></div><div class="supplement-dosage">${s.dosage}</div></div>`; });
        }
        if (notes.nutritionalStatus) {
            html += `<div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border-light);"><h4>📌 Nutritional Notes</h4>${notes.nutritionalStatus.map(n => `<p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:0.5rem;">• ${n}</p>`).join('')}</div>`;
        }
        container.innerHTML = html;
    }

    // NEW: Ad‑hoc consumption screen
    renderUseScreen() {
        const items = this.dataStore.getItems();
        const container = document.getElementById('use-items-list');
        if (!items.length) {
            container.innerHTML = '<div class="empty-state"><p>No items. Add some in Inventory first.</p></div>';
            return;
        }
        container.innerHTML = items.map(item => {
            const portion = item.portionAmount || 1;
            const canUse = item.quantity >= portion;
            return `
                <div class="use-item-row" data-item-id="${item.id}">
                    <div class="use-item-info">
                        <div class="use-item-name">${item.name}</div>
                        <div class="use-item-details">
                            ${item.quantity} ${item.unit} left &nbsp;|&nbsp;
                            Portion: ${portion} ${item.unit}
                        </div>
                    </div>
                    <button class="use-btn" ${!canUse ? 'disabled' : ''}>+</button>
                </div>
            `;
        }).join('');
        container.querySelectorAll('.use-btn').forEach((btn, idx) => {
            const itemId = container.children[idx]?.dataset.itemId;
            if (itemId) {
                btn.addEventListener('click', () => {
                    if (this.dataStore.consumePortion(itemId)) {
                        this.renderUseScreen();   // refresh use screen
                        this.renderInventory();   // update inventory screen if visible
                        this.showToast(`Used 1 portion.`);
                    } else {
                        this.showToast(`Not enough ${this.dataStore.getItem(itemId)?.name} left.`);
                        this.renderUseScreen();   // disable button
                    }
                });
            }
        });
    }

    openItemModal(itemId = null) {
        this.editingItemId = itemId;
        const modal = document.getElementById('item-modal');
        const title = document.getElementById('item-modal-title');
        const delBtn = document.getElementById('delete-item');
        if (itemId) {
            const item = this.dataStore.getItem(itemId);
            title.textContent = 'Edit Item';
            delBtn.style.display = 'block';
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-unit').value = item.unit;
            document.getElementById('item-quantity').value = item.quantity;
            document.getElementById('item-portion').value = item.portionAmount || 1;
        } else {
            title.textContent = 'Add Item';
            delBtn.style.display = 'none';
            document.getElementById('item-form').reset();
            document.getElementById('item-portion').value = 1;
        }
        modal.classList.add('show');
    }
    closeItemModal() { document.getElementById('item-modal').classList.remove('show'); this.editingItemId = null; }
    handleItemSubmit(e) {
        e.preventDefault();
        const itemData = {
            name: document.getElementById('item-name').value.trim(),
            category: document.getElementById('item-category').value,
            unit: document.getElementById('item-unit').value,
            quantity: parseFloat(document.getElementById('item-quantity').value),
            portionAmount: parseFloat(document.getElementById('item-portion').value) || 1
        };
        if (this.editingItemId) this.dataStore.updateItem(this.editingItemId, itemData);
        else this.dataStore.addItem(itemData);
        this.closeItemModal();
        if (this.currentScreen === 'inventory') this.renderInventory();
        if (this.currentScreen === 'use') this.renderUseScreen();
    }
    deleteCurrentItem() {
        if (this.editingItemId && confirm('Delete this item?')) {
            this.dataStore.deleteItem(this.editingItemId);
            this.closeItemModal();
            if (this.currentScreen === 'inventory') this.renderInventory();
            if (this.currentScreen === 'use') this.renderUseScreen();
        }
    }

    openMealSlot(dayIdx, slotIdx, existingMealId = null) {
        if (this.dataStore.isMealConsumed(dayIdx, slotIdx)) {
            this.showToast("Cannot edit a meal that has already been eaten. Reset it first.");
            return;
        }
        this.currentMealSlot = { dayIndex: dayIdx, slotIndex: slotIdx };
        this.editingMealId = existingMealId;
        if (this.dataStore.getItems().length === 0) { alert('Add some items to your inventory first!'); return; }
        const modal = document.getElementById('meal-modal');
        document.getElementById('meal-modal-title').textContent = existingMealId ? 'Edit Meal' : 'Add Meal';
        if (existingMealId) {
            const meal = this.dataStore.getMeal(existingMealId);
            document.getElementById('meal-name').value = meal.name || '';
            document.getElementById('meal-calories').value = meal.calories || '';
            document.getElementById('meal-notes').value = meal.notes || '';
        } else {
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
        if (!items.length) { container.innerHTML = '<div class="empty-state"><p>No items available.</p></div>'; return; }
        let existing = {};
        if (this.editingMealId) {
            const meal = this.dataStore.getMeal(this.editingMealId);
            if (meal && meal.ingredients) meal.ingredients.forEach(ing => { existing[ing.itemId] = ing.quantity; });
        }
        container.innerHTML = items.map(item => `<div class="ingredient-row">
            <div class="item-info" style="flex:1;"><div class="item-name">${item.name}</div><div class="item-details" style="font-size:0.75rem;">Available: ${item.quantity} ${item.unit}</div></div>
            <input type="number" class="ingredient-input" placeholder="0" value="${existing[item.id] || ''}" min="0" step="0.1" data-item-id="${item.id}">
            <span style="font-size:0.875rem;color:var(--text-secondary);width:35px;">${item.unit}</span>
        </div>`).join('');
    }
    closeMealModal() { document.getElementById('meal-modal').classList.remove('show'); this.currentMealSlot = null; this.editingMealId = null; }
    saveMeal() {
        if (!this.currentMealSlot) return;
        const inputs = document.querySelectorAll('#meal-ingredients input[data-item-id]');
        const ingredients = [];
        inputs.forEach(inp => {
            const qty = parseFloat(inp.value) || 0;
            if (qty > 0) {
                const item = this.dataStore.getItem(inp.dataset.itemId);
                if (item) ingredients.push({ itemId: item.id, name: item.name, quantity: qty, unit: item.unit });
            }
        });
        if (!ingredients.length) { alert('Add at least one ingredient.'); return; }
        const mealName = document.getElementById('meal-name').value.trim() || ingredients.map(i=>i.name).slice(0,3).join(', ');
        const calories = parseInt(document.getElementById('meal-calories').value) || null;
        const notes = document.getElementById('meal-notes').value.trim();
        const mealData = { name: mealName, ingredients, calories, notes };
        let mealId;
        if (this.editingMealId) { this.dataStore.updateMeal(this.editingMealId, mealData); mealId = this.editingMealId; }
        else { mealId = this.dataStore.addMeal(mealData).id; }
        this.dataStore.setPlanSlot(this.currentMealSlot.dayIndex, this.currentMealSlot.slotIndex, mealId);
        this.closeMealModal();
        this.renderPlan();
        this.showToast('Meal saved!');
    }

    // UPDATED: 5‑day lookahead + low‑stock trigger
    generateShoppingList() {
        const plan = this.dataStore.getPlan();
        if (!plan.length) return;
        const todayIdx = this.getTodayPlanIndex(); // weekday‑based today
        const neededMap = new Map();

        // 1. Planned meals – 5 days (today + next 4)
        for (let offset = 0; offset < 5; offset++) {
            const dayIdx = (todayIdx + offset) % plan.length;
            const dayPlan = plan[dayIdx];
            for (let slotIdx = 0; slotIdx < dayPlan.slots.length; slotIdx++) {
                const mealId = dayPlan.slots[slotIdx];
                if (!mealId) continue;
                if (this.dataStore.isMealConsumed(dayIdx, slotIdx)) continue;
                const meal = this.dataStore.getMeal(mealId);
                if (meal && meal.ingredients) {
                    meal.ingredients.forEach(ing => {
                        const item = this.dataStore.getItem(ing.itemId);
                        if (item) {
                            const key = ing.itemId;
                            const cur = neededMap.get(key) || {
                                name: item.name,
                                category: item.category,
                                unit: item.unit,
                                needed: 0,
                                current: item.quantity,
                                itemId: item.id
                            };
                            cur.needed += ing.quantity;
                            neededMap.set(key, cur);
                        }
                    });
                }
            }
        }

        // 2. Low‑stock items (≤10% of pack size)
        this.dataStore.getItems().forEach(item => {
            const pack = PACK_SIZES[item.id];
            if (!pack) return; // skip if no pack size defined
            const threshold = pack * 0.1;
            if (item.quantity <= threshold && item.quantity > 0) {
                const key = item.id;
                const existing = neededMap.get(key);
                if (existing) {
                    // Already needed for meals – ensure we buy at least one pack
                    existing.needed = Math.max(existing.needed, pack);
                } else {
                    neededMap.set(key, {
                        name: item.name,
                        category: item.category,
                        unit: item.unit,
                        needed: pack,
                        current: item.quantity,
                        itemId: item.id
                    });
                }
            }
        });

        // Calculate deficits with pack rounding
        const toBuy = [];
        neededMap.forEach(item => {
            let deficit = item.needed - item.current;
            if (deficit > 0) {
                const packQuantity = roundToPackSize(item.itemId, deficit);
                toBuy.push({
                    name: item.name,
                    category: item.category,
                    unit: item.unit,
                    neededExact: deficit,
                    buyQuantity: packQuantity,
                    current: item.current
                });
            }
        });
        this.renderShoppingList(toBuy);
    }

    renderShoppingList(shoppingItems) {
        const container = document.getElementById('shopping-list');
        if (!shoppingItems.length) {
            container.innerHTML = `<div class="empty-state"><p>🎉 You have everything you need for the next 5 days!</p></div>`;
            return;
        }
        const grouped = {};
        shoppingItems.forEach(item => { if (!grouped[item.category]) grouped[item.category] = []; grouped[item.category].push(item); });
        let html = '';
        Object.keys(grouped).forEach(cat => {
            html += `<div class="card"><h3 style="margin-bottom:1rem;text-transform:capitalize;color:var(--accent-primary);">${cat}</h3>`;
            grouped[cat].forEach(item => {
                const packNote = (item.buyQuantity !== item.neededExact) ? ` (rounded to whole pack)` : '';
                html += `<div class="shopping-item">
                            <input type="checkbox" class="shopping-checkbox" data-item="${item.name}">
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">Need: ${item.buyQuantity} ${item.unit}${packNote} (have ${item.current} ${item.unit})</div>
                            </div>
                        </div>`;
            });
            html += `</div>`;
        });
        html += `<div class="card"><button class="btn" id="mark-purchased">Update Inventory from Purchases</button></div>`;
        container.innerHTML = html;
        container.querySelectorAll('.shopping-checkbox').forEach(cb => {
            cb.addEventListener('change', e => { if (e.target.checked) e.target.closest('.shopping-item').classList.add('checked'); else e.target.closest('.shopping-item').classList.remove('checked'); });
        });
        const updateBtn = document.getElementById('mark-purchased');
        if (updateBtn) updateBtn.addEventListener('click', () => this.updateInventoryFromPurchases(shoppingItems));
    }

    updateInventoryFromPurchases(shoppingItems) {
        const checked = document.querySelectorAll('.shopping-checkbox:checked');
        let updated = 0;
        checked.forEach(cb => {
            const name = cb.dataset.item;
            const shopItem = shoppingItems.find(i => i.name === name);
            if (shopItem) {
                const invItem = this.dataStore.getItems().find(i => i.name === name);
                if (invItem) {
                    this.dataStore.updateItem(invItem.id, { quantity: invItem.quantity + shopItem.buyQuantity });
                    updated++;
                }
            }
        });
        if (updated) {
            this.showToast(`✅ Updated ${updated} items!`);
            this.generateShoppingList();
            this.renderInventory();
            this.renderUseScreen();
        } else {
            this.showToast('No items marked as purchased.');
        }
    }

    showToast(msg) {
        document.querySelectorAll('.toast').forEach(t => t.remove());
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.mealPlannerApp = new MealPlannerApp();
});