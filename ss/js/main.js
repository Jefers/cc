import { renderStrategyList, renderStrategyDetails, showStrategyList, setupExportButton } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  renderStrategyList();
  setupExportButton();

  // Add back button functionality
  document.addEventListener("click", (e) => {
    if (e.target.id === "strategy-details" || e.target.closest("#strategy-details")) return;
    if (!document.getElementById("strategy-details").classList.contains("hidden")) {
      showStrategyList();
    }
  });
});