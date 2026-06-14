const fallbackDuration = Object.freeze({
  typing: 30_000,
  choice: 18_000,
});

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
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  if (minutes < 60) return `${minutes}:${remainder}`;
  const hours = Math.floor(minutes / 60);
  return `${hours}:${String(minutes % 60).padStart(2, "0")}:${remainder}`;
}

export class PracticeClock {
  constructor(now = () => performance.now()) {
    this.now = now;
    this.startedAt = now();
  }

  snapshot(status, exercise, session) {
    const samples = status.record.durationSamples ?? 0;
    const measured = samples
      ? status.record.durationMsTotal / samples
      : fallbackDuration[exercise.kind] ?? 20_000;
    const average = Math.max(5_000, Math.min(measured, 180_000));
    const probes = remainingProbeCount(status);
    return {
      exerciseMs: session.elapsedMs,
      sessionMs: this.now() - this.startedAt,
      remainingMs: probes * average,
      remainingProbes: probes,
    };
  }
}
