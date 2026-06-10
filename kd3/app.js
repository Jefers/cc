// ---------- Helper: Pack sizes ----------
const PACK_SIZES = {
    "chicken-thigh": 4, "beef-mince": 400, "ribeye-steak": 250, "eggs": 12,
    "cooked-ham": 150, "sardines": 1, "salmon-fillet": 300, "pork-belly": 250,
    "whey-protein": 900, "creatine": 500,
    "golden-cow-butter": 250, "double-cream": 300, "mature-cheddar": 200,
    "french-brie": 190, "greek-yogurt": 950,
    "pomegranate-concentrate": 500, "sweet-potato": 500, "jasmine-rice": 300, "banana": 4,
    "pork-scratchings": 80, "sauerkraut": 500, "psyllium-husk": 200,
    "apple-cider-vinegar": 500, "dark-chocolate-85": 100, "mixed-nuts": 200,
    "instant-coffee": 100, "tea-bags": 40, "electrolyte-powder": 30,
    "pink-salt": 250
};

function roundToPackSize(itemId, neededQty) {
    const pack = PACK_SIZES[itemId];
    if (!pack) return neededQty;
    if (neededQty <= 0) return 0;
    return Math.ceil(neededQty / pack) * pack;
}

function weekdayToNumber(weekdayStr) {
    const map = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    return map[weekdayStr];
}

function getTodayWeekdayNumber() {
    return new Date().getDay();
}

// ---------- Data Store ----------
class DataStore {
    constructor() {
        this.data = this.loadData();
        if (!this.data.consumedMeals) this.data.consumedMeals = [];
        if (!this.data.adhocConsumptions) this.data.adhocConsumptions = [];
        if (!this.data.todayLog) this.data.todayLog = { date: null, meals: [], extras: [] };
        this.data.items.forEach(item => {
            item.carbs = item.carbs ?? 0;
            item.fat = item.fat ?? 0;
            item.protein = item.protein ?? 0;
            item.portionAmount = item.portionAmount ?? 1;
        });
        this.loadTodayLog();
        this.saveData();
    }

    loadData() {
        const stored = localStorage.getItem('mealPlannerData_v3');
        if (stored) return JSON.parse(stored);
        if (typeof DEFAULT_DATA !== 'undefined') {
            const d = JSON.parse(JSON.stringify(DEFAULT_DATA));
            d.consumedMeals = [];
            d.adhocConsumptions = [];
            if (!d.targets) d.targets = { rest: { calories: 1250, protein: 140, carbs: 20, fat: 85 }, training: { calories: 1450, protein: 140, carbs: 50, fat: 70 } };
            d.todayLog = { date: null, meals: [], extras: [] };
            d.todayType = 'rest';
            return d;
        }
        return { items: [], meals: [], plan: [], supplements: [], notes: {}, consumedMeals: [], adhocConsumptions: [], targets: { rest: { calories: 1250, protein: 140, carbs: 20, fat: 85 }, training: { calories: 1450, protein: 140, carbs: 50, fat: 70 } }, todayLog: { date: null, meals: [], extras: [] }, todayType: 'rest' };
    }

    saveData() { localStorage.setItem('mealPlannerData_v3', JSON.stringify(this.data)); }

    loadTodayLog() {
        const today = new Date().toISOString().split('T')[0];
        if (this.data.todayLog.date !== today) {
            this.data.todayLog = { date: today, meals: [], extras: [] };
            // Determine today's type from plan
            const plan = this.data.plan;
            const todayWeekday = getTodayWeekdayNumber();
            for (const day of plan) {
                const d = new Date(day.date);
                if (d.getDay() === todayWeekday) {
                    this.data.todayType = day.type || 'rest';
                    break;
                }
            }
        }
    }

    getTodayType() { return this.data.todayType || 'rest'; }
    setTodayType(type) {
        this.data.todayType = type;
        this.saveData();
    }

    getTargets() {
        return this.data.targets || { rest: { calories: 1250, protein: 140, carbs: 20, fat: 85 }, training: { calories: 1450, protein: 140, carbs: 50, fat: 70 } };
    }

