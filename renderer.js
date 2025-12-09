// renderer.js
import { state } from './gameState.js';
import { sprites } from './assets.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

export function render() {
  // 1. Background
  ctx.fillStyle = '#223';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Items
  for (const it of state.items) {
    ctx.drawImage(it.sprite, it.x - it.size / 2, it.y - it.size / 2, it.size, it.size);
  }

  // 3. Player
  ctx.save();
  if (state.player.hidden) {
    ctx.globalAlpha = 0.5;
  }
  ctx.drawImage(sprites.player, state.player.x, state.player.y, state.player.size, state.player.size);
  ctx.restore();

  // 4. Enemy
  ctx.drawImage(sprites.enemy, state.enemy.x, state.enemy.y, state.enemy.size, state.enemy.size);

  // 5. Game Over Screen
  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Impact';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT! Score: ' + state.score, canvas.width / 2, canvas.height / 2);
    
    ctx.font = '16px Arial';
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 30);
  }
}
