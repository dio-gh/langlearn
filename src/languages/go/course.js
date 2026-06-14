import { ExerciseFactory } from "../../core/exercises.js";
import { GrammarCatalog } from "../../core/grammar.js";
import { tracks } from "./curriculum.js";
import { grammarMetadata, grammarProductions } from "./data/grammar.generated.js";
import { standardLibrary } from "./data/stdlib.generated.js";
import { validatedSeeds, validationMetadata } from "./data/validated.generated.js";
import { SynthesizerRegistry } from "./synthesizers.js";
import { migrateGoProgress } from "./migration.js";

const version = validationMetadata.toolchain.match(/\bgo\d+\.\d+(?:\.\d+)?\b/)?.[0] ?? "go?";
let runtime;

export const goLanguage = Object.freeze({
  id: "go",
  label: "Go",
  version,
  displayVersion: version.replace(/^go/, ""),
  specificationVersion: grammarMetadata.languageVersion,
  defaultTrack: "syntax",
  tracks,
  migrations: [migrateGoProgress],
  createRuntime() {
    if (runtime) return runtime;
    const grammar = new GrammarCatalog(grammarMetadata, grammarProductions);
    const registry = new SynthesizerRegistry(grammar, standardLibrary);
    const factory = new ExerciseFactory("go", grammar, registry, validatedSeeds);
    runtime = Object.freeze({
      grammar,
      factory,
      formatStage(stage) {
        return grammar.format(stage.production);
      },
    });
    return runtime;
  },
});
