// Use global App namespace
window.App = window.App || {};

App.renderStrategyList = function () {
  const strategyList = document.getElementById("strategy-list");
  strategyList.innerHTML = "";
  App.strategies.forEach((strategy) => {
    const card = document.createElement("div");
    card.className = "strategy-card";
    card.style.background = `linear-gradient(135deg, ${strategy.color}, ${strategy.color}99)`;
    card.innerHTML = `
      <h3>${strategy.name}</h3>
      <p>${strategy.description}</p>
    `;
    card.addEventListener("click", () => App.showStrategyDetails(strategy.id));
    strategyList.appendChild(card);
  });
};

App.renderStrategyDetails = function (strategyId) {
  const strategy = App.strategies.find((s) => s.id === strategyId);
  if (!strategy) return;

  document.getElementById("strategy-title").textContent = strategy.name;
  document.getElementById("strategy-description").textContent = strategy.description;

  const actionButtons = document.getElementById("action-buttons");
  actionButtons.innerHTML = "";
  strategy.actions.forEach((action) => {
    const button = document.createElement("button");
    button.className = "action-button";
    button.style.background = strategy.color;
    button.textContent = action;
    button.setAttribute("aria-label", `Record ${action} timestamp`);
    button.addEventListener("click", () => {
      App.saveTimestamp(strategyId, action);
      alert(`${action} recorded at ${new Date().toLocaleString()}`);
    });
    actionButtons.appendChild(button);
  });

  App.renderRating(strategyId);
  document.getElementById("strategy-list").classList.add("hidden");
  document.getElementById("strategy-details").classList.remove("hidden");
};

App.renderRating = function (strategyId) {
  const stars = document.querySelectorAll(".star");
  const currentRating = App.getRating(strategyId);
  stars.forEach((star) => {
    const value = parseInt(star.dataset.value);
    star.classList.toggle("selected", value <= currentRating);
    star.addEventListener("click", () => {
      App.saveRating(strategyId, value);
      App.renderRating(strategyId);
    });
  });
};

App.showStrategyList = function () {
  document.getElementById("strategy-details").classList.add("hidden");
  document.getElementById("strategy-list").classList.remove("hidden");
};

App.setupExportButton = function () {
  document.getElementById("export-data").addEventListener("click", () => {
    const emailBody = App.exportData();
    window.location.href = `mailto:?subject=Sleep%20Strategies%20Data&body=${emailBody}`;
  });
};