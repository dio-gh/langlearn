$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Research = Join-Path $Root ".research"
$Manifest = Get-Content (Join-Path $PSScriptRoot "sources.json") -Raw | ConvertFrom-Json

New-Item -ItemType Directory -Force $Research | Out-Null

foreach ($Property in $Manifest.PSObject.Properties) {
    $Name = $Property.Name
    $Source = $Property.Value
    $Target = Join-Path $Research $Name

    if (-not (Test-Path -LiteralPath $Target)) {
        $Arguments = @("clone", "--depth", "1")
        if ($Source.paths) {
            $Arguments += @("--filter=blob:none", "--sparse")
        }
        $Arguments += @($Source.url, $Target)
        & git @Arguments
    }

    if ($Source.paths) {
        & git -C $Target sparse-checkout set @($Source.paths)
    }

    & git -C $Target fetch --depth 1 origin $Source.revision
    & git -C $Target checkout --detach $Source.revision
    Write-Host "$Name $($Source.revision)"
}
