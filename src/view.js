function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
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
    this.accuracy = document.querySelector("#accuracy");
    this.streak = document.querySelector("#streak");
    this.progress = document.querySelector("#progress");
    this.trackSwitch = document.querySelector("#track-switch");
    this.languageVersion = document.querySelector("#language-version");
    this.map = document.querySelector("#course-map");
    this.mapGrid = document.querySelector("#map-grid");
    this.mapTrack = document.querySelector("#map-track");
    this.soundButton = document.querySelector("#sound-button");
    this.live = document.querySelector("#live-status");
  }

  focus() {
    this.capture.focus({ preventScroll: true });
  }

  setLanguageVersion(version) {
    this.languageVersion.textContent = version;
    this.languageVersion.title = `Generated and validated with ${version}`;
    this.languageVersion.setAttribute("aria-label", `Go language version ${version}`);
  }

  render({ course, grammar, exercise, session }) {
    const stageIndex = course.position.stage;
    const status = course.status(stageIndex);
    this.practice.dataset.kind = exercise.kind;
    this.practice.classList.toggle("active", Boolean(session.startedAt || session.selected));
    this.practice.classList.toggle("complete", session.complete);
    const reviewing = course.position.stage < course.position.frontier;
    this.glyph.textContent = `${reviewing ? "~ " : ""}${course.stage.glyph}`;
    this.counter.textContent = `${Math.round(status.ratio * 100)}%`;
    this.rule.textContent = grammar.format(course.stage.production);
    this.streak.textContent = course.store.state.streak;
    this.renderTracks(course);
    this.renderProgress(course);
    this.renderMap(course, grammar);

    if (exercise.kind === "typing") {
      this.renderTyping(exercise, session);
    } else {
      this.renderChoice(exercise, session);
    }
  }

  renderTracks(course) {
    this.trackSwitch.replaceChildren(...course.tracks.map((track) => {
      const button = element("button", "track-button", track.glyph);
      button.type = "button";
      button.dataset.track = track.id;
      button.classList.toggle("current", track.id === course.track.id);
      button.setAttribute("aria-label", `${track.id} track`);
      button.setAttribute("aria-pressed", String(track.id === course.track.id));
      return button;
    }));
  }

  renderProgress(course) {
    this.progress.replaceChildren(...course.track.stages.map((stage, index) => {
      const segment = element("i");
      const amount = course.mastery(index);
      segment.style.setProperty("--fill", `${Math.round(amount * 100)}%`);
      segment.classList.toggle("now", index === course.position.stage);
      segment.classList.toggle("locked", !course.isUnlocked(index));
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
    const stats = session.stats;
    this.speed.textContent = stats.wpm;
    this.accuracy.textContent = stats.accuracy;
  }

  renderChoice(exercise, session) {
    const codeOptions = !exercise.code || exercise.options.some((option) => option.includes("\n"));
    this.practice.classList.toggle("code-options", codeOptions);
    const fragment = document.createDocumentFragment();
    for (const character of exercise.code || "✓ ?") {
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
    this.speed.textContent = session.attempts;
    this.accuracy.textContent = session.attempts ? Math.round(100 / session.attempts) : 100;
  }

  renderMap(course, grammar) {
    this.mapTrack.textContent = course.track.glyph;
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
      const rule = element("small", "", grammar.format(stage.production));
      button.append(code, meter, rule);
      return button;
    }));
  }

  setSound(enabled) {
    this.soundButton.classList.toggle("off", !enabled);
    this.soundButton.setAttribute("aria-pressed", String(enabled));
  }

  announce(value) {
    this.live.textContent = "";
    requestAnimationFrame(() => {
      this.live.textContent = value;
    });
  }
}
