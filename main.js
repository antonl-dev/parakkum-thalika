// main.js
import { keys, setupMobileControls } from './input.js';
import { loadAllAssets, sprites } from './assets.js';
import { state, reset, spawn, updateUI } from './gameState.js';
import { render } from './renderer.js';

const canvas = document.getElementById('game');

// --- START: Resize Logic ---
function resizeGame() {
  // We make the canvas exactly the size of the window
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Optional: If the game is just starting, we might want to ensure 
  // entities are on screen, but the game loop bounds check handles most of it.
}

// Listen for window resize (and screen rotation)
window.addEventListener('resize', resizeGame);
// Call it once immediately to set initial size
resizeGame();
// --- END: Resize Logic ---

canvas.addEventListener('click', () => canvas.focus());

window.addEventListener('keydown', e => {
  if ((e.key === 'r' || e.key === 'R') && state.gameOver) {
    reset();
  }
});

function update() {
  if (state.gameOver) return;

  const player = state.player;
  const enemy = state.enemy;

  if (player.hidden && Date.now() > player.hideUntil) {
    player.hidden = false;
    updateUI();
  }

  const baseSpeed = 2.5;
  if (Date.now() > player.spedUpUntil) {
    player.speed = baseSpeed;
  } else {
    player.speed = baseSpeed * 1.6;
  }

  let dx = 0, dy = 0;
  if (keys['arrowup'] || keys['w']) dy -= 1;
  if (keys['arrowdown'] || keys['s']) dy += 1;
  if (keys['arrowleft'] || keys['a']) dx -= 1;
  if (keys['arrowright'] || keys['d']) dx += 1;
  
  if (dx || dy) {
    const inv = 1 / Math.hypot(dx, dy);
    dx *= inv;
    dy *= inv;
    player.x += dx * player.speed;
    player.y += dy * player.speed;
  }

  // UPDATED BOUNDS: Uses current canvas.width/height dynamically
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  let targetX, targetY;
  if (player.hidden) {
    if (!enemy.lastKnown) enemy.lastKnown = { x: player.x, y: player.y };
    targetX = enemy.lastKnown.x;
    targetY = enemy.lastKnown.y;
  } else {
    enemy.lastKnown = { x: player.x, y: player.y };
    targetX = player.x;
    targetY = player.y;
  }

  let ex = targetX - enemy.x;
  let ey = targetY - enemy.y;
  const dist = Math.hypot(ex, ey);
  if (dist > 1) {
    enemy.x += (ex / dist) * enemy.speed;
    enemy.y += (ey / dist) * enemy.speed;
  }

  if (!player.hidden) {
    const d = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (d < (player.size + enemy.size) * 0.45) {
      state.gameOver = true;
    }
  }

  for (let i = state.items.length - 1; i >= 0; i--) {
    const it = state.items[i];
    const d = Math.hypot((player.x + player.size / 2) - it.x, (player.y + player.size / 2) - it.y);
    
    if (d < 35) { // Increased pickup radius slightly for mobile
      if (it.type === 'fruit') {
        state.score += 5;
      } else if (it.sprite === sprites.potion_hide) {
        player.hidden = true;
        player.hideUntil = Date.now() + 5000;
      } else if (it.sprite === sprites.potion_speed) {
        player.spedUpUntil = Date.now() + 4000;
      }
      
      state.items.splice(i, 1);
      updateUI(); 

      if (Math.random() < 0.8) spawn('fruit');
      if (Math.random() < 0.05) spawn('potion_hide');
      if (Math.random() < 0.05) spawn('potion_speed');
    }
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

setupMobileControls();
loadAllAssets().then(() => {
  reset();
  loop();
});
