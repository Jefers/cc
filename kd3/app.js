/**
 * KD3 — Keto+ Carb Cycle Planner (app.js)
 * Architecture based on kd2 with these improvements:
 *  - Sticky Today header (live kcal consumed / target)
 *  - Use tab adds to today and reduces inventory immediately
 *  - Plan tab date switching does NOT consume anything
 *  - Day-type toggle per day (Rest / Training) changes target
 *  - Auto-generate shopping list from low inventory
 */

/* ═══════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════ */
let state = {
  items: JSON.parse(JSON.stringify(DEFAULT_DATA.items)),
  eaten: {},   // "2026-06-15" → { mealId: true, ... }
  dateConsumed: {}, // "2026-06-15" → { itemId: quantity, ... }
  inventory: {}, // itemId → current quantity
  adhocConsumed: {} // "2026-06-15" → [{ itemId, quantity, name }]
};

let currentScreen = 'inventory';
let currentPlanDate = null;

/* ═══════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════ */
function init() {
  loadState();
  if (Object.keys(state.inventory).length === 0) {
    // First run: populate inventory from items
    state.items.forEach(it => { state.inventory[it.id] = it.quantity; });
  }
  if (!currentPlanDate) {
    currentPlanDate = todayStr();
  }
  renderAll();
  attachListeners();
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
}

function shortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return days[d.getDay()] + ' ' + d.getDate();
}

/* ═══════════════════════════════════════════════
   PERSISTENCE
   ═══════════════════════════════════════════════ */
function saveState() {
  try {
    localStorage.setItem('kd3_state', JSON.stringify({
      eaten: state.eaten,
      dateConsumed: state.dateConsumed,
      inventory: state.inventory,
      adhocConsumed: state.adhocConsumed
    }));
  } catch(e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('kd3_state');
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.eaten) state.eaten = s.eaten;
    if (s.dateConsumed) state.dateConsumed = s.dateConsumed;
    if (s.inventory) state.inventory = s.inventory;
    if (s.adhocConsumed) state.adhocConsumed = s.adhocConsumed;
  } catch(e) {}
}

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */
function getItem(id) { return state.items.find(it => it.id === id); }

function getMeal(id) { return DEFAULT_DATA.meals.find(m => m.id === id); }

function getPlanForDate(dateStr) {
  return DEFAULT_DATA.plan.find(p => p.date === dateStr);
}

function getDayType(dateStr) {
  const plan = getPlanForDate(dateStr);
  if (plan) return plan.dayType;
  return 'rest'; // default
}

function getTargetKcal(dateStr) {
  const dt = getDayType(dateStr);
  return TARGETS[dt].kcal;
}

function getTargetCarbs(dateStr) {
  const dt = getDayType(dateStr);
  return TARGETS[dt].carbs;
}

function getItemCalories(item, qty) {
  let cals = 0;
  cals += (item.carbs || 0) * qty * 4;
  cals += (item.protein || 0) * qty * 4;
  cals += (item.fat || 0) * qty * 9;
  return Math.round(cals);
}

function getMealCalories(meal) {
  let total = 0;
  (meal.ingredients || []).forEach(ing => {
    const it = getItem(ing.itemId);
    if (!it) return;
    const qtyMultiplier = (it.unit === 'pcs' && ing.unit === 'pcs') ? 1 : 1;
    total += getItemCalories(it, ing.quantity * qtyMultiplier);
  });
  if (meal.calories && total === 0) return meal.calories;
  return total || meal.calories || 0;
}

/* ── Compute consumed kcal for a given date ── */
function getConsumedKcal(dateStr) {
  let total = 0;

  // 1. Planned meals marked as eaten
  const plan = getPlanForDate(dateStr);
  if (plan) {
    (plan.slots || []).forEach(mealId => {
      if (state.eaten[dateStr] && state.eaten[dateStr][mealId]) {
        const meal = getMeal(mealId);
        if (meal) total += getMealCalories(meal);
      }
    });
  }

  // 2. Ad-hoc consumptions from Use tab
  const adhocs = state.adhocConsumed[dateStr] || [];
  adhocs.forEach(a => {
    const it = getItem(a.itemId);
    if (!it) return;
    total += getItemCalories(it, a.quantity);
  });

  return Math.round(total);
}

