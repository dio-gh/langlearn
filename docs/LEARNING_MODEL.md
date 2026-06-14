# Learning Evidence Model

The dojo treats mastery as a falsifiable claim. Completion is not evidence by
itself, and a contradiction can reopen a previously mastered stage.

## Evidence Strength

From strongest to weakest:

1. A first-try answer to an adversarial contrast or prediction probe.
2. A clean exact construction with no corrected characters.
3. A completion after correction.
4. Repeated guesses, which are negative evidence.

A multiple-choice response faster than 350 ms is retained in history but does
not count as strong evidence. This prevents accidental clicks and rapid option
cycling from satisfying mastery.

## Mastery Gate

A syntax stage currently requires all of the following:

- eight distinct validated seeds
- four first-try adversarial successes
- positive accumulated evidence score
- evidence spanning at least five completed exercises
- six clean outcomes in the recent eight
- clean evidence across three distinct facets

Meaning and library stages use similarly conservative thresholds: seven
distinct seeds, five first-try successes, temporal spread, recent cleanliness,
and at least two facets.

The displayed percentage is the weakest satisfied fraction among these
requirements. It cannot reach 100% by overfitting one dimension.

## Misconception Ledger

Every wrong option carries a generated diagnostic class:

- syntax mutations: delimiter, separator, operator, keyword, or identifier
- semantic alternatives: branch inversion, off-by-one, map zero value, defer
  order, closure capture, channel receive order, and related near-misses
- library alternatives: confusion with an exported API from another package

Failures increase debt for that class. Candidate scheduling scores future
exercises higher when their facets or diagnostics overlap unresolved debt.
Clean first-try contrasts pay that debt down.

## Fuzzing Loop

The scheduler prioritizes:

1. unseen validated seeds
2. adversarial probes over copying
3. probes matching unresolved misconceptions
4. facets without clean evidence
5. old mastered stages that are due for retention review

The same seed is kept out of the recent window whenever alternatives exist.
Every third or fourth transition may revisit due or weak prior material.

## Revocation

Mastery is not permanent metadata. A wrong answer immediately appends a
contradiction to the recent evidence window, lowers the evidence score, and
reopens the stage. Later stages may remain in the learner's history, but the
scheduler returns to the weak prerequisite until it is repaired.

## Limits

This model gathers behavioral evidence, not proof of internal understanding.
It makes lucky guessing increasingly improbable and detects many stable wrong
expectations, but cannot rule out outside assistance, memorization of the
bounded corpus, or misconceptions outside the generated probe families.
