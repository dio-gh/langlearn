const fallbackDuration = Object.freeze({
  typing: 30_000,
  choice: 18_000,
});

export const idleAfterMs = 60_000;

function deficit(target, actual) {
  return Math.max(0, Math.ceil(target - actual));
}

export function remainingProbeCount(status) {
  if (status.mastered) return 0;
  const { policy, record } = status;
  const distinct = Object.keys(record.seeds).length;
  const span = record.firstRound === null
    ? 0
    : (record.lastRound ?? record.firstRound) - record.firstRound;
  const facets = Object.values(record.facets).filter((value) => value.clean > value.fail).length;
  const recent = record.recent.filter(Boolean).length;
  return Math.max(
    1,
    deficit(policy.distinct, distinct),
    deficit(policy.strong, record.strong),
    deficit(policy.span, span),
    deficit(policy.cleanRecent, recent),
    deficit(policy.facets, facets),
    Math.ceil(Math.max(0, policy.score - record.score) / 1.2),
  );
}

export function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  if (minutes < 60) return `${minutes}:${remainder}`;
  const hours = Math.floor(minutes / 60);
  return `${hours}:${String(minutes % 60).padStart(2, "0")}:${remainder}`;
}

function synchronizedDuration(startedAt, endedAt) {
  const startSecond = Math.ceil(startedAt / 1000);
  const endSecond = Math.floor(endedAt / 1000);
  return Math.max(0, endSecond - startSecond) * 1000;
}

export class PracticeClock {
  constructor(source = () => performance.now(), idleThreshold = idleAfterMs) {
    this.source = source;
    this.idleThreshold = idleThreshold;
    this.excludedMs = 0;
    this.hiddenAt = null;
    this.lastActivityAt = source();
    this.startedAt = this.now();
  }

  idleStart(raw = this.source()) {
    const timeoutAt = this.lastActivityAt + this.idleThreshold;
    const timeoutStart = raw >= timeoutAt ? timeoutAt : null;
    if (this.hiddenAt === null) return timeoutStart;
    if (timeoutStart === null) return this.hiddenAt;
    return Math.min(timeoutStart, this.hiddenAt);
  }

  now() {
    const raw = this.source();
    const idleStart = this.idleStart(raw);
    return raw - this.excludedMs - (idleStart === null ? 0 : raw - idleStart);
  }

  get idle() {
    return this.idleStart() !== null;
  }

  activity() {
    if (this.hiddenAt !== null) return;
    const raw = this.source();
    const idleStart = this.idleStart(raw);
    if (idleStart !== null) this.excludedMs += raw - idleStart;
    this.lastActivityAt = raw;
  }

  setHidden(hidden) {
    const raw = this.source();
    if (hidden) {
      this.hiddenAt ??= raw;
      return;
    }
    if (this.hiddenAt === null) return;
    const idleStart = this.idleStart(raw);
    this.excludedMs += raw - idleStart;
    this.hiddenAt = null;
    this.lastActivityAt = raw;
  }

  snapshot(status, exercise, session) {
    const now = this.now();
    const samples = status.record.durationSamples ?? 0;
    const measured = samples
      ? status.record.durationMsTotal / samples
      : fallbackDuration[exercise.kind] ?? 20_000;
    const average = Math.max(5_000, Math.min(measured, 180_000));
    const probes = remainingProbeCount(status);
    const exerciseMs = synchronizedDuration(
      session.createdAt,
      session.finishedAt ?? now,
    );
    return {
      exerciseMs,
      sessionMs: synchronizedDuration(this.startedAt, now),
      remainingMs: Math.max(0, probes * average - exerciseMs),
      remainingProbes: probes,
      idle: this.idle,
    };
  }
}
