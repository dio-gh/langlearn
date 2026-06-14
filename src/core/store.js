const currentVersion = 3;

function freshState() {
  return {
    version: currentVersion,
    activeTrack: "syntax",
    positions: {},
    mastery: {},
    learner: {
      round: 0,
      skills: {},
    },
    streak: 0,
    total: 0,
    settings: {
      sound: true,
    },
  };
}

function migratePrototype(storage) {
  try {
    const old = JSON.parse(storage.getItem("go-dojo.prototype.v1") || "null");
    if (!old) return null;
    const state = freshState();
    state.positions.syntax = { stage: old.stage ?? 0, attempt: old.drill ?? 0 };
    state.streak = old.streak ?? 0;
    for (let index = 0; index < (old.stage ?? 0); index += 1) {
      state.mastery[`syntax:${index}`] = 3;
    }
    return state;
  } catch {
    return null;
  }
}

function migrateV2(storage) {
  try {
    const old = JSON.parse(storage.getItem("go-dojo.v2") || "null");
    if (!old) return null;
    const state = freshState();
    state.activeTrack = old.activeTrack ?? state.activeTrack;
    state.positions = { ...old.positions };
    state.streak = old.streak ?? 0;
    state.total = old.total ?? 0;
    state.settings = { ...state.settings, ...old.settings };
    for (const [key, value] of Object.entries(old.mastery ?? {})) {
      state.learner.skills[key] = {
        attempts: value,
        completions: value,
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
    return state;
  } catch {
    return null;
  }
}

export class ProgressStore {
  constructor(storage = window.localStorage, key = "go-dojo.v3") {
    this.storage = storage;
    this.key = key;
    this.state = this.load();
  }

  load() {
    try {
      const parsed = JSON.parse(this.storage.getItem(this.key) || "null");
      if (parsed?.version === currentVersion) {
        return {
          ...freshState(),
          ...parsed,
          positions: { ...parsed.positions },
          mastery: { ...parsed.mastery },
          learner: {
            round: parsed.learner?.round ?? 0,
            skills: { ...parsed.learner?.skills },
          },
          settings: { ...freshState().settings, ...parsed.settings },
        };
      }
    } catch {
      // A damaged save should never make the practice surface unusable.
    }
    return migrateV2(this.storage) ?? migratePrototype(this.storage) ?? freshState();
  }

  update(mutator) {
    mutator(this.state);
    this.storage.setItem(this.key, JSON.stringify(this.state));
    return this.state;
  }

  reset() {
    this.state = freshState();
    this.storage.setItem(this.key, JSON.stringify(this.state));
    return this.state;
  }
}
