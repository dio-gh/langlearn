export class Course {
  constructor(language, factory, store, learner) {
    this.language = language;
    this.tracks = language.tracks;
    this.factory = factory;
    this.store = store;
    this.learner = learner;
    this.factory.validate(this.tracks);
    const state = this.store.ensureCourse(language.id, language.defaultTrack);
    if (!this.trackById(state.activeTrack)) {
      this.store.update((current) => {
        current.courses[language.id].activeTrack = language.defaultTrack;
      });
    }
  }

  get languageId() {
    return this.language.id;
  }

  get courseState() {
    return this.store.state.courses[this.languageId];
  }

  trackById(id) {
    return this.tracks.find((track) => track.id === id);
  }

  get track() {
    return this.trackById(this.courseState.activeTrack);
  }

  get position() {
    const saved = this.courseState.positions[this.track.id]
      ?? { stage: 0, frontier: 0, attempt: 0 };
    const frontier = Math.max(0, Math.min(saved.frontier ?? saved.stage, this.track.stages.length - 1));
    return {
      stage: Math.max(0, Math.min(saved.stage, frontier)),
      frontier,
      attempt: Math.max(0, saved.attempt),
    };
  }

  get stage() {
    return this.track.stages[this.position.stage];
  }

  get exercise() {
    const record = this.learner.skill(this.languageId, this.track.id, this.stage.id);
    return this.factory.choose(this.track, this.stage, this.position.attempt, record);
  }

  status(stageIndex) {
    return this.learner.status(
      this.languageId,
      this.track.id,
      this.track.stages[stageIndex],
    );
  }

  mastery(stageIndex) {
    return this.status(stageIndex).ratio;
  }

  get trackProgress() {
    const total = this.track.stages.reduce(
      (sum, _stage, index) => sum + this.mastery(index),
      0,
    );
    return total / this.track.stages.length;
  }

  isUnlocked(stageIndex) {
    if (stageIndex === 0) return true;
    return this.status(stageIndex - 1).mastered;
  }

  setTrack(id) {
    if (!this.trackById(id)) return;
    this.store.update((state) => {
      const course = state.courses[this.languageId];
      course.activeTrack = id;
      course.positions[id] ??= { stage: 0, frontier: 0, attempt: 0 };
    });
  }

  selectStage(stageIndex) {
    if (!this.isUnlocked(stageIndex)) return false;
    this.store.update((state) => {
      const positions = state.courses[this.languageId].positions;
      const position = positions[this.track.id] ??= { stage: 0, frontier: 0, attempt: 0 };
      position.stage = stageIndex;
      position.frontier = Math.max(position.frontier ?? 0, stageIndex);
      position.attempt += 1;
    });
    return true;
  }

  recordMiss(exercise, session) {
    this.learner.recordMiss(
      this.languageId,
      this.track.id,
      this.stage,
      exercise,
      session.selected,
    );
  }

  abandon(exercise, session) {
    this.learner.recordAbandon(
      this.languageId,
      this.track.id,
      this.stage,
      exercise,
      session,
    );
    this.advanceAttempt();
  }

  complete(exercise, session) {
    const trackId = this.track.id;
    const stageIndex = this.position.stage;
    this.learner.recordCompletion(
      this.languageId,
      trackId,
      this.stage,
      exercise,
      session,
    );
    this.store.update((state) => {
      const positions = state.courses[this.languageId].positions;
      const position = positions[trackId] ??= {
        stage: stageIndex,
        frontier: stageIndex,
        attempt: 0,
      };
      position.attempt += 1;
      if (this.status(stageIndex).mastered && stageIndex < this.track.stages.length - 1) {
        position.frontier = Math.max(position.frontier ?? stageIndex, stageIndex + 1);
      }
      position.stage = this.nextStage(position.frontier ?? stageIndex, stageIndex);
    });
  }

  advanceAttempt() {
    this.store.update((state) => {
      const positions = state.courses[this.languageId].positions;
      const position = positions[this.track.id] ??= { stage: 0, frontier: 0, attempt: 0 };
      position.attempt += 1;
    });
  }

  nextStage(frontier, current) {
    if (!this.status(current).mastered) return current;
    const round = this.store.state.learner.round;
    const unlocked = this.track.stages
      .map((stage, index) => ({ stage, index, status: this.status(index) }))
      .filter((item) => item.index <= frontier);
    const due = unlocked
      .filter((item) => item.status.due)
      .sort((left, right) => left.status.record.lastRound - right.status.record.lastRound);
    if (due.length && round % 3 === 0) return due[0].index;

    const weak = unlocked
      .filter((item) => !item.status.mastered)
      .sort((left, right) => left.status.ratio - right.status.ratio);
    if (weak.length && round % 4 === 0) return weak[0].index;
    return frontier;
  }
}
