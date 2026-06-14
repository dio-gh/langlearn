import { Course } from "./core/course.js";
import { ExerciseFactory } from "./core/exercises.js";
import { Feedback } from "./core/feedback.js";
import { GrammarCatalog } from "./core/grammar.js";
import { LearnerModel } from "./core/learner.js";
import { createSession } from "./core/sessions.js";
import { ProgressStore } from "./core/store.js";
import { SynthesizerRegistry } from "./core/synthesizers.js";
import { tracks } from "./data/curriculum.js";
import { grammarMetadata, grammarProductions } from "./data/go-grammar.generated.js";
import { standardLibrary } from "./data/stdlib.generated.js";
import { validatedSeeds, validationMetadata } from "./data/validated.generated.js";
import { View } from "./view.js";

function validatedLanguageVersion(toolchain) {
  return toolchain.match(/\bgo\d+\.\d+(?:\.\d+)?\b/)?.[0] ?? "go?";
}

class App {
  constructor() {
    this.grammar = new GrammarCatalog(grammarMetadata, grammarProductions);
    this.store = new ProgressStore();
    this.learner = new LearnerModel(this.store);
    this.registry = new SynthesizerRegistry(this.grammar, standardLibrary);
    this.factory = new ExerciseFactory(this.grammar, this.registry, validatedSeeds);
    this.course = new Course(tracks, this.factory, this.store, this.learner);
    this.feedback = new Feedback(this.store);
    this.view = new View();
    this.view.setLanguageVersion(validatedLanguageVersion(validationMetadata.toolchain));
    this.exercise = null;
    this.session = null;
    this.advanceTimer = 0;
    this.bind();
    this.load();
    window.setInterval(() => this.renderStats(), 250);
  }

  bind() {
    this.view.capture.addEventListener("beforeinput", (event) => {
      if (event.inputType === "insertText") this.session.recordInsertion(event.data);
      if (event.inputType === "insertLineBreak") this.session.recordInsertion("\n");
    });

    this.view.capture.addEventListener("input", () => {
      if (this.session.complete) return;
      this.session.update(this.view.capture.value);
      this.view.capture.value = this.session.input;
      this.render();
      if (this.session.complete) this.finish();
    });

    this.view.capture.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        const start = this.view.capture.selectionStart;
        this.session.recordInsertion("\t");
        this.view.capture.setRangeText("\t", start, this.view.capture.selectionEnd, "end");
        this.view.capture.dispatchEvent(new InputEvent("input", { bubbles: true }));
      }
      if (event.key === "Escape") {
        event.preventDefault();
        this.restart();
      }
    });

    this.view.frame.addEventListener("pointerdown", () => {
      if (this.exercise.kind === "typing") this.view.focus();
    });

    this.view.answers.addEventListener("click", (event) => {
      const button = event.target.closest("[data-answer]");
      if (!button || this.session.complete) return;
      if (this.session.selections.includes(button.dataset.answer)) return;
      const correct = this.session.choose(button.dataset.answer);
      if (correct) {
        this.finish();
      } else {
        this.course.recordMiss(this.exercise, this.session);
        this.feedback.wrong();
        this.render();
      }
    });

    this.view.trackSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("[data-track]");
      if (!button) return;
      if (this.session.startedAt || this.session.attempts > 0) this.course.abandon(this.exercise);
      this.course.setTrack(button.dataset.track);
      this.load();
    });

    this.view.mapGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-stage]");
      if (!button) return;
      if (this.session.startedAt || this.session.attempts > 0) this.course.abandon(this.exercise);
      if (this.course.selectStage(Number(button.dataset.stage))) {
        this.view.map.close();
        this.load();
      }
    });

    document.querySelector("#map-button").addEventListener("click", () => this.view.map.showModal());
    document.querySelector("#reset-button").addEventListener("click", () => this.restart());
    this.view.soundButton.addEventListener("click", () => {
      this.feedback.toggle();
      this.view.setSound(this.feedback.enabled);
    });

    document.addEventListener("keydown", (event) => {
      if (
        this.exercise.kind === "typing"
        && !this.view.map.open
        && document.activeElement !== this.view.capture
        && (event.key.length === 1 || event.key === "Enter")
      ) {
        this.view.focus();
      }
    });
  }

  load() {
    window.clearTimeout(this.advanceTimer);
    this.exercise = this.course.exercise;
    this.session = createSession(this.exercise);
    this.view.capture.value = "";
    this.render();
    if (this.exercise.kind === "typing") this.view.focus();
  }

  restart() {
    if (this.session && (this.session.startedAt || this.session.attempts > 0)) {
      this.course.abandon(this.exercise);
    }
    this.load();
  }

  finish() {
    this.feedback.correct();
    this.view.announce("✓");
    this.render();
    this.advanceTimer = window.setTimeout(() => {
      this.course.complete(this.exercise, this.session);
      this.load();
    }, 720);
  }

  renderStats() {
    if (this.exercise?.kind !== "typing" || !this.session.startedAt || this.session.complete) return;
    const stats = this.session.stats;
    this.view.speed.textContent = stats.wpm;
    this.view.accuracy.textContent = stats.accuracy;
  }

  render() {
    this.view.render({
      course: this.course,
      grammar: this.grammar,
      exercise: this.exercise,
      session: this.session,
    });
    this.view.setSound(this.feedback.enabled);
  }
}

new App();
