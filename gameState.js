// gameState.js
import { sprites } from './assets.js';

const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const hiddenEl = document.getElementById('hidden');

// We use a single object 'state' so we can export it and modify it elsewhere
export const state = {
  score: 0,
  gameOver: false,
  items: [],
  player: { x: 60, y: 60, size: 32, speed: 2.5, hidden: false, hideUntil: 0, spedUpUntil: 0 },
  enemy: { x: 520, y: 260, size: 32, speed: 1.8, lastKnown: null }
};

const FRUIT_TYPES = ['fruit_apple', 'fruit_grapes', 'fruit_orange', 'fruit_watermelon'];

export function spawn(type) {
  let spriteName = type;
  if (type === 'fruit') {
    spriteName = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
  }

  state.items.push({
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    type: type,
    sprite: sprites[spriteName],
    size: 32
  });
}

export function reset() {
  state.score = 0;
  state.gameOver = false;
  
  // Reset Player
  state.player.x = 60;
  state.player.y = 60;
  state.player.hidden = false;
  state.player.hideUntil = 0;
  state.player.spedUpUntil = 0;
  
  // Reset Enemy
  state.enemy.x = 520;
  state.enemy.y = 260;
  state.enemy.lastKnown = null;
  
  // Reset Items
  state.items = [];
  for (let i = 0; i < 5; i++) spawn('fruit');
  spawn('potion_hide');
  spawn('potion_speed');
  
  // Update UI
  scoreEl.textContent = state.score;
  hiddenEl.textContent = '';
}

// Helper to update UI text from main loop
export function updateUI() {
    scoreEl.textContent = state.score;
    if (state.player.hidden) {
        hiddenEl.textContent = '(HIDDEN)';
    } else {
        hiddenEl.textContent = '';
    }
}
