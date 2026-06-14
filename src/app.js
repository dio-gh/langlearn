import { Course } from "./core/course.js";
import { LanguageRegistry } from "./core/languages.js";
import { LearnerModel } from "./core/learner.js";
import { createSession } from "./core/sessions.js";
import { ProgressStore } from "./core/store.js";
import { ThemeController } from "./core/theme.js";
import { PracticeClock } from "./core/timing.js";
import { languageCourses } from "./languages/catalog.js";
import { View } from "./view.js";

class App {
  constructor() {
    this.languages = new LanguageRegistry(languageCourses);
    const fallback = this.languages.defaultLanguage;
    this.store = new ProgressStore(window.localStorage, "langlearn.v4", {
      languageId: fallback.id,
      trackId: fallback.defaultTrack,
    }, this.languages.languages.flatMap((language) => language.migrations ?? []));
    this.learner = new LearnerModel(this.store);
    this.view = new View();
    this.theme = new ThemeController(this.store);
    this.theme.bind(this.view.themeSelect);
    this.clock = new PracticeClock();
    this.exercise = null;
    this.session = null;
    this.advanceTimer = 0;
    this.configureLanguage(this.store.state.activeLanguage);
    this.bind();
    this.load();
    window.setInterval(() => this.renderLive(), 250);
  }

  configureLanguage(languageId) {
    this.language = this.languages.resolve(languageId);
    if (this.store.state.activeLanguage !== this.language.id) {
      this.store.update((state) => {
        state.activeLanguage = this.language.id;
      });
    }
    this.runtime = this.language.createRuntime();
    this.course = new Course(
      this.language,
      this.runtime.factory,
      this.store,
      this.learner,
    );
    this.view.setLanguage(this.language);
    this.view.renderLanguages(this.languages.languages, this.language.id);
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
        this.render();
      }
    });

    this.view.modeSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("[data-track]");
      if (!button) return;
      this.abandonIfStarted();
      this.course.setTrack(button.dataset.track);
      this.load();
    });

    this.view.languageSelect.addEventListener("change", () => {
      this.abandonIfStarted();
      this.store.update((state) => {
        state.activeLanguage = this.view.languageSelect.value;
      });
      this.configureLanguage(this.view.languageSelect.value);
      this.load();
    });

    this.view.mapGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-stage]");
      if (!button) return;
      this.abandonIfStarted();
      if (this.course.selectStage(Number(button.dataset.stage))) {
        this.view.map.close();
        this.load();
      }
    });

    document.querySelector("#map-button").addEventListener("click", () => this.view.map.showModal());
    document.querySelector("#reset-button").addEventListener("click", () => this.restart());

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

  abandonIfStarted() {
    if (this.session && (this.session.startedAt || this.session.attempts > 0)) {
      this.course.abandon(this.exercise);
    }
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
    this.abandonIfStarted();
    this.load();
  }

  finish() {
    this.view.announce("Correct");
    this.render();
    this.advanceTimer = window.setTimeout(() => {
      this.course.complete(this.exercise, this.session);
      this.load();
    }, 560);
  }

  timing() {
    return this.clock.snapshot(
      this.course.status(this.course.position.stage),
      this.exercise,
      this.session,
    );
  }

  renderLive() {
    if (this.exercise?.kind === "typing" && this.session.startedAt && !this.session.complete) {
      const stats = this.session.stats;
      this.view.speed.textContent = stats.wpm;
      this.view.accuracy.textContent = stats.accuracy;
    }
    if (this.exercise && this.session) this.view.renderTiming(this.timing());
  }

  render() {
    this.view.render({
      course: this.course,
      formatStage: this.runtime.formatStage,
      exercise: this.exercise,
      session: this.session,
      timing: this.timing(),
    });
  }
}

new App();
