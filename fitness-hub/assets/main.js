const userData = JSON.parse(localStorage.getItem('userData')) || {
  profile: { name: "", age: null, weight: null, height: null },
  goals: [],
  xp: 0,
  upsellHistory: []
};

function loadPage(page) {
  fetch(`${page}.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('app').innerHTML = html;
      renderNav(page);
      initPage(page);
    });
}

function renderNav(activePage) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'programs', label: 'Programs', icon: '💪' },
    { id: 'community', label: 'Community', icon: '🌐' },
    { id: 'live', label: 'Live', icon: '📡' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' }
  ];
  const nav = `
    <nav class="bottom-nav">
      ${navItems.map(item => `
        <button onclick="loadPage('${item.id}')" class="${activePage === item.id ? 'active' : ''}">
          <span>${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>`;
  document.getElementById('app').insertAdjacentHTML('beforeend', nav);
}

document.getElementById('login-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = e.target[0].value;
  const password = e.target[1].value;
  if (username === 'demo' && password === 'pass123') {
    loadPage('dashboard');
  } else {
    document.getElementById('login-error').textContent = 'Invalid credentials';
  }
});

function initPage(page) {
  if (page === 'dashboard') initDashboard();
  if (page === 'profile') initProfile();
  if (page === 'programs') initPrograms();
  if (page === 'community') initCommunity();
  if (page === 'live') initLive();
  if (page === 'rewards') initRewards();
}

function initDashboard() {
  document.getElementById('user-name').textContent = userData.profile.name || 'User';
  document.getElementById('age').textContent = userData.profile.age || 'N/A';
  document.getElementById('bmi').textContent = calculateBMI();
  document.getElementById('xp-progress').value = userData.xp;
  document.getElementById('log-weight').addEventListener('click', () => {
    document.getElementById('weight-modal').style.display = 'block';
  });
}

function calculateBMI() {
  const { weight, height } = userData.profile;
  if (weight && height) return (weight / ((height / 100) ** 2)).toFixed(1);
  return 'N/A';
}

function saveWeight() {
  const weight = parseFloat(document.getElementById('weight-input').value);
  userData.profile.weight = weight;
  userData.xp += 10;
  localStorage.setItem('userData', JSON.stringify(userData));
  document.getElementById('bmi').textContent = calculateBMI();
  document.getElementById('xp-progress').value = userData.xp;
  document.getElementById('weight-modal').style.display = 'none';
}

function initProfile() {
  const form = document.getElementById('profile-form');
  form.name.value = userData.profile.name;
  form.age.value = userData.profile.age || '';
  form.weight.value = userData.profile.weight || '';
  form.height.value = userData.profile.height || '';
  form.goals.value = userData.goals[0] || 'Weight Loss';
  if (localStorage.getItem('avatar')) {
    document.getElementById('avatar-preview').src = localStorage.getItem('avatar');
    document.getElementById('avatar-preview').style.display = 'block';
  }
  document.getElementById('avatar-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('avatar-preview').src = reader.result;
      document.getElementById('avatar-preview').style.display = 'block';
      localStorage.setItem('avatar', reader.result);
    };
    reader.readAsDataURL(file);
  });
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

function initPrograms() {
  let totalCalories = 0, totalProtein = 0;
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

function initCommunity() {
  let reactionCount1 = 0, reactionCount2 = 0;
  window.react = (emoji) => {
    reactionCount1++;
    reactionCount2++;
    document.getElementById('reaction-count-1').textContent = reactionCount1;
    document.getElementById('reaction-count-2').textContent = reactionCount2;
  };
  document.getElementById('ask-tribe').addEventListener('click', () => {
    document.getElementById('ask-modal').style.display = 'block';
  });
  window.submitQuestion = () => {
    const question = document.getElementById('question-input').value;
    if (question) alert(`Question posted: ${question}`);
    document.getElementById('ask-modal').style.display = 'none';
  };
}

function initLive() {
  window.joinLive = () => document.getElementById('live-player').style.display = 'block';
  window.sendChat = () => {
    const msg = document.getElementById('chat-input').value;
    if (msg) {
      document.getElementById('chat-messages').innerHTML += `<p>${userData.profile.name}: ${msg}</p>`;
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