function getConsumedProtein(dateStr) {
  let total = 0;
  const plan = getPlanForDate(dateStr);
  if (plan) {
    (plan.slots || []).forEach(mealId => {
      if (state.eaten[dateStr] && state.eaten[dateStr][mealId]) {
        const meal = getMeal(mealId);
        if (meal) {
          (meal.ingredients || []).forEach(ing => {
            const it = getItem(ing.itemId);
            if (!it) return;
            total += (it.protein || 0) * ing.quantity;
          });
        }
      }
    });
  }
  const adhocs = state.adhocConsumed[dateStr] || [];
  adhocs.forEach(a => {
    const it = getItem(a.itemId);
    if (!it) return;
    total += (it.protein || 0) * a.quantity;
  });
  return Math.round(total);
}

function getConsumedCarbs(dateStr) {
  let total = 0;
  const plan = getPlanForDate(dateStr);
  if (plan) {
    (plan.slots || []).forEach(mealId => {
      if (state.eaten[dateStr] && state.eaten[dateStr][mealId]) {
        const meal = getMeal(mealId);
        if (meal) {
          (meal.ingredients || []).forEach(ing => {
            const it = getItem(ing.itemId);
            if (!it) return;
            total += (it.carbs || 0) * ing.quantity;
          });
        }
      }
    });
  }
  const adhocs = state.adhocConsumed[dateStr] || [];
  adhocs.forEach(a => {
    const it = getItem(a.itemId);
    if (!it) return;
    total += (it.carbs || 0) * a.quantity;
  });
  return Math.round(total);
}

/* ═══════════════════════════════════════════════
   RENDER ALL
   ═══════════════════════════════════════════════ */
function renderAll() {
  renderTodayHeader();
  renderInventory();
  renderPlan();
  renderUse();
  renderShopping();
  renderSupplement();
}

/* ── Today Header ── */
function renderTodayHeader() {
  const today = todayStr();
  document.getElementById('today-date').textContent = formatDate(today);
  const dt = getDayType(today);
  document.getElementById('today-target').textContent = dt.toUpperCase();
  
  // Day-type buttons
  document.getElementById('daytype-rest').classList.toggle('active', dt === 'rest');
  document.getElementById('daytype-training').classList.toggle('active', dt === 'training');
  
  const target = getTargetKcal(today);
  const consumed = getConsumedKcal(today);
  
  document.getElementById('today-ate').textContent = consumed;
  document.getElementById('today-goal').textContent = target;
  
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const fill = document.getElementById('today-fill');
  fill.style.width = pct + '%';
  fill.className = pct >= 100 ? 'danger' : pct >= 85 ? 'warning' : '';
}

/* ── Inventory ── */
function renderInventory() {
  const container = document.getElementById('inv-categories');
  container.innerHTML = '';
  
  const total = state.items.length;
  document.getElementById('inv-count').textContent = total;
  
  const cats = {};
  state.items.forEach(it => {
    if (!cats[it.category]) cats[it.category] = [];
    cats[it.category].push(it);
  });
  
  Object.keys(cats).sort().forEach(cat => {
    const div = document.createElement('div');
    div.className = 'inv-category';
    div.innerHTML = `<h3>${cat}</h3>`;
    cats[cat].sort((a, b) => a.name.localeCompare(b.name)).forEach(it => {
      const qty = state.inventory[it.id] || 0;
      const unit = it.unit || 'g';
      const row = document.createElement('div');
      row.className = 'inv-item';
      row.innerHTML = `<span class="inv-item-name">${it.name}</span>
        <span class="inv-item-qty">${qty} ${unit}</span>`;
      div.appendChild(row);
    });
    container.appendChild(div);
  });
}

