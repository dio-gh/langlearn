export function exerciseSeed(languageId, track, stage, candidate) {
  return `${languageId}:${track.id}:${stage.id}:${candidate}`;
}

export class ExerciseFactory {
  constructor(languageId, grammar, registry, validatedSeeds) {
    this.languageId = languageId;
    this.grammar = grammar;
    this.registry = registry;
    this.validatedSeeds = validatedSeeds;
  }

  validate(tracks) {
    for (const track of tracks) {
      for (const stage of track.stages) {
        if (!this.grammar.has(stage.production)) {
          throw new RangeError(`${stage.id} names missing production ${stage.production}`);
        }
        if (!this.registry.has(stage.mode)) {
          throw new RangeError(`${stage.id} names missing synthesizer ${stage.mode}`);
        }
        const seeds = this.validatedSeeds[track.id]?.[stage.id];
        if (!Array.isArray(seeds) || seeds.length === 0) {
          throw new RangeError(`${stage.id} has no compiler-validated seeds`);
        }
      }
    }
  }

  create(track, stage, attempt) {
    const candidates = this.validatedSeeds[track.id][stage.id];
    const candidate = candidates[attempt % candidates.length];
    const seed = exerciseSeed(this.languageId, track, stage, candidate);
    const exercise = this.registry.generate(stage, seed);
    return {
      ...exercise,
      id: `${stage.id}:${candidate}`,
      production: stage.production,
      validationCandidate: candidate,
      seed,
    };
  }

  choose(track, stage, attempt, record = {}) {
    const candidates = this.validatedSeeds[track.id][stage.id];
    const recent = new Set(record.recentSeeds ?? []);
    const misconceptionDebt = record.misconceptions ?? {};
    const facetEvidence = record.facets ?? {};
    const ranked = candidates.map((candidate) => {
      const exercise = this.createCandidate(track, stage, candidate);
      let score = record.seeds?.[exercise.id] ? 0 : 100;
      if (recent.has(exercise.id)) score -= 80;
      if (exercise.kind === "choice") score += 12;
      for (const facet of exercise.facets ?? []) {
        const evidence = facetEvidence[facet] ?? { clean: 0, fail: 0 };
        score += Math.max(0, evidence.fail - evidence.clean) * 16;
      }
      for (const diagnostic of Object.values(exercise.diagnostics ?? {})) {
        const evidence = misconceptionDebt[diagnostic] ?? { clean: 0, fail: 0 };
        score += Math.max(0, evidence.fail - evidence.clean) * 24;
      }
      score += ((candidate + attempt) % 17) / 100;
      return { exercise, score };
    });
    ranked.sort((left, right) => right.score - left.score);
    return ranked[0].exercise;
  }

  createCandidate(track, stage, candidate) {
    const seed = exerciseSeed(this.languageId, track, stage, candidate);
    const exercise = this.registry.generate(stage, seed);
    return {
      ...exercise,
      id: `${stage.id}:${candidate}`,
      production: stage.production,
      validationCandidate: candidate,
      seed,
    };
  }
}
