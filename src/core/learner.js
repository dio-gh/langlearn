const recentLimit = 8;
const seedLimit = 16;

function emptySkill() {
  return {
    attempts: 0,
    completions: 0,
    strong: 0,
    failures: 0,
    score: 0,
    firstRound: null,
    lastRound: null,
    seeds: {},
    recentSeeds: [],
    facets: {},
    misconceptions: {},
    recent: [],
    impulsive: 0,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function increment(table, key, field) {
  table[key] ??= { clean: 0, fail: 0 };
  table[key][field] += 1;
}

function policyFor(stage) {
  if (stage.mode === "syntax") {
    return {
      distinct: 8,
      strong: 4,
      score: 5.5,
      span: 5,
      cleanRecent: 6,
      facets: 3,
    };
  }
  return {
    distinct: 7,
    strong: 5,
    score: 6,
    span: 4,
    cleanRecent: 6,
    facets: 2,
  };
}

function cleanRecent(record) {
  return record.recent.filter(Boolean).length;
}

export class LearnerModel {
  constructor(store) {
    this.store = store;
  }

  key(trackId, stageId) {
    return `${trackId}:${stageId}`;
  }

  skill(trackId, stageId) {
    return this.store.state.learner.skills[this.key(trackId, stageId)] ?? emptySkill();
  }

  recordMiss(trackId, stage, exercise, selected) {
    const diagnostic = exercise.diagnostics?.[selected] ?? `${stage.mode}:unknown`;
    this.store.update((state) => {
      const record = state.learner.skills[this.key(trackId, stage.id)] ??= emptySkill();
      record.attempts += 1;
      record.failures += 1;
      record.score = clamp(record.score - 2.25, -12, 20);
      record.recent.push(false);
      record.recent = record.recent.slice(-recentLimit);
      increment(record.misconceptions, diagnostic, "fail");
      for (const facet of exercise.facets ?? []) increment(record.facets, facet, "fail");
      state.streak = 0;
    });
  }

  recordCompletion(trackId, stage, exercise, session) {
    this.store.update((state) => {
      state.learner.round += 1;
      const round = state.learner.round;
      const record = state.learner.skills[this.key(trackId, stage.id)] ??= emptySkill();
      const evidence = session.evidence;
      const clean = evidence.firstTry && !evidence.impulsive;
      const strong = exercise.kind === "choice" && clean;
      const typingClean = exercise.kind === "typing" && evidence.accuracy === 100;

      record.attempts += 1;
      record.completions += 1;
      record.firstRound ??= round;
      record.lastRound = round;
      record.seeds[exercise.id] = (record.seeds[exercise.id] ?? 0) + 1;
      record.recentSeeds.push(exercise.id);
      record.recentSeeds = record.recentSeeds.slice(-seedLimit);
      if (strong) record.strong += 1;
      if (evidence.impulsive) record.impulsive += 1;

      let delta = 0;
      if (strong) delta = 1.6;
      else if (typingClean) delta = 0.55;
      else if (evidence.firstTry) delta = 0.2;
      else delta = -0.35;
      if (exercise.kind === "typing" && evidence.mistakes > 0) {
        delta -= Math.min(1.6, evidence.mistakes * 0.18);
        record.failures += 1;
      }
      record.score = clamp(record.score + delta, -12, 20);
      const outcome = strong || typingClean;
      record.recent.push(outcome);
      record.recent = record.recent.slice(-recentLimit);

      for (const facet of exercise.facets ?? []) {
        increment(record.facets, facet, outcome ? "clean" : "fail");
      }
      if (strong) {
        for (const diagnostic of Object.values(exercise.diagnostics ?? {})) {
          increment(record.misconceptions, diagnostic, "clean");
        }
      }
      state.streak = outcome ? state.streak + 1 : 0;
      state.total += 1;
    });
  }

  recordAbandon(trackId, stage, exercise) {
    this.store.update((state) => {
      const record = state.learner.skills[this.key(trackId, stage.id)] ??= emptySkill();
      record.attempts += 1;
      record.failures += 1;
      record.score = clamp(record.score - 0.75, -12, 20);
      record.recent.push(false);
      record.recent = record.recent.slice(-recentLimit);
      for (const facet of exercise.facets ?? []) increment(record.facets, facet, "fail");
      state.streak = 0;
    });
  }

  status(trackId, stage) {
    const record = this.skill(trackId, stage.id);
    const policy = policyFor(stage);
    const distinct = Object.keys(record.seeds).length;
    const span = record.firstRound === null ? 0 : (record.lastRound ?? record.firstRound) - record.firstRound;
    const facets = Object.values(record.facets).filter((value) => value.clean > value.fail).length;
    const recent = cleanRecent(record);
    const ratios = {
      distinct: distinct / policy.distinct,
      strong: record.strong / policy.strong,
      score: Math.max(0, record.score) / policy.score,
      span: span / policy.span,
      recent: recent / policy.cleanRecent,
      facets: facets / policy.facets,
    };
    const ratio = clamp(Math.min(...Object.values(ratios)), 0, 1);
    const mastered = ratio >= 1 && record.recent.at(-1) !== false;
    return {
      mastered,
      ratio,
      ratios,
      record,
      policy,
      due: mastered && (this.store.state.learner.round - (record.lastRound ?? 0) >= 5),
    };
  }

  weakestFacet(trackId, stageId) {
    const record = this.skill(trackId, stageId);
    return Object.entries(record.misconceptions)
      .sort((left, right) => {
        const leftDebt = left[1].fail - left[1].clean;
        const rightDebt = right[1].fail - right[1].clean;
        return rightDebt - leftDebt;
      })[0]?.[0] ?? null;
  }
}

export { emptySkill, policyFor };
