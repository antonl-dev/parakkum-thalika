const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const hiddenEl = document.getElementById('hidden');

// --- START: Image Loading ---
const sprites = {};
const assetsToLoad = [
  { name: 'player', src: 'img/player.png' },
  { name: 'enemy', src: 'img/enemy.png' },
  { name: 'fruit_apple', src: 'img/fruit_apple.png' },
  { name: 'fruit_grapes', src: 'img/fruit_grapes.png' },
  { name: 'fruit_orange', src: 'img/fruit_orange.png' },
  { name: 'fruit_watermelon', src: 'img/fruit_watermelon.png' },
  { name: 'potion_hide', src: 'img/potion_hide.png' },
  { name: 'potion_speed', src: 'img/potion_speed.png' },
];

function loadSprite(asset) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = asset.src;
    img.onload = () => {
      sprites[asset.name] = img;
      resolve();
    };
  });
}
// --- END: Image Loading ---

let score = 0;
let gameOver = false;

// Player and enemy objects - adjusted size for sprites
const player = { x: 60, y: 60, size: 32, speed: 2.5, hidden: false, hideUntil: 0, spedUpUntil: 0 };
const enemy  = { x: 520, y: 260, size: 32, speed: 1.8, lastKnown: null };

// Items array - will now store more info
let items = []; // {x, y, type, sprite, size}

const FRUIT_TYPES = ['fruit_apple', 'fruit_grapes', 'fruit_orange', 'fruit_watermelon'];
const POTION_TYPES = ['potion_hide', 'potion_speed'];

// Simple input handling
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup',   e => keys[e.key.toLowerCase()] = false);

// Click to focus canvas so it receives keyboard input
canvas.addEventListener('click', () => canvas.focus());

// Spawn an item of a given type
function spawn(type) {
  let spriteName = type;
  if (type === 'fruit') {
    spriteName = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
  }

  items.push({
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    type: type, // 'fruit', 'potion_hide', 'potion_speed'
    sprite: sprites[spriteName],
    size: 32 // <-- ADDED: Gives items a consistent size
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
  player.spedUpUntil = 0;
  enemy.x = 520;
  enemy.y = 260;
  items = [];
  for (let i = 0; i < 5; i++) spawn('fruit');
  spawn('potion_hide');
  spawn('potion_speed');
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

  // Check if player's hidden status has expired
  if (player.hidden && Date.now() > player.hideUntil) {
    player.hidden = false;
    hiddenEl.textContent = '';
  }

  // Check if speed boost has expired
  const baseSpeed = 2.5;
  if (Date.now() > player.spedUpUntil) {
    player.speed = baseSpeed;
  } else {
    player.speed = baseSpeed * 1.6; // 60% faster
  }

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
    if (d < 25) { // Slightly larger pickup radius
      if (it.type === 'fruit') {
        score += 5;
      } else if (it.sprite === sprites.potion_hide) {
        player.hidden = true;
        player.hideUntil = Date.now() + 5000; // Hide for 5 seconds
        hiddenEl.textContent = '(HIDDEN)';
      } else if (it.sprite === sprites.potion_speed) {
        player.spedUpUntil = Date.now() + 4000; // Speed boost for 4 seconds
      }
      items.splice(i, 1);
      
      // Respawn items occasionally
      if (Math.random() < 0.8) spawn('fruit');
      if (Math.random() < 0.05) spawn('potion_hide');
      if (Math.random() < 0.05) spawn('potion_speed');
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
    // UPDATED: Draw with the consistent size property
    ctx.drawImage(it.sprite, it.x - it.size / 2, it.y - it.size / 2, it.size, it.size);
  }

  // Player
  ctx.save(); // Save current context state
  if (player.hidden) {
    ctx.globalAlpha = 0.5; // Make player transparent if hidden
  }
  ctx.drawImage(sprites.player, player.x, player.y, player.size, player.size);
  ctx.restore(); // Restore context state (removes transparency)

  // Enemy
  ctx.drawImage(sprites.enemy, enemy.x, enemy.y, enemy.size, enemy.size);

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

// --- Initialize and start the game AFTER images are loaded ---
Promise.all(assetsToLoad.map(loadSprite)).then(() => {
    reset();
    requestAnimationFrame(loop);
});


// --- Mobile controls code remains the same ---
function setupMobileControls() {
  const keyMap = [
    { id: 'dpad-up',    key: 'arrowup' },
    { id: 'dpad-down',  key: 'arrowdown' },
    { id: 'dpad-left',  key: 'arrowleft' },
    { id: 'dpad-right', key: 'arrowright' }
  ];

  keyMap.forEach(({ id, key }) => {
    const button = document.getElementById(id);
    if (!button) return;
    const press = (e) => {
      e.preventDefault();
      keys[key] = true;
      button.classList.add('active');
    };
    const release = (e) => {
      e.preventDefault();
      keys[key] = false;
      button.classList.remove('active');
    };
    button.addEventListener('touchstart', press, { passive: false });
    button.addEventListener('touchend', release, { passive: false });
    button.addEventListener('touchcancel', release, { passive: false });
    button.addEventListener('mousedown', press);
    button.addEventListener('mouseup', release);
    button.addEventListener('mouseleave', release);
  });
}

setupMobileControls();
