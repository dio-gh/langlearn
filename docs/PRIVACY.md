# Privacy

go{} dojo has no server-side application component.

The published site makes no runtime network requests and includes no analytics,
advertising, remote fonts, third-party scripts, accounts, or telemetry.

Practice state is stored in the current browser's `localStorage` under a
versioned application key. It contains:

- current track and stage positions
- evidence counts and recent generated seed identifiers
- misconception/facet counters
- streak and aggregate completion counts
- sound preference

This data remains on the device unless the browser, an extension, or the user
syncs or exports browser storage. Clearing site data resets it.

The repository does not require API keys or runtime secrets. Build-time research
clones and downloaded Go toolchains are stored in the ignored `.research/`
directory.
