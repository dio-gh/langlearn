# Privacy

`langlearn` has no server-side application component.

The published site makes no runtime network requests and includes no analytics,
advertising, remote fonts, third-party scripts, accounts, audio, or telemetry
transmission.

Practice state is stored in the current browser's `localStorage` under a
versioned application key. It contains:

- active language, track, and stage positions
- evidence counts and recent generated seed identifiers
- misconception and facet counters
- completion-duration samples used for local estimates
- streak and aggregate completion counts
- color-theme preference

This data remains on the device unless browser software or the user syncs or
exports browser storage. Clearing site data resets it.

The repository requires no API keys or runtime secrets. Build-time research
clones and downloaded toolchains are stored in ignored `.research/`.
