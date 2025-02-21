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
i