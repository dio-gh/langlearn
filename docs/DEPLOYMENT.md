# Deployment

## Production Artifact

The repository root is the production artifact. There is no website build step
or generated deployment directory.

Required root files are `index.html`, `styles.css`, `.nojekyll`, `src/`, and
`assets/`. All runtime URLs are relative, so GitHub project Pages works at
`https://dio-gh.github.io/langlearn/`.

## GitHub Pages

After pushing `master`:

1. Open the repository on GitHub.
2. Open **Settings**, then **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select **master** and **/(root)**.
5. Save and wait for deployment.

No token, custom deployment workflow, or `gh-pages` branch is required.

## Continuous Verification

`.github/workflows/verify.yml` runs on pushes to `master` and pull requests. It
installs Node.js 24 and Go 1.26.4, then runs the complete test suite against the
committed generated corpus.

## Rebuilding The Go Course

On Windows with PowerShell and Node.js 20 or newer:

```powershell
pwsh tools/go/fetch-sources.ps1
pwsh tools/go/rebuild.ps1
```

The script checksum-verifies the Go 1.26.4 toolchain, extracts grammar and
library data, rebuilds the validated seed manifest, and runs all tests. Commit
generated files and their input hashes together.
