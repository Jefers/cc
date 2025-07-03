import { game } from './game.js';
import { clearGame } from './storage.js';

document.querySelectorAll('.inventory-item').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.inventory-item').forEach((btn) => btn.setAttribute('aria-selected', 'false'));
    button.setAttribute('aria-selected', 'true');
    game.setSelectedBlock(button.dataset.block);
  });
});

document.querySelector('.pause-button').addEventListener('click', () => {
  game.pause();
  window.location.href = 'index.html';
});

document.querySelector('.reset-button').addEventListener('click', () => {
  game.reset();
  clearGame();
  window.location.href = 'index.html';
});