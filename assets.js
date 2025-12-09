// assets.js

export const sprites = {};

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
    img.onerror = () => {
        console.error("Failed to load image:", asset.src);
        resolve(); // Resolve anyway to prevent game hanging
    }
  });
}

export function loadAllAssets() {
  return Promise.all(assetsToLoad.map(loadSprite));
}
