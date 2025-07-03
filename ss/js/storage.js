function saveTimestamp(strategyId, action) {
  const timestamp = new Date().toISOString();
  const key = `strategy_${strategyId}_timestamps`;
  const timestamps = JSON.parse(localStorage.getItem(key) || "[]");
  timestamps.push({ action, timestamp });
  localStorage.setItem(key, JSON.stringify(timestamps));
}

function getTimestamps(strategyId) {
  const key = `strategy_${strategyId}_timestamps`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveRating(strategyId, rating) {
  localStorage.setItem(`strategy_${strategyId}_rating`, rating);
}

function getRating(strategyId) {
  return parseInt(localStorage.getItem(`strategy_${strategyId}_rating`) || "0");
}

function exportData() {
  let emailBody = "Sleep Strategies Data\n\n";
  strategies.forEach((strategy) => {
    emailBody += `Strategy: ${strategy.name}\n`;
    emailBody += `Rating: ${getRating(strategy.id)} stars\n`;
    const timestamps = getTimestamps(strategy.id);
    emailBody += "Timestamps:\n";
    timestamps.forEach(({ action, timestamp }) => {
      emailBody += `- ${action}: ${new Date(timestamp).toLocaleString()}\n`;
    });
    emailBody += "\n";
  });
  return encodeURIComponent(emailBody);
}

export { saveTimestamp, getTimestamps, saveRating, getRating, exportData };