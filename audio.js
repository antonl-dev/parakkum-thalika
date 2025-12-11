// audio.js

// create the context immediately
const AudioContext = window.AudioContext || window.webkitAudioContext;
const actx = new AudioContext();









export function initAudio() {
  if (actx.state === 'suspended') {
    actx.resume();
  }
}

// Simple tone generator
function playTone(freq, type, duration) {
  // 1. Double check we are ready to play
  if (actx.state === 'suspended') {
    actx.resume();
  }

  const osc = actx.createOscillator();
  const gain = actx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, actx.currentTime);

  // Volume: Go loud (0.5) then fade out quickly
  gain.gain.setValueAtTime(0.5, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + duration);

  osc.connect(gain);
  gain.connect(actx.destination);

  osc.start();
  osc.stop(actx.currentTime + duration);
}

export function playCollectSound() {
  // High Ding
  playTone(1000, 'sine', 0.1);
}

export function playPowerupSound() {
  // Warble Sound (Low then High)
  playTone(300, 'square', 0.1);
  setTimeout(() => playTone(600, 'square', 0.2), 100);
}

export function playGameOverSound() {
  // Low Crash
  playTone(100, 'sawtooth', 0.4);
}
