import assert from "node:assert/strict";
import test from "node:test";
import { Course } from "../src/core/course.js";
import { ExerciseFactory } from "../src/core/exercises.js";
import { GrammarCatalog } from "../src/core/grammar.js";
import { LanguageRegistry } from "../src/core/languages.js";
import { LearnerModel } from "../src/core/learner.js";
import { Random } from "../src/core/random.js";
import { ChoiceSession, TypingSession } from "../src/core/sessions.js";
import { ProgressStore } from "../src/core/store.js";
import { ThemeController } from "../src/core/theme.js";
import { formatDuration, PracticeClock, remainingProbeCount } from "../src/core/timing.js";
import { migrateGoProgress } from "../src/languages/go/migration.js";

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test("seeded random streams are repeatable", () => {
  const first = new Random("same");
  const second = new Random("same");
  assert.deepEqual(
    Array.from({ length: 8 }, () => first.integer(0, 100)),
    Array.from({ length: 8 }, () => second.integer(0, 100)),
  );
});

test("grammar catalog formats and traverses productions", () => {
  const grammar = new GrammarCatalog(
    { languageVersion: "test" },
    {
      A: { kind: "sequence", items: [
        { kind: "literal", value: "a", quote: '"' },
        { kind: "reference", name: "B" },
      ] },
      B: { kind: "literal", value: "b", quote: '"' },
    },
  );
  assert.equal(grammar.format("A"), 'A = "a" B .');
  assert.deepEqual(grammar.references("A"), ["B"]);
});

test("exercise factory validates production and generator names", () => {
  const grammar = new GrammarCatalog({}, { Root: { kind: "empty" } });
  const registry = {
    has: (mode) => mode === "syntax",
    generate: () => ({ kind: "typing", code: "package p", context: "file" }),
  };
  const factory = new ExerciseFactory("test", grammar, registry, { x: { root: [2] } });
  const tracks = [{ id: "x", stages: [{ id: "root", production: "Root", mode: "syntax" }] }];
  assert.doesNotThrow(() => factory.validate(tracks));
  assert.equal(factory.create(tracks[0], tracks[0].stages[0], 2).seed, "test:x:root:2");
});

function cleanChoiceSession() {
  return {
    selected: "right",
    evidence: {
      firstTry: true,
      mistakes: 0,
      accuracy: 100,
      durationMs: 900,
      impulsive: false,
    },
  };
}

test("learner evidence rejects completion-count mastery", () => {
  const store = new ProgressStore(new MemoryStorage(), "test");
  const learner = new LearnerModel(store);
  const stage = { id: "probe", mode: "meaning" };
  const exercise = {
    id: "probe:0",
    kind: "choice",
    facets: ["branch", "comparison:>"],
    diagnostics: { wrong: "branch-inversion" },
  };

  for (let index = 0; index < 12; index += 1) {
    learner.recordCompletion("test", "meaning", stage, exercise, cleanChoiceSession());
  }
  const status = learner.status("test", "meaning", stage);
  assert.equal(status.mastered, false);
  assert.equal(status.ratios.distinct < 1, true);
});

test("a miss lowers belief and records its misconception", () => {
  const store = new ProgressStore(new MemoryStorage(), "test");
  const learner = new LearnerModel(store);
  const stage = { id: "probe", mode: "meaning" };
  const exercise = {
    id: "probe:0",
    kind: "choice",
    facets: ["branch"],
    diagnostics: { wrong: "branch-inversion" },
  };
  learner.recordMiss("test", "meaning", stage, exercise, "wrong");
  const record = learner.skill("test", "meaning", "probe");
  assert.equal(record.score < 0, true);
  assert.equal(record.misconceptions["branch-inversion"].fail, 1);
  assert.deepEqual(record.recent, [false]);
});

test("a mastered skill is immediately reopened by contradictory evidence", () => {
  const store = new ProgressStore(new MemoryStorage(), "test");
  const learner = new LearnerModel(store);
  const stage = { id: "probe", mode: "meaning" };
  for (let index = 0; index < 8; index += 1) {
    learner.recordCompletion("test", "meaning", stage, {
      id: `probe:${index}`,
      kind: "choice",
      facets: ["meaning", `variant:${index % 2}`],
      diagnostics: { wrong: "inversion" },
    }, cleanChoiceSession());
  }
  assert.equal(learner.status("test", "meaning", stage).mastered, true);

  learner.recordMiss("test", "meaning", stage, {
    id: "probe:next",
    kind: "choice",
    facets: ["meaning"],
    diagnostics: { wrong: "inversion" },
  }, "wrong");
  assert.equal(learner.status("test", "meaning", stage).mastered, false);
});