/* ── Plan ── */
function renderPlan() {
  // Date tabs
  const tabContainer = document.getElementById('plan-date-tabs');
  tabContainer.innerHTML = '';
  const today = todayStr();
  
  // Show 7 days starting from Monday of current week
  const weekDays = getWeekDays(today);
  weekDays.forEach(dateStr => {
    const btn = document.createElement('button');
    btn.className = 'plan-date-tab';
    if (dateStr === currentPlanDate) btn.classList.add('active');
    if (dateStr === today) btn.classList.add('today');
    btn.textContent = shortDate(dateStr);
    btn.dataset.date = dateStr;
    btn.addEventListener('click', () => {
      currentPlanDate = dateStr;
      renderAll();
    });
    tabContainer.appendChild(btn);
  });
  
  // Day-type label
  // If the plan has a forced day type, show it (user can override via toggle)
  const planEntry = getPlanForDate(currentPlanDate);
  const dt = planEntry ? planEntry.dayType : getDayType(currentPlanDate);
  document.getElementById('plan-daytype-label').textContent = dt === 'training' ? '🏋️ Training Day — 1,450 / 50g carbs' : '🛌 Rest Day — 1,250 / <20g carbs';
  
  // Meals
  const mealContainer = document.getElementById('plan-meals');
  mealContainer.innerHTML = '';
  
  // Determine which meals to show
  let mealIds = [];
  if (planEntry && planEntry.slots) {
    mealIds = planEntry.slots;
  } else if (DEFAULT_DATA.plan.length > 0) {
    // Try first plan entry as fallback
    const first = DEFAULT_DATA.plan[0];
    if (first.slots) mealIds = first.slots;
  }
  
  mealIds.forEach(mealId => {
    const meal = getMeal(mealId);
    if (!meal) return;
    
    const isEaten = state.eaten[currentPlanDate] && state.eaten[currentPlanDate][mealId];
    
    const card = document.createElement('div');
    card.className = 'meal-card' + (isEaten ? ' eaten' : '');
    
    const cals = getMealCalories(meal);
    
    let ingText = '';
    (meal.ingredients || []).forEach(ing => {
      const it = getItem(ing.itemId);
      if (!it) return;
      const invQty = state.inventory[ing.itemId] || 0;
      ingText += `${ing.quantity} ${ing.unit} ${it.name} (have: ${invQty}${ing.unit}), `;
    });
    if (ingText) ingText = ingText.slice(0, -2);
    
    card.innerHTML = `
      <div class="meal-card-header">
        <span class="meal-card-name">${meal.name}</span>
        <span class="meal-card-cal">${cals} kcal</span>
      </div>
      ${meal.notes ? `<div class="meal-card-notes">${meal.notes}</div>` : ''}
      ${ingText ? `<div class="meal-card-ingredients">${ingText}</div>` : ''}
      <div class="meal-card-actions">
        <button class="btn-sm meal-eat" data-meal="${mealId}">${isEaten ? '✓ Ate' : '✔️ Eat'}</button>
        ${isEaten ? `<button class="btn-sm meal-uneat" data-meal="${mealId}">↩ Undo</button>` : ''}
      </div>
    `;
    mealContainer.appendChild(card);
  });
  
  // Attach meal eat/uneat listeners
  document.querySelectorAll('.meal-eat').forEach(btn => {
    btn.addEventListener('click', () => eatMeal(btn.dataset.meal));
  });
  document.querySelectorAll('.meal-uneat').forEach(btn => {
    btn.addEventListener('click', () => uneatMeal(btn.dataset.meal));
  });
}

function getWeekDays(referenceDate) {
  const ref = new Date(referenceDate + 'T12:00:00');
  const day = ref.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day; // Monday = 1
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + mondayOffset);
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0'));
  }
  return days;
}

/* ── Eat / Uneat meal ── */
function eatMeal(mealId) {
  const dateStr = currentPlanDate || todayStr();
  if (!state.eaten[dateStr]) state.eaten[dateStr] = {};
  state.eaten[dateStr][mealId] = true;
  
  // Reduce inventory
  const meal = getMeal(mealId);
  if (meal) {
    (meal.ingredients || []).forEach(ing => {
      const it = getItem(ing.itemId);
      if (!it) return;
      state.inventory[ing.itemId] = (state.inventory[ing.itemId] || 0) - ing.quantity;
      if (state.inventory[ing.itemId] < 0) state.inventory[ing.itemId] = 0;
      
      // Track per-date consumption for shopping list
      if (!state.dateConsumed[dateStr]) state.dateConsumed[dateStr] = {};
      state.dateConsumed[dateStr][ing.itemId] = (state.dateConsumed[dateStr][ing.itemId] || 0) + ing.quantity;
    });
  }
  
  saveState();
  renderAll();
}

function uneatMeal(mealId) {
  const dateStr = currentPlanDate || todayStr();
  if (state.eaten[dateStr]) {
    delete state.eaten[dateStr][mealId];
  }
  
  // Restore inventory
  const meal = getMeal(mealId);
  if (meal) {
    (meal.ingredients || []).forEach(ing => {
      state.inventory[ing.itemId] = (state.inventory[ing.itemId] || 0) + ing.quantity;
    });
  }
  
  saveState();
  renderAll();
}

