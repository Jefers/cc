export function saveGame({ world, player, timer }) {
  const gameState = {
    world,
    player,
    timer,
    lastSaved: new Date().toISOString(),
  };
  localStorage.setItem('pinecraft', JSON.stringify(gameState));
}

export function loadGame() {
  const saved = localStorage.getItem('pinecraft');
  return saved ? JSON.parse(saved) : null;
}

export function clearGame() {
  localStorage.removeItem('pinecraft');
}