test("a repeated guess-and-correct strategy does not satisfy mastery", () => {
  const store = new ProgressStore(new MemoryStorage(), "test");
  const learner = new LearnerModel(store);
  const stage = { id: "probe", mode: "meaning" };
  for (let index = 0; index < 30; index += 1) {
    const exercise = {
      id: `probe:${index}`,
      kind: "choice",
      facets: ["meaning", `variant:${index % 2}`],
      diagnostics: { wrong: "guess" },
    };
    learner.recordMiss("test", "meaning", stage, exercise, "wrong");
    learner.recordCompletion("test", "meaning", stage, exercise, {
      evidence: {
        firstTry: false,
        mistakes: 1,
        accuracy: 50,
        durationMs: 1200,
        impulsive: false,
      },
    });
  }
  const status = learner.status("test", "meaning", stage);
  assert.equal(status.mastered, false);
  assert.equal(status.ratios.strong, 0);
  assert.equal(status.record.score < 0, true);
});

test("typing alone is deliberately insufficient evidence", () => {
  const store = new ProgressStore(new MemoryStorage(), "test");
  const learner = new LearnerModel(store);
  const stage = { id: "syntax", mode: "syntax" };
  for (let index = 0; index < 14; index += 1) {
    learner.recordCompletion("test", "syntax", stage, {
      id: `syntax:${index}`,
      kind: "typing",
      facets: ["construction"],
    }, {
      evidence: {
        firstTry: true,
        mistakes: 0,
        accuracy: 100,
        durationMs: 1500,
        impulsive: false,
      },
    });
  }
  const status = learner.status("test", "syntax", stage);
  assert.equal(status.mastered, false);
  assert.equal(status.ratios.strong, 0);
});

test("candidate scheduling targets unresolved misconception debt", () => {
  const grammar = new GrammarCatalog({}, { Root: { kind: "empty" } });
  const registry = {
    has: () => true,
    generate: (_stage, seed) => {
      const candidate = Number(seed.split(":").at(-1));
      return {
        kind: "choice",
        code: "",
        options: ["right", "wrong"],
        answer: "right",
        diagnostics: { wrong: candidate === 1 ? "weak-facet" : "other-facet" },
        facets: [candidate === 1 ? "weak-facet" : "other-facet"],
      };
    },
  };
  const factory = new ExerciseFactory("test", grammar, registry, { meaning: { probe: [0, 1] } });
  const track = { id: "meaning" };
  const stage = { id: "probe", production: "Root", mode: "meaning" };
  const exercise = factory.choose(track, stage, 0, {
    seeds: { "probe:0": 1, "probe:1": 1 },
    recentSeeds: [],
    facets: {},
    misconceptions: {
      "weak-facet": { clean: 0, fail: 2 },
      "other-facet": { clean: 0, fail: 0 },
    },
  });
  assert.equal(exercise.validationCandidate, 1);
});

test("course unlocks only after diverse strong retained evidence", () => {
  const grammar = new GrammarCatalog({}, {
    A: { kind: "empty" },
    B: { kind: "empty" },
  });
  const factory = new ExerciseFactory("test", grammar, {
    has: () => true,
    generate: (stage) => ({ kind: "typing", code: stage.id, context: "statement" }),
  }, { syntax: { a: [0], b: [0] } });
  const tracks = [{
    id: "syntax",
    stages: [
      { id: "a", production: "A", mode: "meaning" },
      { id: "b", production: "B", mode: "meaning" },
    ],
  }];
  const store = new ProgressStore(new MemoryStorage(), "test");
  const learner = new LearnerModel(store);
  const language = { id: "test", label: "Test", defaultTrack: "syntax", tracks };
  const course = new Course(language, factory, store, learner);

  assert.equal(course.isUnlocked(1), false);
  assert.equal(course.trackProgress, 0);
  for (let index = 0; index < 8; index += 1) {
    const exercise = {
      id: `a:${index}`,
      kind: "choice",
      facets: ["meaning", `variant:${index % 2}`],
      diagnostics: { wrong: "misread" },
    };
    course.complete(exercise, cleanChoiceSession());
  }
  assert.equal(course.isUnlocked(1), true);
  assert.equal(course.position.frontier, 1);
  assert.equal(course.status(1).ratio, 0);
  assert.equal(course.trackProgress, 0.5);
});

