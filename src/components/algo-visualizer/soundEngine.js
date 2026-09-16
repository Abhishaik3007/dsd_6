// Lightweight Web Audio API Harmonic Sonification Engine
// Uses pentatonic frequencies to produce pleasant, musical tones during algorithm execution

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.pentatonicScale = [
      130.81, 146.83, 164.81, 196.00, 220.00, // C3 - A3
      261.63, 293.66, 329.63, 392.00, 440.00, // C4 - A4
      523.25, 587.33, 659.25, 783.99, 880.00, // C5 - A5
      1046.50, 1174.66, 1318.51, 1567.98       // C6 - G6
    ];
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  // Play a note mapped to a normalized value 0.0 - 1.0 (or array element value)
  playTone(val, minVal = 5, maxVal = 100, durationMs = 60) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const norm = Math.max(0, Math.min(1, (val - minVal) / Math.max(1, (maxVal - minVal))));
      const scaleIndex = Math.floor(norm * (this.pentatonicScale.length - 1));
      const freq = this.pentatonicScale[scaleIndex] || 440;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle'; // pleasant, soft chime tone
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Smooth attack & decay to prevent clicking
      const startTime = this.ctx.currentTime;
      const endTime = startTime + Math.max(0.04, durationMs / 1000);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(endTime);
    } catch {
      // Audio autoplay policy safety fallback
    }
  }

  // Dual tone for race finishes or celebrations
  playSuccessChime() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        const startTime = this.ctx.currentTime + idx * 0.08;
        const endTime = startTime + 0.25;

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
