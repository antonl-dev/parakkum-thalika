const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const hiddenEl = document.getElementById('hidden');

let score = 0;
let gameOver = false;

// Player and enemy objects
const player = { x: 60, y: 60, size: 20, speed: 2.5, hidden: false, hideUntil: 0 };
const enemy  = { x: 520, y: 260, size: 22, speed: 1.8, lastKnown: null };

// Items array
let items = []; // {x,y,type} type: 'fruit'|'potion'

// Simple input handling
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup',   e => keys[e.key.toLowerCase()] = false);

// Click to focus canvas so it receives keyboard input
canvas.addEventListener('click', () => canvas.focus());

// Spawn an item of a given type
function spawn(type) {
  items.push({
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    type
  });
}

// Reset the game to its initial state
function reset() {
  score = 0;
  gameOver = false;
  player.x = 60;
  player.y = 60;
  player.hidden = false;
  player.hideUntil = 0;
  enemy.x = 520;
  enemy.y = 260;
  items = [];
  for (let i = 0; i < 5; i++) spawn('fruit');
  spawn('potion');
  scoreEl.textContent = score;
  hiddenEl.textContent = '';
}

// Restart game on 'R' key press if game is over
window.addEventListener('keydown', e => {
  if ((e.key === 'r' || e.key === 'R') && gameOver) {
    reset();
  }
});

// Main game loop
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

// Update game state
function update() {
  if (gameOver) return;

  // Player movement
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

  // Clamp player position to canvas boundaries
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // Check if player's hidden status has expired
  if (player.hidden && Date.now() > player.hideUntil) {
    player.hidden = false;
    hiddenEl.textContent = '';
  }

  // Enemy AI: chases player's last known position
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

  // Move enemy toward its target
  let ex = targetX - enemy.x;
  let ey = targetY - enemy.y;
  const dist = Math.hypot(ex, ey);
  if (dist > 1) {
    enemy.x += (ex / dist) * enemy.speed;
    enemy.y += (ey / dist) * enemy.speed;
  }

  // Check collision with enemy (only when player is visible)
  if (!player.hidden) {
    const d = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (d < (player.size + enemy.size) * 0.45) {
      gameOver = true;
    }
  }

  // Check for item pickup
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    const d = Math.hypot((player.x + player.size / 2) - it.x, (player.y + player.size / 2) - it.y);
    if (d < 20) {
      if (it.type === 'fruit') {
        score += 5;
      }
      if (it.type === 'potion') {
        player.hidden = true;
        player.hideUntil = Date.now() + 5000; // Hide for 5 seconds
        hiddenEl.textContent = '(HIDDEN)';
      }
      items.splice(i, 1);
      
      // Respawn items occasionally
      if (Math.random() < 0.8) spawn('fruit');
      if (Math.random() < 0.05) spawn('potion');
    }
  }

  scoreEl.textContent = score;
}

// Render the game frame
function render() {
  // Background
  ctx.fillStyle = '#223';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Items
  for (const it of items) {
    ctx.beginPath();
    if (it.type === 'fruit') {
      ctx.fillStyle = 'orange';
      ctx.arc(it.x, it.y, 8, 0, Math.PI * 2);
    } else { // Potion
      ctx.fillStyle = 'cyan';
      ctx.arc(it.x, it.y, 9, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Player
  ctx.fillStyle = player.hidden ? 'rgba(0,255,200,0.4)' : 'lime';
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Enemy
  ctx.fillStyle = 'red';
  ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

  // Game Over screen
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Impact';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT! Score: ' + score, canvas.width / 2, canvas.height / 2);
    
    ctx.font = '16px Arial';
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 30);
  }
}

// Initialize and start the game
reset();
requestAnimationFrame(loop);