test("typing and choice sessions track completion", () => {
  const typing = new TypingSession("go");
  assert.equal(typing.stats.accuracy, null);
  typing.recordInsertion("go");
  typing.update("go");
  assert.equal(typing.complete, true);
  assert.equal(typing.stats.accuracy, 100);

  const choice = new ChoiceSession("right");
  assert.deepEqual(choice.stats, { attempts: 0, accuracy: null });
  assert.equal(choice.choose("wrong"), false);
  assert.deepEqual(choice.stats, { attempts: 1, accuracy: 0 });
  assert.equal(choice.choose("right"), true);
  assert.deepEqual(choice.stats, { attempts: 2, accuracy: 50 });
  assert.equal(choice.attempts, 2);
  assert.equal(choice.evidence.firstTry, false);
  assert.equal(choice.evidence.accuracy, 50);
});

test("accuracy accumulates across completed, active, and abandoned challenges", () => {
  const storage = new MemoryStorage();
  const store = new ProgressStore(
    storage,
    "test",
    { languageId: "go", trackId: "syntax" },
  );
  const learner = new LearnerModel(store);
  const clock = { now: () => 1_000 };
  const stage = { id: "probe", mode: "syntax" };
  const exercise = {
    id: "probe:0",
    kind: "choice",
    facets: ["construction"],
  };

  const choice = new ChoiceSession("right", clock);
  choice.choose("wrong");
  choice.choose("right");
  learner.recordCompletion("go", "syntax", stage, exercise, choice);
  assert.deepEqual(learner.performance("go"), {
    correct: 1,
    attempts: 2,
    accuracy: 50,
  });

  const typing = new TypingSession("go", clock);
  typing.recordInsertion("gx");
  typing.update("go");
  assert.deepEqual(learner.performance("go", typing), {
    correct: 2,
    attempts: 4,
    accuracy: 50,
  });
  learner.recordCompletion("go", "syntax", stage, {
    ...exercise,
    id: "probe:1",
    kind: "typing",
  }, typing);

  const abandoned = new ChoiceSession("right", clock);
  abandoned.choose("wrong");
  learner.recordAbandon("go", "syntax", stage, exercise, abandoned);
  assert.deepEqual(learner.performance("go"), {
    correct: 2,
    attempts: 5,
    accuracy: 40,
  });

  const restored = new ProgressStore(
    storage,
    "test",
    { languageId: "go", trackId: "syntax" },
  );
  assert.deepEqual(restored.state.learner.performance.go, {
    correct: 2,
    attempts: 5,
  });
});

test("v2 completion counters migrate as exposure, not mastery", () => {
  const storage = new MemoryStorage();
  storage.setItem("go-dojo.v2", JSON.stringify({
    version: 2,
    activeTrack: "syntax",
    positions: { syntax: { stage: 2, attempt: 4 } },
    mastery: { "syntax:0": 3, "syntax:1": 3 },
  }));
  const store = new ProgressStore(
    storage,
    "langlearn.v4",
    { languageId: "go", trackId: "syntax" },
    [migrateGoProgress],
  );
  const learner = new LearnerModel(store);
  assert.equal(store.state.version, 4);
  assert.equal(
    learner.status("go", "syntax", { id: "package", mode: "syntax" }).mastered,
    false,
  );
});

test("v3 Go saves migrate into language-namespaced progress", () => {
  const storage = new MemoryStorage();
  storage.setItem("go-dojo.v3", JSON.stringify({
    version: 3,
    activeTrack: "meaning",
    positions: { meaning: { stage: 2, frontier: 2, attempt: 4 } },
    learner: {
      round: 3,
      skills: {
        "meaning:values": {
          attempts: 2,
          completions: 1,
          seeds: { "values:0": 1 },
        },
      },
    },
  }));
  const store = new ProgressStore(
    storage,
    "langlearn.v4",
    { languageId: "go", trackId: "syntax" },
    [migrateGoProgress],
  );
  assert.equal(store.state.activeLanguage, "go");
  assert.equal(store.state.courses.go.activeTrack, "meaning");
  assert.equal(store.state.courses.go.positions.meaning.stage, 2);
  assert.equal(store.state.learner.skills["go:meaning:values"].completions, 1);
});

