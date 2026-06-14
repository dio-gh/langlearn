import { formatDuration } from "./core/timing.js";

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatAccuracy(value) {
  return value === null ? "--" : String(value);
}

export class View {
  constructor() {
    this.practice = document.querySelector(".practice");
    this.code = document.querySelector("#code");
    this.capture = document.querySelector("#capture");
    this.frame = document.querySelector("#code-frame");
    this.answers = document.querySelector("#answers");
    this.counter = document.querySelector("#counter");
    this.glyph = document.querySelector("#stage-glyph");
    this.rule = document.querySelector("#grammar-rule");
    this.speed = document.querySelector("#speed");
    this.speedLabel = document.querySelector("#speed-label");
    this.accuracy = document.querySelector("#accuracy");
    this.streak = document.querySelector("#streak");
    this.exerciseTime = document.querySelector("#exercise-time");
    this.sessionTime = document.querySelector("#session-time");
    this.sessionTimeLabel = document.querySelector("#session-time-label");
    this.remainingTime = document.querySelector("#remaining-time");
    this.progress = document.querySelector("#progress");
    this.modeSwitch = document.querySelector("#mode-switch");
    this.courseBadge = document.querySelector("#course-badge");
    this.languageSelect = document.querySelector("#language-select");
    this.themeSelect = document.querySelector("#theme-select");
    this.map = document.querySelector("#course-map");
    this.mapGrid = document.querySelector("#map-grid");
    this.mapLanguage = document.querySelector("#map-language");
    this.mapMode = document.querySelector("#map-mode");
    this.live = document.querySelector("#live-status");
  }

  focus() {
    this.capture.focus({ preventScroll: true });
  }

  setLanguage(language) {
    document.title = `langlearn | ${language.label}`;
    this.courseBadge.textContent = `${language.label} ${language.displayVersion}`;
    this.courseBadge.title = `${language.label} course validated with ${language.version}`;
    this.courseBadge.setAttribute(
      "aria-label",
      `${language.label} course, language version ${language.version}`,
    );
    this.mapLanguage.textContent = language.label;
    document.querySelector("#stage-label").textContent = `${language.label} exercise`;
    this.capture.setAttribute("aria-label", `Type the shown ${language.label} code`);
  }

  renderLanguages(languages, currentId) {
    this.languageSelect.replaceChildren(...languages.map((language) => {
      const option = element("option", "", `${language.label} ${language.displayVersion}`);
      option.value = language.id;
      option.selected = language.id === currentId;
      return option;
    }));
    this.languageSelect.hidden = languages.length < 2;
  }

  render({ course, formatStage, exercise, session, performance, timing }) {
    const stageIndex = course.position.stage;
    const status = course.status(stageIndex);
    this.practice.dataset.kind = exercise.kind;
    this.practice.classList.toggle(
      "active",
      session.startedAt !== null || session.selected !== null,
    );
    this.practice.classList.toggle("complete", session.complete);
    const reviewing = course.position.stage < course.position.frontier;
    this.glyph.textContent = `${reviewing ? "Review " : ""}${course.stage.glyph}`;
    const trackPercent = Math.round(course.trackProgress * 100);
    const stagePercent = Math.round(status.ratio * 100);
    this.counter.textContent = `${trackPercent}%`;
    this.counter.title = `${course.track.label} progress: ${trackPercent}%. Current stage evidence: ${stagePercent}%.`;
    this.rule.textContent = formatStage(course.stage);
    this.streak.textContent = course.store.state.streak;
    this.renderModes(course);
    this.renderProgress(course);
    this.renderMap(course, formatStage);
    this.renderTiming(timing);

    if (exercise.kind === "typing") {
      this.renderTyping(exercise, session);
    } else {
      this.renderChoice(exercise, session);
    }
    this.renderPerformance(exercise, session, performance);
  }

  renderModes(course) {
    this.modeSwitch.replaceChildren(...course.tracks.map((track) => {
      const button = element("button", "mode-button", track.label);
      button.type = "button";
      button.dataset.track = track.id;
      button.title = track.description;
      button.classList.toggle("current", track.id === course.track.id);
      button.setAttribute("aria-label", `${track.label}: ${track.description}`);
      button.setAttribute("aria-pressed", String(track.id === course.track.id));
      return button;
    }));
  }

