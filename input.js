// input.js

export const keys = {};

// Keyboard listeners
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup',   e => keys[e.key.toLowerCase()] = false);

// Setup Mobile D-Pad
export function setupMobileControls() {
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
