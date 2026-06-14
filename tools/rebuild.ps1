param(
    [int]$CorpusSize = 48,
    [int]$CandidateLimit = 8000,
    [string]$NodePath
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Research = Join-Path $Root ".research"
$Archive = Join-Path $Research "go1.26.4.windows-amd64.zip"
$ToolchainBase = Join-Path $Research "go1.26.4-full"
$GoRoot = Join-Path $ToolchainBase "go"
$Go = Join-Path $GoRoot "bin\go.exe"
$ExpectedHash = "3ca8fb4630b07c419cbdd51f754e31363cfcfb83b3a5354d9e895c90be2cc345"

New-Item -ItemType Directory -Force $Research | Out-Null

if (-not (Test-Path -LiteralPath $Archive)) {
    Invoke-WebRequest -UseBasicParsing `
        -Uri "https://go.dev/dl/go1.26.4.windows-amd64.zip" `
        -OutFile $Archive
}

$ActualHash = (Get-FileHash -Algorithm SHA256 $Archive).Hash.ToLowerInvariant()
if ($ActualHash -ne $ExpectedHash) {
    throw "Go toolchain checksum mismatch: $ActualHash"
}

if (-not (Test-Path -LiteralPath (Join-Path $GoRoot "src\fmt\print.go"))) {
    Expand-Archive -LiteralPath $Archive -DestinationPath $ToolchainBase -Force
}

$Node = if ($NodePath) {
    (Resolve-Path -LiteralPath $NodePath -ErrorAction Stop).Path
}
else {
    (Get-Command node -ErrorAction Stop).Source
}
$Drive = "R:"
if (Test-Path "$Drive\") {
    throw "$Drive is already in use; edit tools/rebuild.ps1 to select another temporary drive."
}

Push-Location $Root
try {
    # Go on Windows may reject a GOROOT containing non-ASCII path segments.
    subst $Drive $ToolchainBase
    $env:GO126 = "$Drive\go\bin\go.exe"
    $env:GOROOT126 = "$Drive\go"
    $env:CORPUS_SIZE = [string]$CorpusSize
    $env:CANDIDATE_LIMIT = [string]$CandidateLimit

    & $Node "tools\extract-grammar.mjs"
    if ($LASTEXITCODE -ne 0) { throw "Grammar extraction failed." }
    & $Node "tools\extract-stdlib.mjs"
    if ($LASTEXITCODE -ne 0) { throw "Standard-library extraction failed." }
    & $Node "tools\build-corpus.mjs"
    if ($LASTEXITCODE -ne 0) { throw "Corpus validation failed." }
    $Tests = Get-ChildItem -LiteralPath (Join-Path $Root "tests") -Filter "*.test.mjs" |
        ForEach-Object { $_.FullName }
    & $Node --test @Tests
    if ($LASTEXITCODE -ne 0) { throw "Tests failed." }
}
finally {
    subst $Drive /D 2>$null
    Pop-Location
}