  renderProgress(course) {
    const trackPercent = Math.round(course.trackProgress * 100);
    this.progress.setAttribute(
      "aria-label",
      `${course.track.label} progress: ${trackPercent}%`,
    );
    this.progress.replaceChildren(...course.track.stages.map((stage, index) => {
      const segment = element("i");
      const amount = course.mastery(index);
      const percent = Math.round(amount * 100);
      segment.style.setProperty("--fill", `${percent}%`);
      segment.classList.toggle("now", index === course.position.stage);
      segment.classList.toggle("locked", !course.isUnlocked(index));
      segment.setAttribute("role", "progressbar");
      segment.setAttribute("aria-label", `${stage.id}: ${percent}% evidence`);
      segment.setAttribute("aria-valuemin", "0");
      segment.setAttribute("aria-valuemax", "100");
      segment.setAttribute("aria-valuenow", String(percent));
      return segment;
    }));
  }

  renderTyping(exercise, session) {
    this.practice.classList.remove("code-options");
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < exercise.code.length; index += 1) {
      const span = element("span", "char", exercise.code[index]);
      if (index < session.input.length) {
        span.classList.add(session.input[index] === exercise.code[index] ? "correct" : "wrong");
      }
      if (!session.complete && index === session.input.length) span.classList.add("cursor");
      fragment.append(span);
    }
    this.code.replaceChildren(fragment);
    this.capture.hidden = false;
    this.answers.hidden = true;
  }

  renderChoice(exercise, session) {
    const codeOptions = !exercise.code || exercise.options.some((option) => option.includes("\n"));
    this.practice.classList.toggle("code-options", codeOptions);
    const fragment = document.createDocumentFragment();
    for (const character of exercise.code || "?") {
      const span = element("span", character === "?" ? "blank" : "", character);
      fragment.append(span);
    }
    this.code.replaceChildren(fragment);
    this.capture.hidden = true;
    this.answers.hidden = false;
    this.answers.replaceChildren(...exercise.options.map((option) => {
      const button = element("button", "answer", option);
      button.type = "button";
      button.dataset.answer = option;
      if (session.selections.includes(option) && option !== exercise.answer) {
        button.classList.add("wrong");
        button.disabled = true;
      }
      if (session.complete && option === exercise.answer) button.classList.add("correct");
      return button;
    }));
  }

  renderPerformance(exercise, session, performance) {
    const stats = session.stats;
    if (exercise.kind === "typing") {
      this.speed.textContent = stats.wpm;
      this.speedLabel.textContent = "wpm";
    } else {
      this.speed.textContent = stats.attempts;
      this.speedLabel.textContent = "tries";
    }
    this.accuracy.textContent = formatAccuracy(performance.accuracy);
    this.accuracy.title = performance.attempts
      ? `${performance.correct} correct of ${performance.attempts} inputs across ${this.courseBadge.textContent} challenges`
      : "No accuracy evidence yet";
  }

  renderTiming(timing) {
    this.practice.classList.toggle("idle", timing.idle);
    this.exerciseTime.textContent = formatDuration(timing.exerciseMs);
    this.sessionTime.textContent = formatDuration(timing.sessionMs);
    this.sessionTimeLabel.textContent = timing.idle ? "paused" : "session";
    const timerTitle = timing.idle ? "Paused after inactivity" : "";
    this.exerciseTime.title = timerTitle;
    this.sessionTime.title = timerTitle;
    this.remainingTime.textContent = timing.remainingProbes
      ? `~${formatDuration(timing.remainingMs)}`
      : "done";
  }

  renderMap(course, formatStage) {
    this.mapMode.textContent = course.track.label;
    this.mapGrid.replaceChildren(...course.track.stages.map((stage, index) => {
      const button = element("button", "map-node");
      button.type = "button";
      button.dataset.stage = String(index);
      button.classList.toggle("current", index === course.position.stage);
      button.classList.toggle("locked", !course.isUnlocked(index));
      button.disabled = !course.isUnlocked(index);
      button.setAttribute("aria-label", `Open ${stage.id} stage`);

      const code = element("code", "", stage.glyph);
      const meter = element("i", "node-meter");
      meter.style.setProperty("--fill", `${course.mastery(index) * 100}%`);
      button.classList.toggle("mastered", course.status(index).mastered);
      button.classList.toggle("due", course.status(index).due);
      const rule = element("small", "", formatStage(stage));
      button.append(code, meter, rule);
      return button;
    }));
  }

  announce(value) {
    this.live.textContent = "";
    requestAnimationFrame(() => {
      this.live.textContent = value;
    });
  }
}
