export class TypingSession {
  constructor(target) {
    this.target = target;
    this.input = "";
    this.startedAt = 0;
    this.finishedAt = 0;
    this.keystrokes = 0;
    this.mistakes = 0;
    this.createdAt = performance.now();
    this.resets = 0;
  }

  recordInsertion(value) {
    if (!value) return;
    let offset = 0;
    for (const character of value) {
      if (!this.startedAt) this.startedAt = performance.now();
      if (character !== this.target[this.input.length + offset]) this.mistakes += 1;
      this.keystrokes += 1;
      offset += 1;
    }
  }

  update(value) {
    this.input = value.slice(0, this.target.length);
    if (this.complete && !this.finishedAt) this.finishedAt = performance.now();
  }

  get complete() {
    return this.input === this.target;
  }

  get stats() {
    const end = this.finishedAt || performance.now();
    const minutes = this.startedAt ? Math.max((end - this.startedAt) / 60000, 1 / 600) : 0;
    const correct = Math.max(0, this.keystrokes - this.mistakes);
    return {
      wpm: minutes ? Math.round(correct / 5 / minutes) : 0,
      accuracy: this.keystrokes ? Math.round(correct / this.keystrokes * 100) : 100,
    };
  }

  get evidence() {
    const stats = this.stats;
    const durationMs = (this.finishedAt || performance.now()) - this.createdAt;
    return {
      firstTry: this.mistakes === 0,
      mistakes: this.mistakes,
      accuracy: stats.accuracy,
      durationMs,
      impulsive: false,
    };
  }
}

export class ChoiceSession {
  constructor(answer) {
    this.answer = answer;
    this.selected = null;
    this.attempts = 0;
    this.complete = false;
    this.createdAt = performance.now();
    this.selections = [];
  }

  choose(value) {
    this.selected = value;
    this.attempts += 1;
    this.selections.push(value);
    this.complete = value === this.answer;
    return this.complete;
  }

  get evidence() {
    const durationMs = performance.now() - this.createdAt;
    return {
      firstTry: this.attempts === 1,
      mistakes: Math.max(0, this.attempts - 1),
      accuracy: this.attempts ? Math.round(100 / this.attempts) : 0,
      durationMs,
      impulsive: durationMs < 350,
    };
  }
}

export function createSession(exercise) {
  if (exercise.kind === "typing") return new TypingSession(exercise.code);
  if (exercise.kind === "choice") return new ChoiceSession(exercise.answer);
  throw new TypeError(`Unknown exercise kind: ${exercise.kind}`);
}
