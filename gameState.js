// gameState.js
import { sprites } from './assets.js';

const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const hiddenEl = document.getElementById('hidden');

export const state = {
  score: 0,
  gameOver: false,
  items: [],
  player: { x: 0, y: 0, size: 32, speed: 2.5, hidden: false, hideUntil: 0, spedUpUntil: 0 },
  enemy: { x: 0, y: 0, size: 32, speed: 1.8, lastKnown: null }
};

const FRUIT_TYPES = ['fruit_apple', 'fruit_grapes', 'fruit_orange', 'fruit_watermelon'];

export function spawn(type) {
  let spriteName = type;
  if (type === 'fruit') {
    spriteName = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
  }

  // Ensure items spawn within the CURRENT visible canvas
  state.items.push({
    x: Math.random() * (canvas.width - 60) + 30,
    y: Math.random() * (canvas.height - 60) + 30,
    type: type,
    sprite: sprites[spriteName],
    size: 32
  });
}

export function reset() {
  state.score = 0;
  state.gameOver = false;
  
  // CHANGED: Use relative positions (percentages)
  // Player spawns at 10% width, 10% height
  state.player.x = canvas.width * 0.1; 
  state.player.y = canvas.height * 0.2;
  state.player.hidden = false;
  state.player.hideUntil = 0;
  state.player.spedUpUntil = 0;
  
  // CHANGED: Enemy spawns at 80% width, 50% height
  state.enemy.x = canvas.width * 0.8;
  state.enemy.y = canvas.height * 0.5;
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

export function updateUI() {
    scoreEl.textContent = state.score;
    if (state.player.hidden) {
        hiddenEl.textContent = '(HIDDEN)';
    } else {
        hiddenEl.textContent = '';
    }
}
