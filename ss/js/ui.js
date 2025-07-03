import { strategies } from "./data.js";
import { saveTimestamp, saveRating, getRating, exportData } from "./storage.js";

function renderStrategyList() {
  const strategyList = document.getElementById("strategy-list");
  strategyList.innerHTML = "";
  strategies.forEach((strategy) => {
    const card = document.createElement("div");
    card.className = "strategy-card";
    card.style.background = `linear-gradient(135deg, ${strategy.color}, ${strategy.color}99)`;
    card.innerHTML = `
      <h3>${strategy.name}</h3>
      <p>${strategy.description}</p>
    `;
    card.addEventListener("click", () => showStrategyDetails(strategy.id));
    strategyList.appendChild(card);
  });
}

function renderStrategyDetails(strategyId) {
  const strategy = strategies.find((s) => s.id === strategyId);
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
      saveTimestamp(strategyId, action);
      alert(`${action} recorded at ${new Date().toLocaleString()}`);
    });
    actionButtons.appendChild(button);
  });

  renderRating(strategyId);
  document.getElementById("strategy-list").classList.add("hidden");
  document.getElementById("strategy-details").classList.remove("hidden");
}

function renderRating(strategyId) {
  const stars = document.querySelectorAll(".star");
  const currentRating = getRating(strategyId);
  stars.forEach((star) => {
    const value = parseInt(star.dataset.value);
    star.classList.toggle("selected", value <= currentRating);
    star.addEventListener("click", () => {
      saveRating(strategyId, value);
      renderRating(strategyId);
    });
  });
}

function showStrategyList() {
  document.getElementById("strategy-details").classList.add("hidden");
  document.getElementById("strategy-list").classList.remove("hidden");
}

function setupExportButton() {
  document.getElementById("export-data").addEventListener("click", () => {
    const emailBody = exportData();
    window.location.href = `mailto:?subject=Sleep%20Strategies%20Data&body=${emailBody}`;
  });
}

export { renderStrategyList, renderStrategyDetails, showStrategyList, setupExportButton };