    getTargetsForToday() {
        const type = this.getTodayType();
        return this.data.targets[type] || this.data.targets.rest;
    }

    getTodayMeals() { return this.data.todayLog.meals || []; }
    addTodayMeal(mealId) {
        if (!this.data.todayLog.meals) this.data.todayLog.meals = [];
        if (!this.data.todayLog.meals.includes(mealId)) {
            this.data.todayLog.meals.push(mealId);
            this.saveData();
        }
    }
    removeTodayMeal(mealId) {
        this.data.todayLog.meals = (this.data.todayLog.meals || []).filter(m => m !== mealId);
        this.saveData();
    }
    getTodayExtras() { return this.data.todayLog.extras || []; }
    addTodayExtra(extra) {
        if (!this.data.todayLog.extras) this.data.todayLog.extras = [];
        extra.id = Date.now().toString(36);
        extra.time = new Date().toLocaleTimeString();
        this.data.todayLog.extras.push(extra);
        this.saveData();
    }
    removeTodayExtra(id) {
        this.data.todayLog.extras = (this.data.todayLog.extras || []).filter(e => e.id !== id);
        this.saveData();
    }
    resetToday() {
        const today = new Date().toISOString().split('T')[0];
        this.data.todayLog = { date: today, meals: [], extras: [] };
        this.saveData();
    }

    generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
    addItem(item) {
        item.carbs = item.carbs ?? 0;
        item.fat = item.fat ?? 0;
        item.protein = item.protein ?? 0;
        item.portionAmount = item.portionAmount ?? 1;
        item.id = this.generateId();
        this.data.items.push(item);
        this.saveData();
        return item;
    }
    updateItem(id, updates) {
        const idx = this.data.items.findIndex(i => i.id === id);
        if (idx !== -1) { this.data.items[idx] = { ...this.data.items[idx], ...updates }; this.saveData(); return this.data.items[idx]; }
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
    getPlan() { return this.data.plan; }
    getSupplements() { return this.data.supplements || []; }
    getNotes() { return this.data.notes || {}; }

    // Legacy plan screen consumption
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
        this.data.consumedMeals = this.data.consumedMeals.filter(k => k !== `${dayIdx}-${slotIdx}`);
        this.saveData();
    }
    resetAllConsumed() { this.data.consumedMeals = []; this.saveData(); }

    consumePortion(itemId) {
        const item = this.getItem(itemId);
        if (!item) return false;
        const portion = item.portionAmount || 1;
        if (item.quantity < portion) return false;
        this.updateItem(itemId, { quantity: item.quantity - portion });
        return true;
    }
    recordAdhoc(date, itemId, name, quantity, portion, fat, protein, carbs, calories) {
        this.data.adhocConsumptions.push({ date, itemId, name, quantity, portion, fat, protein, carbs, calories });
        this.saveData();
    }
    clearAllAdhoc() { this.data.adhocConsumptions = []; this.saveData(); }
}

// ---------- App Controller ----------
class MealPlannerApp {
    constructor() {
        this.dataStore = new DataStore();
        this.currentScreen = 'today';
        this.currentDay = 0;
        this.editingItemId = null;
        this.currentMealSlot = null;
        this.editingMealId = null;
        this.lastToast = null;
        this.initializeApp();
    }

