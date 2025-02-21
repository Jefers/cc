// Central userData object
const userData = JSON.parse(localStorage.getItem('userData')) || {
  profile: { name: "", age: null, weight: null, height: null },
  goals: [],
  xp: 0,
  upsellHistory: []
};

// Simple SPA routing
function loadPage(page) {
  fetch(`${page}.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('app').innerHTML = html;
      initPage(page); // Initialize page-specific logic
    });
}

// Bottom Nav Bar (shared across pages)
function renderNav() {
  const nav = `
    <nav class="bottom-nav">
      <button onclick="loadPage('dashboard')">🏠 Home</button>
      <button onclick="loadPage('profile')">👤 Profile</button>
      <button onclick="loadPage('programs')">💪 Programs</button>
      <button onclick="loadPage('community')">🌐 Community</button>
      <button onclick="loadPage('live')">📡 Live</button>
      <button onclick="loadPage('rewards')">🎁 Rewards</button>
    </nav>`;
  document.getElementById('app').insertAdjacentHTML('beforeend', nav);
}

// Login Logic
document.getElementById('login-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = e.target[0].value;
  const password = e.target[1].value;
  if (username === 'demo' && password === 'pass123') {
    loadPage('dashboard');
    renderNav();
  } else {
    document.getElementById('login-error').textContent = 'Invalid credentials';
  }
});

// Auto-load dashboard if logged in (mock session)
if (document.location.hash === '#dashboard') loadPage('dashboard');

function initProfile() {
  const form = document.getElementById('profile-form');
  const avatarInput = document.getElementById('avatar-upload');
  const avatarPreview = document.getElementById('avatar-preview');

  // Avatar upload with preview
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
      avatarPreview.style.display = 'block';
      localStorage.setItem('avatar', reader.result); // Store as Base64
    };
    reader.readAsDataURL(file);
  });

  // Load existing avatar
  if (localStorage.getItem('avatar')) {
    avatarPreview.src = localStorage.getItem('avatar');
    avatarPreview.style.display = 'block';
  }

  // Save profile data
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    userData.profile = {
      name: form.name.value,
      age: parseInt(form.age.value),
      weight: parseFloat(form.weight.value),
      height: parseFloat(form.height.value)
    };
    userData.goals = [form.goals.value];
    localStorage.setItem('userData', JSON.stringify(userData));
    loadPage('dashboard');
  });
}

function initPage(page) {
  if (page === 'profile') initProfile();
  // Add other page initializations here
}


function calculateBMI() {
  const { weight, height } = userData.profile;
  if (weight && height) return (weight / ((height / 100) ** 2)).toFixed(1);
  return 'N/A';
}

function initDashboard() {
  document.getElementById('log-weight').addEventListener('click', () => {
    document.getElementById('weight-modal').style.display = 'block';
  });
}

function saveWeight() {
  const weight = parseFloat(document.getElementById('weight-input').value);
  userData.profile.weight = weight;
  userData.xp += 10; // Gamification: +10 XP
  localStorage.setItem('userData', JSON.stringify(userData));
  document.getElementById('bmi').textContent = calculateBMI();
  document.getElementById('weight-modal').style.display = 'none';
}

function initPage(page) {
  if (page === 'dashboard') initDashboard();
  if (page === 'profile') initProfile();
}

function initPrograms() {
  let totalCalories = 0;
  let totalProtein = 0;

  window.allowDrop = (e) => e.preventDefault();
  window.dragMeal = (e) => e.dataTransfer.setData('meal', e.target.dataset.meal);
  window.dropMeal = (e) => {
    e.preventDefault();
    const meal = JSON.parse(e.dataTransfer.getData('meal'));
    totalCalories += meal.calories;
    totalProtein += meal.protein;
    document.getElementById('total-calories').textContent = totalCalories;
    document.getElementById('total-protein').textContent = totalProtein;
    e.target.appendChild(document.createTextNode(`${meal.name} `));
  };
}

function initPage(page) {
  if (page === 'dashboard') initDashboard();
  if (page === 'profile') initProfile();
  if (page === 'programs') initPrograms();
}



function initCommunity() {
  let reactionCount = 0;
  window.react = (emoji) => {
    reactionCount++;
    document.querySelectorAll('#reaction-count').forEach(span => span.textContent = reactionCount);
  };

  document.getElementById('ask-tribe').addEventListener('click', () => {
    document.getElementById('ask-modal').style.display = 'block';
  });

  window.submitQuestion = () => {
    const question = document.getElementById('question-input').value;
    if (question) alert(`Question posted: ${question}`); // Mock submission
    document.getElementById('ask-modal').style.display = 'none';
  };
}

function initPage(page) {
  if (page === 'dashboard') initDashboard();
  if (page === 'profile') initProfile();
  if (page === 'programs') initPrograms();
  if (page === 'community') initCommunity();
}



function initLive() {
  window.joinLive = () => {
    document.getElementById('live-player').style.display = 'block';
  };

  window.sendChat = () => {
    const msg = document.getElementById('chat-input').value;
    if (msg) {
      const chat = document.getElementById('chat-messages');
      chat.innerHTML += `<p>${userData.profile.name}: ${msg}</p>`;
      document.getElementById('chat-input').value = '';
    }
  };

  document.getElementById('search-replays').addEventListener('input', (e) => {
    const filter = e.target.value.toLowerCase();
    document.querySelectorAll('.replay-grid div').forEach(replay => {
      replay.style.display = replay.textContent.toLowerCase().includes(filter) ? 'block' : 'none';
    });
  });
}

function initPage(page) {
  if (page === 'dashboard') initDashboard();
  if (page === 'profile') initProfile();
  if (page === 'programs') initPrograms();
  if (page === 'community') initCommunity();
  if (page === 'live') initLive();
}




function initRewards() {
  document.getElementById('xp-balance').textContent = userData.xp;

  window.redeemReward = (xpCost, reward) => {
    if (userData.xp >= xpCost) {
      userData.xp -= xpCost;
      localStorage.setItem('userData', JSON.stringify(userData));
      document.getElementById('xp-balance').textContent = userData.xp;
      alert(`Redeemed: ${reward}`);
    } else {
      alert('Not enough XP!');
    }
  };
}

function initPage(page) {
  if (page === 'dashboard') initDashboard();
  if (page === 'profile') initProfile();
  if (page === 'programs') initPrograms();
  if (page === 'community') initCommunity();
  if (page === 'live') initLive();
  if (page === 'rewards') initRewards();
}





