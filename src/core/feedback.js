export class Feedback {
  constructor(store) {
    this.store = store;
    this.context = null;
  }

  get enabled() {
    return this.store.state.settings.sound;
  }

  toggle() {
    this.store.update((state) => {
      state.settings.sound = !state.settings.sound;
    });
  }

  tone(frequency, duration, delay = 0, volume = 0.035) {
    if (!this.enabled || !window.AudioContext) return;
    this.context ??= new AudioContext();
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  wrong() {
    this.tone(130, 0.09, 0, 0.025);
    navigator.vibrate?.(18);
  }

  correct() {
    this.tone(440, 0.13);
    this.tone(660, 0.18, 0.07);
    navigator.vibrate?.([12, 35, 18]);
  }
}
