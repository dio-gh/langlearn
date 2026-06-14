# Deployment

## Production Artifact

The repository root is the production artifact. There is no website build step
and no generated deployment directory.

Required root files:

- `index.html`
- `styles.css`
- `.nojekyll`
- `src/`
- `assets/`

All runtime URLs are relative, so the site works at a GitHub project path such
as `https://dio-gh.github.io/langlearn/`.

## GitHub Pages

After pushing `master`:

1. Open the repository on GitHub.
2. Open **Settings**, then **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **master** and folder **/(root)**.
5. Save and wait for the Pages deployment to complete.

No token, custom workflow, or `gh-pages` branch is required for this mode.

## Continuous Verification

`.github/workflows/verify.yml` runs on pushes to `master` and pull requests. It
installs Node.js 24 and Go 1.26.4, then replays the checked-in test suite against
the committed generated corpus.

The workflow verifies the deployable artifact; it does not regenerate or commit
corpus files. Rebuilding is intentionally an explicit maintainer operation.

## Rebuilding Generated Data

On Windows with PowerShell and Node.js 20 or newer:

```powershell
pwsh tools/fetch-sources.ps1
pwsh tools/rebuild.ps1
```

The rebuild downloads and checksum-verifies the official Go 1.26.4 toolchain,
extracts the grammar and library signatures, rebuilds the validated seed
manifest, and runs all tests.

Commit generated files and their input hashes together.
