import { saveGame, loadGame } from './storage.js';

export class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20; // 20x20 grid
    this.cellSize = this.canvas.width / this.gridSize;
    this.world = [];
    this.player = { x: 10, y: 10, selectedBlock: 'grass' };
    this.timer = { seconds: 0, running: false };
    this.textures = {
      grass: new Image(),
      dirt: new Image(),
      stone: new Image(),
    };
    this.textures.grass.src = 'assets/grass.png';
    this.textures.dirt.src = 'assets/dirt.png';
    this.textures.stone.src = 'assets/stone.png';
    this.init();
  }

  init() {
    // Initialize world (20x20 grid)
    this.world = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill('grass'));
    const saved = loadGame();
    if (saved) {
      this.world = saved.world;
      this.player = saved.player;
      this.timer.seconds = saved.timer.seconds;
    }
    this.timer.running = true;
    this.updateTimer();
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw world
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const block = this.world[y][x];
        const img = this.textures[block];
        if (img.complete) {
          this.ctx.drawImage(img, x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        } else {
          // Fallback colors
          this.ctx.fillStyle = block === 'grass' ? '#55aa55' : block === 'dirt' ? '#8b4513' : '#808080';
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }
    // Draw player
    this.ctx.fillStyle = '#ff5555';
    this.ctx.fillRect(
      this.player.x * this.cellSize,
      this.player.y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  updateTimer() {
    if (this.timer.running) {
      this.timer.seconds++;
      const hours = Math.floor(this.timer.seconds / 3600);
      const minutes = Math.floor((this.timer.seconds % 3600) / 60);
      document.querySelector('.timer').textContent = `Time: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    setTimeout(() => this.updateTimer(), 1000);
  }

  handleInteraction(x, y) {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);
    if (
      gridX >= 0 &&
      gridX < this.gridSize &&
      gridY >= 0 &&
      gridY < this.gridSize &&
      (Math.abs(gridX - this.player.x) <= 1 && Math.abs(gridY - this.player.y) <= 1)
    ) {
      this.world[gridY][gridX] = this.player.selectedBlock;
      this.render();
      saveGame({ world: this.world, player: this.player, timer: this.timer });
    }
  }

  setupEventListeners() {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      this.handleInteraction(x, y);
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleInteraction(x, y);
    });
  }

  setSelectedBlock(block) {
    this.player.selectedBlock = block;
  }

  pause() {
    this.timer.running = false;
    saveGame({ world: this.world, player: this.player, timer: this.timer });
  }

  reset() {
    this.timer.seconds = 0;
    this.timer.running = false;
    this.world = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill('grass'));
    this.player = { x: 10, y: 10, selectedBlock: 'grass' };
  }
}

export const game = new Game('gameCanvas');