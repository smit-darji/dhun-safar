// Dhun Safar - Audio Player & Web Audio API Synthesizers

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Truck Horn - Real Indian Truck Air Horn Audio (/horn.mp3)
export function playTruckHorn() {
  try {
    const hornAudio = new Audio('/horn.mp3');
    hornAudio.volume = 0.95;
    hornAudio.play().catch((err) => {
      console.log('Truck horn audio play fallback to /sounds/horn.mp3:', err);
      const fallbackAudio = new Audio('/sounds/horn.mp3');
      fallbackAudio.play().catch(() => playTruckHornSynth());
    });
  } catch (e) {
    playTruckHornSynth();
  }
}

// Fallback Synth for Dhoom Bike / Horn Tune
function playTruckHornSynth() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const notes = [
    { freq: 349.23, duration: 0.18 },
    { freq: 392.00, duration: 0.18 },
    { freq: 415.30, duration: 0.22 },
    { freq: 523.25, duration: 0.35 },
    { freq: 466.16, duration: 0.18 },
    { freq: 415.30, duration: 0.18 },
    { freq: 392.00, duration: 0.40 }
  ];

  let timeOffset = 0;

  notes.forEach((n) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(n.freq, now + timeOffset);
    osc2.frequency.setValueAtTime(n.freq * 1.005, now + timeOffset);

    gain.gain.setValueAtTime(0, now + timeOffset);
    gain.gain.linearRampToValueAtTime(0.4, now + timeOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + n.duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now + timeOffset);
    osc2.start(now + timeOffset);

    osc1.stop(now + timeOffset + n.duration);
    osc2.stop(now + timeOffset + n.duration);

    timeOffset += n.duration * 0.9;
  });
}

// 2. Barber Salon Scissors Snip-Snip & Spray Bottle Sound
export function playSalonScissorsSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  for (let s = 0; s < 3; s++) {
    const t = now + s * 0.12;

    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000 + s * 500, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.04);
  }
}

// 3. Mistry Carpenter Workshop Sound (Hammer & Saw Rhythmic Synth)
export function playMistryCarpenterSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.15);

  const bufferSize = ctx.sampleRate * 0.2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1500, now + 0.15);
  filter.Q.setValueAtTime(3, now + 0.15);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3, now + 0.15);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now + 0.15);
  noise.stop(now + 0.35);
}

// 4. Auto Rickshaw Two-Stroke Engine Poo-Poo Horn Sound
export function playRickshawSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.14;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(540, t);
    osc2.frequency.setValueAtTime(546, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(t);
    osc2.start(t);

    osc1.stop(t + 0.1);
    osc2.stop(t + 0.1);
  }
}

// 5. Office Sound (Keyboard & Chai Slurp Synth)
export function playOfficeSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  for (let i = 0; i < 4; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200 + Math.random() * 400, now + i * 0.08);

    gain.gain.setValueAtTime(0.2, now + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.04);
  }
}

// 6. Spiritual Temple Bell Sound
export function playPeaceBellSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const freqs = [523.25, 659.25, 783.99, 1046.50];

  freqs.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.5);
  });
}

// 7. Travel Engine Sound
export function playTravelEngineSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.8);
  osc.frequency.exponentialRampToValueAtTime(150, now + 1.2);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.8);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.2);
}
