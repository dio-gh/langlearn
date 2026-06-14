const currentVersion = 4;

export function createProgressState(defaults = {}) {
  const languageId = defaults.languageId ?? "default";
  const trackId = defaults.trackId ?? "default";
  return {
    version: currentVersion,
    activeLanguage: languageId,
    courses: {
      [languageId]: {
        activeTrack: trackId,
        positions: {},
      },
    },
    learner: {
      round: 0,
      skills: {},
      performance: {},
    },
    streak: 0,
    total: 0,
    settings: {
      theme: "auto",
    },
  };
}

export function normalizeSkill(record = {}) {
  return {
    attempts: record.attempts ?? 0,
    completions: record.completions ?? 0,
    strong: record.strong ?? 0,
    failures: record.failures ?? 0,
    score: record.score ?? 0,
    firstRound: record.firstRound ?? null,
    lastRound: record.lastRound ?? null,
    seeds: { ...record.seeds },
    recentSeeds: [...(record.recentSeeds ?? [])],
    facets: { ...record.facets },
    misconceptions: { ...record.misconceptions },
    recent: [...(record.recent ?? [])],
    impulsive: record.impulsive ?? 0,
    durationMsTotal: record.durationMsTotal ?? 0,
    durationSamples: record.durationSamples ?? 0,
  };
}

function normalizeCurrent(parsed, defaults) {
  const base = createProgressState(defaults);
  const courses = {};
  for (const [languageId, course] of Object.entries(parsed.courses ?? {})) {
    courses[languageId] = {
      activeTrack: course.activeTrack ?? defaults.trackId ?? "default",
      positions: { ...course.positions },
    };
  }
  const skills = Object.fromEntries(
    Object.entries(parsed.learner?.skills ?? {}).map(([key, value]) => [key, normalizeSkill(value)]),
  );
  const performance = Object.fromEntries(
    Object.entries(parsed.learner?.performance ?? {}).map(([languageId, value]) => [
      languageId,
      {
        correct: Math.max(0, value.correct ?? 0),
        attempts: Math.max(0, value.attempts ?? 0),
      },
    ]),
  );
  return {
    ...base,
    ...parsed,
    version: currentVersion,
    courses: { ...base.courses, ...courses },
    learner: {
      round: parsed.learner?.round ?? 0,
      skills,
      performance,
    },
    settings: {
      ...base.settings,
      theme: ["auto", "light", "dark"].includes(parsed.settings?.theme)
        ? parsed.settings.theme
        : "auto",
    },
  };
}

export class ProgressStore {
  constructor(
    storage = window.localStorage,
    key = "langlearn.v4",
    defaults = { languageId: "default", trackId: "default" },
    migrations = [],
  ) {
    this.storage = storage;
    this.key = key;
    this.defaults = defaults;
    this.migrations = migrations;
    this.state = this.load();
  }

  load() {
    try {
      const parsed = JSON.parse(this.storage.getItem(this.key) || "null");
      if (parsed?.version === currentVersion) return normalizeCurrent(parsed, this.defaults);
    } catch {
      // A damaged save should never make the practice surface unusable.
    }
    for (const migration of this.migrations) {
      const migrated = migration(this.storage, this.defaults);
      if (migrated) {
        const normalized = normalizeCurrent(migrated, this.defaults);
        this.storage.setItem(this.key, JSON.stringify(normalized));
        return normalized;
      }
    }
    return createProgressState(this.defaults);
  }

  ensureCourse(languageId, defaultTrack) {
    if (this.state.courses[languageId]) return this.state.courses[languageId];
    this.update((state) => {
      state.courses[languageId] = {
        activeTrack: defaultTrack,
        positions: {},
      };
    });
    return this.state.courses[languageId];
  }

  update(mutator) {
    mutator(this.state);
    this.storage.setItem(this.key, JSON.stringify(this.state));
    return this.state;
  }

  reset() {
    this.state = createProgressState(this.defaults);
    this.storage.setItem(this.key, JSON.stringify(this.state));
    return this.state;
  }
}
