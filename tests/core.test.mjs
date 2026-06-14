import assert from "node:assert/strict";
import test from "node:test";
import { Course } from "../src/core/course.js";
import { ExerciseFactory } from "../src/core/exercises.js";
import { GrammarCatalog } from "../src/core/grammar.js";
import { LearnerModel } from "../src/core/learner.js";
import { Random } from "../src/core/random.js";
import { ChoiceSession, TypingSession } from "../src/core/sessions.js";
import { ProgressStore } from "../src/core/store.js";

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
  const factory = new ExerciseFactory(grammar, registry, { x: { root: [2] } });
  const tracks = [{ id: "x", stages: [{ id: "root", production: "Root", mode: "syntax" }] }];
  assert.doesNotThrow(() => factory.validate(tracks));
  assert.equal(factory.create(tracks[0], tracks[0].stages[0], 2).seed, "x:root:2");
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
    learner.recordCompletion("meaning", stage, exercise, cleanChoiceSession());
  }
  const status = learner.status("meaning", stage);
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
  learner.recordMiss("meaning", stage, exercise, "wrong");
  const record = learner.skill("meaning", "probe");
  assert.equal(record.score < 0, true);
  assert.equal(record.misconceptions["branch-inversion"].fail, 1);
  assert.deepEqual(record.recent, [false]);
});

test("a mastered skill is immediately reopened by contradictory evidence", () => {
  const store = new ProgressStore(new MemoryStorage(), "test");
  const learner = new LearnerModel(store);
  const stage = { id: "probe", mode: "meaning" };
  for (let index = 0; index < 8; index += 1) {
    learner.recordCompletion("meaning", stage, {
      id: `probe:${index}`,
      kind: "choice",
      facets: ["meaning", `variant:${index % 2}`],
      diagnostics: { wrong: "inversion" },
    }, cleanChoiceSession());
  }
  assert.equal(learner.status("meaning", stage).mastered, true);

  learner.recordMiss("meaning", stage, {
    id: "probe:next",
    kind: "choice",
    facets: ["meaning"],
    diagnostics: { wrong: "inversion" },
  }, "wrong");
  assert.equal(learner.status("meaning", stage).mastered, false);
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
    learner.recordMiss("meaning", stage, exercise, "wrong");
    learner.recordCompletion("meaning", stage, exercise, {
      evidence: {
        firstTry: false,
        mistakes: 1,
        accuracy: 50,
        durationMs: 1200,
        impulsive: false,
      },
    });
  }
  const status = learner.status("meaning", stage);
  assert.equal(status.mastered, false);
  assert.equal(status.ratios.strong, 0);
  assert.equal(status.record.score < 0, true);
});

test("typing alone is deliberately insufficient evidence", () => {
  const store = new ProgressStore(new MemoryStorage(), "test");
  const learner = new LearnerModel(store);
  const stage = { id: "syntax", mode: "syntax" };
  for (let index = 0; index < 14; index += 1) {
    learner.recordCompletion("syntax", stage, {
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
  const status = learner.status("syntax", stage);
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
  const factory = new ExerciseFactory(grammar, registry, { meaning: { probe: [0, 1] } });
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
  const factory = new ExerciseFactory(grammar, {
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
  const course = new Course(tracks, factory, store, learner);

  assert.equal(course.isUnlocked(1), false);
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
});

test("typing and choice sessions track completion", () => {
  const typing = new TypingSession("go");
  typing.recordInsertion("go");
  typing.update("go");
  assert.equal(typing.complete, true);
  assert.equal(typing.stats.accuracy, 100);

  const choice = new ChoiceSession("right");
  assert.equal(choice.choose("wrong"), false);
  assert.equal(choice.choose("right"), true);
  assert.equal(choice.attempts, 2);
  assert.equal(choice.evidence.firstTry, false);
});

test("v2 completion counters migrate as exposure, not mastery", () => {
  const storage = new MemoryStorage();
  storage.setItem("go-dojo.v2", JSON.stringify({
    version: 2,
    activeTrack: "syntax",
    positions: { syntax: { stage: 2, attempt: 4 } },
    mastery: { "syntax:0": 3, "syntax:1": 3 },
  }));
  const store = new ProgressStore(storage, "go-dojo.v3");
  const learner = new LearnerModel(store);
  assert.equal(store.state.version, 3);
  assert.equal(learner.status("syntax", { id: "package", mode: "syntax" }).mastered, false);
});