/* ── Use screen ── */
function renderUse() {
  const container = document.getElementById('use-list');
  container.innerHTML = '';
  
  // Group items by category
  const cats = {};
  state.items.forEach(it => {
    if (!cats[it.category]) cats[it.category] = [];
    cats[it.category].push(it);
  });
  
  Object.keys(cats).sort().forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'inv-category';
    catDiv.innerHTML = `<h3>${cat}</h3>`;
    
    cats[cat].sort((a, b) => a.name.localeCompare(b.name)).forEach(it => {
      const qty = state.inventory[it.id] || 0;
      if (qty <= 0) return; // skip items with zero inventory
      
      const itemDiv = document.createElement('div');
      itemDiv.className = 'use-item';
      
      // Determine default portion size
      let defaultPortion = 1;
      let portionUnit = it.unit;
      let portionLabel = '1 ' + it.unit;
      
      if (it.unit === 'pcs') {
        defaultPortion = 1;
        portionLabel = '1 pc';
      } else if (it.unit === 'g' || it.unit === 'ml') {
        // Use a sensible default portion
        defaultPortion = 50;
        portionLabel = '50' + it.unit;
      }
      
      const calsPerPortion = getItemCalories(it, defaultPortion);
      const carbsPerPortion = Math.round((it.carbs || 0) * defaultPortion);
      const proPerPortion = Math.round((it.protein || 0) * defaultPortion);
      
      itemDiv.innerHTML = `
        <div class="use-item-info">
          <div class="use-item-name">${it.name}</div>
          <div class="use-item-macro">${qty} ${it.unit} left — ${calsPerPortion} kcal / ${carbsPerPortion}c ${proPerPortion}p</div>
        </div>
        <div style="display:flex;gap:4px;align-items:center;">
          <span class="use-item-qty">${qty}${it.unit}</span>
          <button class="use-item-consume" data-item="${it.id}" data-qty="${defaultPortion}">+${portionLabel}</button>
          ${it.unit === 'g' || it.unit === 'ml' ? `
            <button class="use-item-consume small-portion" data-item="${it.id}" data-qty="20">+20</button>
            <button class="use-item-consume half-portion" data-item="${it.id}" data-qty="${Math.round(defaultPortion/2)}">+${Math.round(defaultPortion/2)}</button>
          ` : ''}
        </div>
      `;
      catDiv.appendChild(itemDiv);
    });
    
    container.appendChild(catDiv);
  });
  
  if (container.children.length === 0) {
    container.innerHTML = '<div class="empty-state"><p style="font-size:32px;">📦</p><p>Nothing in inventory — add items or go shopping.</p></div>';
  }
  
  // Attach consume listeners
  document.querySelectorAll('.use-item-consume').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.item;
      const qty = parseFloat(btn.dataset.qty);
      consumeItem(itemId, qty);
    });
  });
}

function consumeItem(itemId, quantity) {
  const it = getItem(itemId);
  if (!it) return;
  
  // Reduce inventory
  state.inventory[itemId] = (state.inventory[itemId] || 0) - quantity;
  if (state.inventory[itemId] < 0) state.inventory[itemId] = 0;
  
  // Record ad-hoc consumption for today
  const dateStr = todayStr();
  if (!state.adhocConsumed[dateStr]) state.adhocConsumed[dateStr] = [];
  // Check if same item already added — increment quantity
  const existing = state.adhocConsumed[dateStr].find(a => a.itemId === itemId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.adhocConsumed[dateStr].push({ itemId, quantity, name: it.name });
  }
  
  saveState();
  renderAll();
}

/* ── Shopping ── */
function renderShopping() {
  const container = document.getElementById('shopping-list');
  container.innerHTML = '';
  
  // Compute "running low" threshold: items with <2 days of typical use
  // Simple approach: show items where consumed > inventory in last 7 days
  // Or: items where inventory < 20% of original quantity
  const lowItems = [];
  state.items.forEach(it => {
    const invQty = state.inventory[it.id] || 0;
    const origQty = it.quantity || 0;
    
    // How many were consumed in the last 7 days
    const consumed7 = getConsumedSince(it.id, 7);
    
    // How many we need for the next 7 days
    const needQty = Math.max(0, Math.ceil(consumed7 * 1.2) - invQty);
    const needPack = roundToPackSize(it.id, needQty);
    
    if (needPack > 0 && needQty > 0) {
      lowItems.push({ item: it, need: needQty, needPack });
    }
  });
  
  // Group by category
  const cats = {};
  lowItems.sort((a, b) => a.item.name.localeCompare(b.item.name)).forEach(li => {
    if (!cats[li.item.category]) cats[li.item.category] = [];
    cats[li.item.category].push(li);
  });
  
  Object.keys(cats).sort().forEach(cat => {
    const div = document.createElement('div');
    div.className = 'shopping-category';
    div.innerHTML = `<h3>${cat}</h3>`;
    cats[cat].forEach(li => {
      const row = document.createElement('div');
      row.className = 'shopping-item';
      const packText = li.needPack !== li.need ? ` (buy ${li.needPack}${li.item.unit})` : '';
      row.innerHTML = `<span>${li.item.name}</span>
        <span class="shopping-item-qty">need ${Math.ceil(li.need)} ${li.item.unit}${packText}</span>`;
      div.appendChild(row);
    });
    container.appendChild(div);
  });
  
  if (Object.keys(cats).length === 0) {
    container.innerHTML = '<div class="empty-state"><p style="font-size:32px;">✅</p><p>Stock looks good — no urgent shopping needed.</p></div>';
  }
}

