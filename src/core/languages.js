export class LanguageRegistry {
  constructor(languages) {
    if (!Array.isArray(languages) || languages.length === 0) {
      throw new TypeError("At least one language course is required");
    }
    this.languages = [...languages];
    this.byId = new Map();
    for (const language of this.languages) {
      if (
        !language?.id
        || !language?.label
        || !language?.version
        || !language?.defaultTrack
        || !Array.isArray(language?.tracks)
        || language.tracks.length === 0
        || typeof language?.createRuntime !== "function"
      ) {
        throw new TypeError("Invalid language course descriptor");
      }
      if (this.byId.has(language.id)) throw new RangeError(`Duplicate language ${language.id}`);
      if (!language.tracks.some((track) => track.id === language.defaultTrack)) {
        throw new RangeError(`Missing default track for ${language.id}`);
      }
      this.byId.set(language.id, language);
    }
  }

  get defaultLanguage() {
    return this.languages[0];
  }

  get(id) {
    return this.byId.get(id) ?? null;
  }

  resolve(id) {
    return this.get(id) ?? this.defaultLanguage;
  }
}
