import { createProgressState, normalizeSkill } from "../../core/store.js";

const languageId = "go";
const trackId = "syntax";

export function migrateGoProgress(storage, defaults) {
  try {
    const old = JSON.parse(storage.getItem("go-dojo.v3") || "null");
    if (old) {
      const state = createProgressState(defaults);
      state.activeLanguage = languageId;
      state.courses[languageId] = {
        activeTrack: old.activeTrack ?? trackId,
        positions: { ...old.positions },
      };
      state.learner.round = old.learner?.round ?? 0;
      for (const [key, value] of Object.entries(old.learner?.skills ?? {})) {
        state.learner.skills[`${languageId}:${key}`] = normalizeSkill(value);
      }
      state.streak = old.streak ?? 0;
      state.total = old.total ?? 0;
      return state;
    }
  } catch {
    // Try older save formats.
  }

  try {
    const old = JSON.parse(storage.getItem("go-dojo.v2") || "null");
    if (old) {
      const state = createProgressState(defaults);
      state.courses[languageId] = {
        activeTrack: old.activeTrack ?? trackId,
        positions: { ...old.positions },
      };
      state.streak = old.streak ?? 0;
      state.total = old.total ?? 0;
      for (const [key, value] of Object.entries(old.mastery ?? {})) {
        state.learner.skills[`${languageId}:${key}`] = normalizeSkill({
          attempts: value,
          completions: value,
        });
      }
      return state;
    }
  } catch {
    // Try the prototype save.
  }

  try {
    const old = JSON.parse(storage.getItem("go-dojo.prototype.v1") || "null");
    if (old) {
      const state = createProgressState(defaults);
      state.courses[languageId].positions.syntax = {
        stage: old.stage ?? 0,
        frontier: old.stage ?? 0,
        attempt: old.drill ?? 0,
      };
      state.streak = old.streak ?? 0;
      return state;
    }
  } catch {
    // Ignore damaged legacy data.
  }
  return null;
}