function getConsumedSince(itemId, days) {
  let total = 0;
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    
    // From planned meals
    const plan = getPlanForDate(dateStr);
    if (plan) {
      (plan.slots || []).forEach(mealId => {
        if (state.eaten[dateStr] && state.eaten[dateStr][mealId]) {
          const meal = getMeal(mealId);
          if (meal) {
            (meal.ingredients || []).forEach(ing => {
              if (ing.itemId === itemId) total += ing.quantity;
            });
          }
        }
      });
    }
    
    // From ad-hoc
    const adhocs = state.adhocConsumed[dateStr] || [];
    adhocs.forEach(a => {
      if (a.itemId === itemId) total += a.quantity;
    });
  }
  return total;
}

/* ── Supplements ── */
function renderSupplement() {
  const container = document.getElementById('supplement-list');
  container.innerHTML = '';
  
  DEFAULT_DATA.supplements.forEach(s => {
    const card = document.createElement('div');
    card.className = 'supplement-card ' + (s.priority || 'essential');
    card.innerHTML = `
      <div class="supplement-name">${s.name}</div>
      <div class="supplement-dosage">${s.dosage}</div>
      <div class="supplement-reason">${s.reason}</div>
    `;
    container.appendChild(card);
  });
  
  // Notes
  const notesList = document.getElementById('notes-list');
  notesList.innerHTML = '';
  (DEFAULT_DATA.notes.nutritionalStatus || []).forEach(note => {
    const li = document.createElement('li');
    li.textContent = note;
    notesList.appendChild(li);
  });
}

/* ═══════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════ */
function switchScreen(name) {
  currentScreen = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-screen="${name}"]`).classList.add('active');
}

/* ═══════════════════════════════════════════════
   EVENT LISTENERS
   ═══════════════════════════════════════════════ */
function attachListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchScreen(btn.dataset.screen);
    });
  });
  
  // Day-type toggle
  document.getElementById('daytype-rest').addEventListener('click', () => {
    toggleDayType('rest');
  });
  document.getElementById('daytype-training').addEventListener('click', () => {
    toggleDayType('training');
  });
  
  // Add item modal
  document.getElementById('inv-add-item').addEventListener('click', () => {
    document.getElementById('add-item-modal').classList.remove('hidden');
  });
  document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('add-item-modal').classList.add('hidden');
  });
  document.getElementById('save-new-item').addEventListener('click', () => {
    saveNewItem();
  });
}

function toggleDayType(newType) {
  const dateStr = todayStr();
  
  // Try to persist day-type override in localStorage
  try {
    let overrides = JSON.parse(localStorage.getItem('kd3_daytypes') || '{}');
    overrides[dateStr] = newType;
    localStorage.setItem('kd3_daytypes', JSON.stringify(overrides));
  } catch(e) {}
  
  renderAll();
}

// Override getDayType to check for user overrides
const origGetDayType = getDayType;
getDayType = function(dateStr) {
  try {
    const overrides = JSON.parse(localStorage.getItem('kd3_daytypes') || '{}');
    if (overrides[dateStr]) return overrides[dateStr];
  } catch(e) {}
  return origGetDayType(dateStr);
};

function saveNewItem() {
  const name = document.getElementById('new-item-name').value.trim();
  const category = document.getElementById('new-item-category').value.trim().toLowerCase();
  const unit = document.getElementById('new-item-unit').value.trim();
  const qty = parseFloat(document.getElementById('new-item-qty').value) || 0;
  const carbs = parseFloat(document.getElementById('new-item-carbs').value) || 0;
  const fat = parseFloat(document.getElementById('new-item-fat').value) || 0;
  const protein = parseFloat(document.getElementById('new-item-protein').value) || 0;
  
  if (!name || !category || !unit || qty <= 0) return;
  
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const newItem = { id, name, category, unit, quantity: qty, carbs, fat, protein };
  state.items.push(newItem);
  state.inventory[id] = qty;
  saveState();
  renderAll();
  
  // Clear form
  document.querySelectorAll('#add-item-modal input').forEach(inp => inp.value = '');
  document.getElementById('add-item-modal').classList.add('hidden');
}

/* ═══════════════════════════════════════════════
   START
   ═══════════════════════════════════════════════ */
init();
switchScreen('inventory');
