// Use global App namespace
window.App = window.App || {};

App.saveTimestamp = function (strategyId, action) {
  const timestamp = new Date().toISOString();
  const key = `strategy_${strategyId}_timestamps`;
  const timestamps = JSON.parse(localStorage.getItem(key) || "[]");
  timestamps.push({ action, timestamp });
  localStorage.setItem(key, JSON.stringify(timestamps));
};

App.getTimestamps = function (strategyId) {
  const key = `strategy_${strategyId}_timestamps`;
  return JSON.parse(localStorage.getItem(key) || "[]");
};

App.saveRating = function (strategyId, rating) {
  localStorage.setItem(`strategy_${strategyId}_rating`, rating);
};

App.getRating = function (strategyId) {
  return parseInt(localStorage.getItem(`strategy_${strategyId}_rating`) || "0");
};

App.exportData = function () {
  let emailBody = "Sleep Strategies Data\n\n";
  App.strategies.forEach((strategy) => {
    emailBody += `Strategy: ${strategy.name}\n`;
    emailBody += `Rating: ${App.getRating(strategy.id)} stars\n`;
    const timestamps = App.getTimestamps(strategy.id);
    emailBody += "Timestamps:\n";
    timestamps.forEach(({ action, timestamp }) => {
      emailBody += `- ${action}: ${new Date(timestamp).toLocaleString()}\n`;
    });
    emailBody += "\n";
  });
  return encodeURIComponent(emailBody);
};