test("language registry validates and resolves course descriptors", () => {
  const language = {
    id: "test",
    label: "Test",
    version: "test1",
    defaultTrack: "syntax",
    tracks: [{ id: "syntax", stages: [] }],
    createRuntime() {},
  };
  const registry = new LanguageRegistry([language]);
  assert.equal(registry.resolve("test"), language);
  assert.equal(registry.resolve("missing"), language);
});

test("theme controller supports automatic and manual themes", () => {
  const store = new ProgressStore(
    new MemoryStorage(),
    "test",
    { languageId: "test", trackId: "syntax" },
  );
  const root = { dataset: {}, style: {} };
  const media = { matches: true, addEventListener() {} };
  const meta = { content: "" };
  const theme = new ThemeController(store, root, media, meta);
  assert.equal(theme.resolved, "dark");
  assert.equal(root.dataset.theme, undefined);
  theme.set("light");
  assert.equal(root.dataset.theme, "light");
  assert.equal(meta.content, "#f4f2ec");
});

test("migrated progress is immediately written under the current key", () => {
  const storage = new MemoryStorage();
  storage.setItem("go-dojo.v3", JSON.stringify({
    version: 3,
    activeTrack: "syntax",
    positions: {},
  }));
  new ProgressStore(
    storage,
    "langlearn.v4",
    { languageId: "go", trackId: "syntax" },
    [migrateGoProgress],
  );
  assert.equal(JSON.parse(storage.getItem("langlearn.v4")).version, 4);
});

test("timing model estimates remaining probe time", () => {
  const status = {
    mastered: false,
    policy: {
      distinct: 3,
      strong: 2,
      score: 3,
      span: 2,
      cleanRecent: 2,
      facets: 1,
    },
    record: {
      seeds: { a: 1 },
      strong: 1,
      score: 1.8,
      firstRound: 1,
      lastRound: 1,
      recent: [true],
      facets: {},
      durationMsTotal: 40_000,
      durationSamples: 2,
    },
  };
  assert.equal(remainingProbeCount(status), 2);
  let now = 10_000;
  const clock = new PracticeClock(() => now);
  const choice = new ChoiceSession("right", clock);
  now = 15_000;
  const snapshot = clock.snapshot(status, { kind: "choice" }, choice);
  assert.equal(snapshot.sessionMs, 5_000);
  assert.equal(snapshot.exerciseMs, 5_000);
  assert.equal(snapshot.remainingMs, 35_000);
  assert.equal(formatDuration(snapshot.remainingMs), "0:35");
});

test("visible timers advance on the same active-time boundaries", () => {
  const status = {
    mastered: false,
    policy: {
      distinct: 1,
      strong: 1,
      score: 1,
      span: 1,
      cleanRecent: 1,
      facets: 1,
    },
    record: {
      seeds: {},
      strong: 0,
      score: 0,
      firstRound: null,
      lastRound: null,
      recent: [],
      facets: {},
      durationMsTotal: 0,
      durationSamples: 0,
    },
  };
  let raw = 250;
  const clock = new PracticeClock(() => raw);
  raw = 1_250;
  const choice = new ChoiceSession("right", clock);

  raw = 2_100;
  const first = clock.snapshot(status, { kind: "choice" }, choice);
  raw = 3_100;
  const second = clock.snapshot(status, { kind: "choice" }, choice);

  assert.equal(second.sessionMs - first.sessionMs, 1_000);
  assert.equal(second.exerciseMs - first.exerciseMs, 1_000);
  assert.equal(first.remainingMs - second.remainingMs, 1_000);
});

test("practice time pauses after inactivity and while hidden", () => {
  let raw = 0;
  const clock = new PracticeClock(() => raw, 1_000);
  const choice = new ChoiceSession("right", clock);

  raw = 600;
  assert.equal(choice.elapsedMs, 600);
  assert.equal(clock.idle, false);

  raw = 2_000;
  assert.equal(choice.elapsedMs, 1_000);
  assert.equal(clock.idle, true);

  raw = 5_000;
  assert.equal(choice.elapsedMs, 1_000);
  clock.activity();
  assert.equal(clock.idle, false);

  raw = 5_400;
  choice.choose("right");
  assert.equal(choice.evidence.durationMs, 1_400);

  clock.setHidden(true);
  raw = 9_000;
  assert.equal(clock.now(), 1_400);
  assert.equal(clock.idle, true);

  clock.setHidden(false);
  raw = 9_500;
  assert.equal(clock.now(), 1_900);
  assert.equal(clock.idle, false);
});
