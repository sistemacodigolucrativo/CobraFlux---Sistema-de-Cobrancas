/**
 * Independent Web Audio API Sound Engine for Golden Billing SaaS.
 * Starts disabled by default (respects browser autoplay restrictions)
 * and persists preferences cleanly.
 */

export type SoundEffectType =
  | 'tap'
  | 'navigate'
  | 'payment_success'
  | 'error'
  | 'notification'
  | 'signup_success'
  | 'cancel';

class GoldenAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private volume = 0.35;

  configure(enabled: boolean, volume: number) {
    this.enabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    delaySec = 0,
    gainScale = 1
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const targetGain = Math.max(0.001, this.volume * 0.16 * gainScale);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(targetGain, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  play(effect: SoundEffectType) {
    if (!this.enabled) return;
    switch (effect) {
      case 'tap':
        this.playTone(580, 0.055, 'sine', 0, 0.65);
        break;
      case 'navigate':
        this.playTone(440, 0.065, 'triangle', 0, 0.45);
        break;
      case 'payment_success':
        this.playTone(523.25, 0.14, 'sine', 0, 0.9); // C5
        this.playTone(659.25, 0.16, 'sine', 0.07, 0.9); // E5
        this.playTone(783.99, 0.28, 'sine', 0.14, 1.0); // G5
        break;
      case 'signup_success':
        this.playTone(493.88, 0.12, 'triangle', 0, 0.8);
        this.playTone(739.99, 0.24, 'triangle', 0.09, 0.9);
        break;
      case 'notification':
        this.playTone(880, 0.15, 'sine', 0, 0.7);
        this.playTone(1046.5, 0.18, 'sine', 0.08, 0.6);
        break;
      case 'error':
        this.playTone(240, 0.12, 'sawtooth', 0, 0.55);
        this.playTone(190, 0.16, 'sawtooth', 0.09, 0.5);
        break;
      case 'cancel':
        this.playTone(340, 0.09, 'sine', 0, 0.5);
        this.playTone(280, 0.11, 'sine', 0.06, 0.45);
        break;
    }
  }
}

export const soundEngine = new GoldenAudioEngine();
