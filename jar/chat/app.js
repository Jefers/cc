/* ============================
   DATA
============================ */

const STORAGE_KEY = 'jars-app';

const defaultState = {
  jars: [
    { id: 'bills', name: 'Bills', amount: 0, removable: false },
    { id: 'everyday', name: 'Everyday', amount: 0, removable: false },
    { id: 'savings', name: 'Savings', amount: 0, removable: false }
  ],
  movements: [],
  bills: [],
  currentMonth: new Date().getMonth()
};

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState;

/* ============================
   HELPERS
============================ */

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toast(message) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function celebrate() {
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = 50 + Math.random() * 20 - 10 + '%';
    s.style.bottom = '100px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 600);
  }
}

function totalYouHave() {
  return state.jars.reduce((sum, j) => sum + j.amount, 0);
}

/* ============================
   SCREENS
============================ */

const container = document.getElementById('screen-container');
const title = document.getElementById('screen-title');

function renderHome() {
  title.textContent = 'Home';
  container.innerHTML = `
    <div class="month">☀️ This month</div>
    <div class="balance">You have ${totalYouHave()}</div>
    <div class="jars">
      ${state.jars.map(j => `
        <div class="jar">
          <div class="jar-name">${j.name}</div>
          <div class="jar-amount">${j.amount}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdd() {
  title.textContent = 'Money came in';
  container.innerHTML = `
    <form class="form">
      <input id="amount" placeholder="Amount" type="number" />
      <select id="jar">
        ${state.jars.map(j => `<option value="${j.id}">${j.name}</option>`).join('')}
      </select>
      <input placeholder="Where did it come from?" />
      <button type="button" class="primary">Add money</button>
    </form>
  `;

  container.querySelector('button').onclick = () => {
    const amount = +container.querySelector('#amount').value;
    if (!amount) return toast('Nothing changed.');
    const jar = state.jars.find(j => j.id === container.querySelector('#jar').value);
    jar.amount += amount;
    save();
    toast('Money added 👍');
    celebrate();
    renderHome();
  };
}

function renderSpend() {
  title.textContent = 'Money went out';
  container.innerHTML = `
    <form class="form">
      <input id="amount" placeholder="Amount" type="number" />
      <input placeholder="What was it for?" />
      <select id="jar">
        ${state.jars.map(j => `<option value="${j.id}">${j.name}</option>`).join('')}
      </select>
      <button type="button" class="primary">Done</button>
    </form>
  `;

  container.querySelector('button').onclick = () => {
    const amount = +container.querySelector('#amount').value;
    if (!amount) return toast('Nothing changed.');
    const jar = state.jars.find(j => j.id === container.querySelector('#jar').value);
    jar.amount -= amount;
    save();
    toast('Money saved');
    renderHome();
  };
}

function renderBills() {
  title.textContent = 'Bills this month';
  container.innerHTML = `
    <div class="jars">
      ${state.bills.map(b => `
        <div class="jar">
          <div>${b.name}</div>
          <div>${b.amount || ''}</div>
        </div>
      `).join('')}
      <button class="primary">Add a bill</button>
    </div>
  `;
}

/* ============================
   NAV
============================ */

document.querySelectorAll('.nav-btn').forEach((btn, i) => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector('.nav-indicator').style.transform = `translateX(${i * 70}px)`;
    const screen = btn.dataset.screen;
    if (screen === 'home') renderHome();
    if (screen === 'add') renderAdd();
    if (screen === 'spend') renderSpend();
    if (screen === 'bills') renderBills();
  };
});

/* ============================
   INIT
============================ */

renderHome();
save();