    getTodayPlanIndex() {
        const plan = this.dataStore.getPlan();
        if (!plan.length) return 0;
        const todayWeekdayNum = getTodayWeekdayNumber();
        for (let i = 0; i < plan.length; i++) {
            const d = new Date(plan[i].date);
            if (d.getDay() === todayWeekdayNum) return i;
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
        document.getElementById('reset-all-data').addEventListener('click', () => this.resetAllData());
        document.getElementById('edit-threshold').addEventListener('click', () => this.openThresholdModal());
        document.getElementById('close-threshold-modal').addEventListener('click', () => this.closeThresholdModal());
        document.getElementById('save-threshold-btn').addEventListener('click', () => this.saveThreshold());
        document.getElementById('reset-today-btn').addEventListener('click', () => this.resetToday());

        // Day type toggles
        document.getElementById('set-rest-day').addEventListener('click', () => this.setDayType('rest'));
        document.getElementById('set-training-day').addEventListener('click', () => this.setDayType('training'));

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

    showToast(msg, undoLabel = null, undoCallback = null) {
        if (this.lastToast) this.lastToast.remove();
        const toast = document.createElement('div');
        toast.className = 'toast';
        if (undoLabel) {
            toast.innerHTML = `<span>${msg}</span><button class="toast-undo-btn">${undoLabel}</button>`;
            toast.querySelector('.toast-undo-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (undoCallback) undoCallback();
                toast.remove();
                this.lastToast = null;
            });
        } else {
            toast.textContent = msg;
        }
        document.body.appendChild(toast);
        this.lastToast = toast;
        setTimeout(() => {
            if (this.lastToast === toast) { this.lastToast = null; toast.remove(); }
        }, undoLabel ? 4000 : 2500);
    }

    // ---------- Day Type ----------
    setDayType(type) {
        this.dataStore.setTodayType(type);
        this.renderTodayScreen();
        this.showToast(`Day set to: ${type === 'training' ? '🏋️ Training' : '🛌 Rest'} Day`);
    }

    // ---------- Screen Navigation ----------
    switchScreen(screen) {
        // If switching to today, refresh it
        if (screen === 'today') {
            this.dataStore.loadTodayLog();
        }
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-screen="${screen}"]`).classList.add('active');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screen}-screen`).classList.add('active');
        const titles = { today:'Today', plan:'Meal Plan', stock:'Stock', shopping:'Shopping List', supplements:'Supplements' };
        document.getElementById('page-title').textContent = titles[screen] || 'Keto+ Planner';
        document.getElementById('add-item-fab').style.display = screen === 'stock' ? 'block' : 'none';
        this.currentScreen = screen;
        this.renderCurrentScreen();
    }

    renderCurrentScreen() {
        if (this.currentScreen === 'today') this.renderTodayScreen();
        else if (this.currentScreen === 'plan') this.renderPlanScreen();
        else if (this.currentScreen === 'stock') this.renderStock();
        else if (this.currentScreen === 'shopping') this.renderShopping();
        else if (this.currentScreen === 'supplements') this.renderSupplements();
    }

    // ===================== TODAY SCREEN =====================
    renderTodayScreen() {
        const type = this.dataStore.getTodayType();
        const targets = this.dataStore.getTargetsForToday();
        // Update day type card
        document.getElementById('day-type-label').textContent = type === 'training' ? '🏋️ Training Day' : '🛌 Rest Day';
        document.getElementById('day-type-label').className = 'day-type-label ' + type;
        document.getElementById('set-rest-day').classList.toggle('active', type === 'rest');
        document.getElementById('set-training-day').classList.toggle('active', type === 'training');

        // Target display
        document.getElementById('target-cal').textContent = targets.calories + ' kcal';
        document.getElementById('target-protein').textContent = targets.protein + 'g';
        document.getElementById('target-carbs').textContent = targets.carbs + 'g';
        document.getElementById('target-fat').textContent = targets.fat + 'g';

        // Calculate eaten totals
        let eatenCal = 0, eatenProt = 0, eatenCarbs = 0;

        const meals = this.dataStore.getTodayMeals() || [];
        const mealContainer = document.getElementById('today-meals-list');
        mealContainer.innerHTML = '';
        if (meals.length === 0) {
            mealContainer.innerHTML = '<div class="empty-sub"><p>No meals logged yet today.</p></div>';
        } else {
            meals.forEach(mealId => {
                const meal = this.dataStore.getMeal(mealId);
                if (!meal) return;
                eatenCal += meal.calories || 0;
                const macros = this.calcMealMacros(meal);
                eatenProt += macros.protein;
                eatenCarbs += macros.carbs;
                const cals = meal.calories || 0;
                const macroStr = `F:${macros.fat.toFixed(0)}g P:${macros.protein.toFixed(0)}g C:${macros.carbs.toFixed(1)}g`;
                const div = document.createElement('div');
                div.className = 'today-meal-row';
                div.innerHTML = `<div class="today-meal-info"><strong>${meal.name}</strong><span class="today-meal-macros">${cals} kcal · ${macroStr}</span></div><button class="remove-btn" data-id="${mealId}">✕</button>`;
                div.querySelector('.remove-btn').addEventListener('click', () => {
                    this.dataStore.removeTodayMeal(mealId);
                    this.renderTodayScreen();
                });
                mealContainer.appendChild(div);
            });
        }

        // Extras
        const extras = this.dataStore.getTodayExtras() || [];
        const extraContainer = document.getElementById('today-extra-list');
        extraContainer.innerHTML = '';
        if (extras.length === 0) {
            extraContainer.innerHTML = '<div class="empty-sub"><p>No extra items logged.</p></div>';
        } else {
            extras.forEach(extra => {
                eatenCal += extra.calories || 0;
                eatenProt += extra.protein || 0;
                eatenCarbs += extra.carbs || 0;
                const div = document.createElement('div');
                div.className = 'today-extra-row';
                div.innerHTML = `<span>${extra.name} (${extra.calories || 0} kcal)</span><button class="remove-btn" data-id="${extra.id}">✕</button>`;
                div.querySelector('.remove-btn').addEventListener('click', () => {
                    this.dataStore.removeTodayExtra(extra.id);
                    this.renderTodayScreen();
                });
                extraContainer.appendChild(div);
            });
        }

        // Stats
        document.getElementById('eaten-calories').textContent = eatenCal + ' kcal';
        document.getElementById('remaining-calories').textContent = Math.max(0, targets.calories - eatenCal) + ' kcal';
        document.getElementById('eaten-protein').textContent = `${eatenProt.toFixed(0)}g / ${targets.protein}g`;
        document.getElementById('eaten-carbs').textContent = `${eatenCarbs.toFixed(1)}g / ${targets.carbs}g`;
    }

    resetToday() {
        if (confirm('Reset today\'s logged meals and extras?')) {
            this.dataStore.resetToday();
            this.renderTodayScreen();
            this.showToast('Today reset.');
        }
    }

    // ===================== PLAN SCREEN (legacy) =====================
    generateDateTabs() {
        const plan = this.dataStore.getPlan();
        const container = document.getElementById('date-tabs-container');
        if (!container) return;
        container.innerHTML = '';
        const todayIdx = this.getTodayPlanIndex();
        const sortedPlan = [...plan].sort((a, b) => {
            const aDay = new Date(a.date).getDay();
            const bDay = new Date(b.date).getDay();
            return aDay - bDay;
        });
        sortedPlan.forEach((day) => {
            const dateObj = new Date(day.date);
            const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
            const btn = document.createElement('button');
            btn.className = 'date-tab';
            const originalIdx = plan.findIndex(p => p.date === day.date);
            if (originalIdx === this.currentDay) btn.classList.add('active');
            if (originalIdx === todayIdx) btn.classList.add('today');
            const typeLabel = day.type === 'training' ? '🏋️' : '🛌';
            btn.textContent = `${typeLabel} ${weekday}`;
            btn.dataset.date = originalIdx;
            btn.addEventListener('click', () => {
                this.currentDay = originalIdx;
                this.generateDateTabs();
                // Quick-add to today
                this.quickAddToToday(originalIdx);
            });
            container.appendChild(btn);
        });
    }

    quickAddToToday(dayIdx) {
        const plan = this.dataStore.getPlan();
        if (!plan[dayIdx]) return;
        const day = plan[dayIdx];
        const mealIds = day.slots.filter(Boolean);
        let count = 0;
        mealIds.forEach(id => {
            const current = this.dataStore.getTodayMeals();
            if (!current.includes(id)) {
                this.dataStore.addTodayMeal(id);
                count++;
            }
        });
        if (count > 0) {
            this.showToast(`Added ${count} meals to today.`);
            this.renderTodayScreen();
        } else {
            this.showToast('Meals already in today log.');
        }
    }

    renderPlanScreen() {
        this.renderPlan();
    }

    renderPlan() {
        const plan = this.dataStore.getPlan();
        if (!plan.length) return;
        const currentPlan = plan[this.currentDay];
        const slotsContainer = document.getElementById('meal-slots-container');
        const extraContainer = document.getElementById('extra-consumption-container');
        const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Protein Bridge'];
        let plannedCal = 0, plannedFat = 0, plannedProtein = 0, plannedCarbs = 0;
        let consumedCal = 0, consumedFat = 0, consumedProtein = 0, consumedCarbs = 0;

        slotsContainer.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const mealId = currentPlan.slots[i];
            const mealData = mealId ? this.dataStore.getMeal(mealId) : null;
            const consumed = this.dataStore.isMealConsumed(this.currentDay, i);
            if (mealData) {
                const macros = this.calcMealMacros(mealData);
                plannedCal += mealData.calories || 0;
                plannedFat += macros.fat;
                plannedProtein += macros.protein;
                plannedCarbs += macros.carbs;
                if (consumed) {
                    consumedCal += mealData.calories || 0;
                    consumedFat += macros.fat;
                    consumedProtein += macros.protein;
                    consumedCarbs += macros.carbs;
                }
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
                const cals = mealData.calories ? `<div class="meal-calories">${mealData.calories} kcal</div>` : '';
                const macros = this.calcMealMacros(mealData);
                const macroStr = `F:${macros.fat.toFixed(0)}g P:${macros.protein.toFixed(0)}g C:${macros.carbs.toFixed(1)}g`;
                contentDiv.innerHTML = `<div class="meal-details">${mealData.name}</div>${cals}<div class="meal-macros">${macroStr}</div>`;
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
            slotsContainer.appendChild(slotDiv);
        }

        // Extra consumption for this day
        const dayDate = currentPlan.date;
        const adhocs = this.dataStore.data.adhocConsumptions.filter(a => a.date === dayDate);
        let extraCal = 0, extraFat = 0, extraProtein = 0, extraCarbs = 0;
        let extraHtml = '';
        if (adhocs.length) {
            extraHtml = '<div class="card" style="margin-top:1rem;"><h4 style="margin-bottom:0.5rem;">Extra consumption</h4>';
            adhocs.forEach(a => {
                extraCal += a.calories || 0;
                extraFat += a.fat || 0;
                extraProtein += a.protein || 0;
                extraCarbs += a.carbs || 0;
                extraHtml += `<div class="extra-item">${a.name} (${a.quantity} ${a.portion ? (this.dataStore.getItem(a.itemId)?.unit || '') : ''}) – ${a.calories || 0} kcal</div>`;
            });
            extraHtml += '</div>';
        }
        extraContainer.innerHTML = extraHtml;
        consumedCal += extraCal;
        consumedFat += extraFat;
        consumedProtein += extraProtein;
        consumedCarbs += extraCarbs;

        document.getElementById('consumed-calories').textContent = `${consumedCal} kcal`;
        document.getElementById('planned-calories').textContent = `${plannedCal} kcal`;
        document.getElementById('macro-summary').innerHTML = `
            <div class="macro-entry"><span>Consumed:</span> F:${consumedFat.toFixed(0)}g P:${consumedProtein.toFixed(0)}g C:${consumedCarbs.toFixed(1)}g</div>
            <div class="macro-entry"><span>Planned:</span> F:${plannedFat.toFixed(0)}g P:${plannedProtein.toFixed(0)}g C:${plannedCarbs.toFixed(1)}g</div>
        `;
    }

    markMealAsEaten(dayIdx, slotIdx, mealId) {
        if (!mealId) { this.showToast("No meal assigned."); return; }
        if (this.dataStore.isMealConsumed(dayIdx, slotIdx)) { this.showToast("Already eaten."); return; }
        const meal = this.dataStore.getMeal(mealId);
        if (!meal) return;

        const ingredientSnapshots = meal.ingredients.map(ing => {
            const item = this.dataStore.getItem(ing.itemId);
            return item ? { itemId: ing.itemId, oldQty: item.quantity } : null;
        }).filter(s => s);

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
        // Also add to today log
        this.dataStore.addTodayMeal(mealId);
        this.renderPlan();
        this.renderTodayScreen();

        const undoCallback = () => {
            ingredientSnapshots.forEach(snap => {
                this.dataStore.updateItem(snap.itemId, { quantity: snap.oldQty });
            });
            this.dataStore.unmarkMealConsumed(dayIdx, slotIdx);
            this.dataStore.removeTodayMeal(mealId);
            this.renderPlan();
            this.renderTodayScreen();
            this.showToast('Undone.');
        };
        this.showToast(insufficient ? `⚠️ ${meal.name} eaten (under-stocked)` : `✅ ${meal.name} eaten!`, 'Undo', undoCallback);
    }

    resetSingleMeal(dayIdx, slotIdx) {
        const plan = this.dataStore.getPlan();
        const mealId = plan[dayIdx]?.slots[slotIdx];
        this.dataStore.unmarkMealConsumed(dayIdx, slotIdx);
        if (mealId) this.dataStore.removeTodayMeal(mealId);
        this.renderPlan();
        this.renderTodayScreen();
        this.showToast('Meal reactivated.');
    }

    resetAllConsumedMeals() {
        if (confirm("Reset all eaten meals AND extra consumption? This will NOT restore inventory.")) {
            this.dataStore.resetAllConsumed();
            this.dataStore.clearAllAdhoc();
            this.dataStore.resetToday();
            this.renderPlan();
            this.renderTodayScreen();
            this.showToast("All meals cleared.");
        }
    }

    resetAllData() {
        if (confirm("Delete ALL data and reload defaults?")) {
            localStorage.removeItem('mealPlannerData_v3');
            location.reload();
        }
    }

    // ---------- Helpers ----------
    calcMealMacros(meal) {
        let fat = 0, protein = 0, carbs = 0;
        if (!meal || !meal.ingredients) return { fat, protein, carbs };
        meal.ingredients.forEach(ing => {
            const item = this.dataStore.getItem(ing.itemId);
            if (item) {
                const qty = ing.quantity;
                fat += (item.fat || 0) * qty;
                protein += (item.protein || 0) * qty;
                carbs += (item.carbs || 0) * qty;
            }
        });
        return { fat, protein, carbs };
    }

    // ---------- Stock ----------
    renderStock() {
        const items = this.dataStore.getItems();
        const container = document.getElementById('inventory-list');
        if (!items.length) {
            container.innerHTML = '<div class="empty-state"><p>📦 No items yet</p><p>Tap the + button to add.</p></div>';
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
            row.addEventListener('click', () => this.openItemModal(row.dataset.itemId));
        });
    }

    // ---------- Shopping ----------
    renderShopping() {
        // Pass-through - same as kd2
    }

    generateShoppingList() {
        // Simplified: list items below threshold
        const plan = this.dataStore.getPlan();
        if (!plan.length) { this.showToast('No plan to generate from.'); return; }
        const items = this.dataStore.getItems();
        const threshold = parseInt(localStorage.getItem('shopping_threshold') || '10', 10);
        const lowItems = items.filter(item => {
            const qty = item.quantity;
            const pack = PACK_SIZES[item.id];
            const effective = pack ? (qty / pack * 100) : qty;
            return effective <= threshold;
        });
        let html = '<div class="card"><h4>Items to restock</h4>';
        if (!lowItems.length) {
            html += '<p style="color: var(--text-muted);">All stocked up.</p>';
        } else {
            lowItems.forEach(item => {
                const pack = PACK_SIZES[item.id];
                const buy = pack ? roundToPackSize(item.id, pack - (item.quantity % pack || pack)) : item.quantity;
                html += `<div class="shopping-item"><input type="checkbox" class="shopping-checkbox"><span class="item-name">${item.name}</span><span style="margin-left:auto;color:var(--text-muted);font-size:0.8rem;">Buy: ${buy} ${item.unit}</span></div>`;
            });
        }
        html += '</div>';
        document.getElementById('shopping-list').innerHTML = html;
        // Checkbox toggle
        document.querySelectorAll('.shopping-checkbox').forEach(cb => {
            cb.addEventListener('change', function() {
                this.closest('.shopping-item').classList.toggle('checked');
            });
        });
        this.showToast('Shopping list generated.');
    }

    openThresholdModal() {
        document.getElementById('threshold-input').value = localStorage.getItem('shopping_threshold') || '10';
        document.getElementById('threshold-modal').classList.add('show');
    }
    closeThresholdModal() {
        document.getElementById('threshold-modal').classList.remove('show');
    }
    saveThreshold() {
        const val = document.getElementById('threshold-input').value;
        localStorage.setItem('shopping_threshold', val);
        document.getElementById('threshold-display').textContent = val + '%';
        this.closeThresholdModal();
        this.showToast(`Threshold set to ${val}%`);
    }

    // ---------- Supplements ----------
    renderSupplements() {
        const supps = this.dataStore.getSupplements();
        const container = document.getElementById('supplements-list');
        if (!supps.length) {
            container.innerHTML = '<div class="empty-state"><p>No supplements configured.</p></div>';
            return;
        }
        container.innerHTML = supps.map(s => `
            <div class="supplement-item">
                <div class="supplement-info">
                    <h4>${s.name}</h4>
                    <div class="supplement-dosage">${s.dosage}</div>
                    <div class="supplement-reason">${s.reason}</div>
                </div>
                <span class="supplement-priority ${s.priority}">${s.priority}</span>
            </div>
        `).join('');
    }

    // ---------- Item/Meal modals ----------
    openItemModal(itemId = null) {
        this.editingItemId = itemId;
        document.getElementById('item-modal-title').textContent = itemId ? 'Edit Item' : 'Add Item';
        document.getElementById('delete-item').style.display = itemId ? 'block' : 'none';
        if (itemId) {
            const item = this.dataStore.getItem(itemId);
            if (item) {
                document.getElementById('item-name').value = item.name || '';
                document.getElementById('item-category').value = item.category || 'protein';
                document.getElementById('item-unit').value = item.unit || 'g';
                document.getElementById('item-quantity').value = item.quantity;
                document.getElementById('item-portion').value = item.portionAmount || 1;
                document.getElementById('item-carbs').value = item.carbs || 0;
                document.getElementById('item-fat').value = item.fat || 0;
                document.getElementById('item-protein').value = item.protein || 0;
            }
        } else {
            document.getElementById('item-form').reset();
            document.getElementById('item-carbs').value = '0';
            document.getElementById('item-fat').value = '0';
            document.getElementById('item-protein').value = '0';
            document.getElementById('item-portion').value = '1';
        }
        document.getElementById('item-modal').classList.add('show');
    }

    closeItemModal() {
        document.getElementById('item-modal').classList.remove('show');
    }

    handleItemSubmit(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            unit: document.getElementById('item-unit').value,
            quantity: parseFloat(document.getElementById('item-quantity').value) || 0,
            portionAmount: parseFloat(document.getElementById('item-portion').value) || 1,
            carbs: parseFloat(document.getElementById('item-carbs').value) || 0,
            fat: parseFloat(document.getElementById('item-fat').value) || 0,
            protein: parseFloat(document.getElementById('item-protein').value) || 0
        };
        if (this.editingItemId) {
            this.dataStore.updateItem(this.editingItemId, data);
            this.showToast('Item updated.');
        } else {
            this.dataStore.addItem(data);
            this.showToast('Item added.');
        }
        this.closeItemModal();
        this.renderStock();
    }

    deleteCurrentItem() {
        if (this.editingItemId && confirm('Delete this item?')) {
            this.dataStore.deleteItem(this.editingItemId);
            this.closeItemModal();
            this.renderStock();
            this.showToast('Item deleted.');
        }
    }

    closeMealModal() {
        document.getElementById('meal-modal').classList.remove('show');
    }

    saveMeal() {
        // Placeholder - not core to carb cycling plan
        this.closeMealModal();
    }
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
    new MealPlannerApp();
});
