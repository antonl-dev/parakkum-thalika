// audio.js

const AudioContext = window.AudioContext || window.webkitAudioContext;
const actx = new AudioContext();

// Helper: Try to wake up the audio engine if it's sleeping
function wakeUpAudio() {
  if (actx.state === 'suspended') {
    actx.resume().catch(e => console.log("Audio resume failed:", e));
  }
}

// Ensure audio tries to start immediately (though browsers block it until a click)
wakeUpAudio();

function playTone(freq, duration, type = 'sine', vol = 0.3) {
  wakeUpAudio(); // Try to wake up every time a sound plays

  const osc = actx.createOscillator();
  const gain = actx.createGain();

  osc.type = type; 
  osc.frequency.setValueAtTime(freq, actx.currentTime);
  
  // Louder volume (0.3 instead of 0.1)
  gain.gain.setValueAtTime(vol, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + duration);

  osc.connect(gain);
  gain.connect(actx.destination);

  osc.start();
  osc.stop(actx.currentTime + duration);
}

export function playCollectSound() {
  // Louder Fruit "Ding"
  playTone(880, 0.1, 'sine', 0.3); 
  setTimeout(() => playTone(1760, 0.2, 'sine', 0.3), 50); 
}

export function playPowerupSound() {
  wakeUpAudio();
  
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, actx.currentTime);
  osc.frequency.linearRampToValueAtTime(800, actx.currentTime + 0.3); 
  
  // Louder Powerup
  gain.gain.setValueAtTime(0.2, actx.currentTime);
  gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(actx.destination);
  
  osc.start();
  osc.stop(actx.currentTime + 0.3);
}

export function playGameOverSound() {
  wakeUpAudio();

  const osc = actx.createOscillator();
  const gain = actx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, actx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, actx.currentTime + 0.5); 
  
  // Louder Crash
  gain.gain.setValueAtTime(0.5, actx.currentTime);
  gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(actx.destination);
  
  osc.start();
  osc.stop(actx.currentTime + 0.5);
}

// Export a manual init function for the main file to use
export function initAudio() {
  wakeUpAudio();
}
