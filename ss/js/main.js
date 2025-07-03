// Use global App namespace
window.App = window.App || {};

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, rendering strategies...");
  App.renderStrategyList();
  App.setupExportButton();

  // Add back button functionality
  document.addEventListener("click", (e) => {
    if (e.target.id === "strategy-details" || e.target.closest("#strategy-details")) return;
    if (!document.getElementById("strategy-details").classList.contains("hidden")) {
      App.showStrategyList();
    }
  });
});