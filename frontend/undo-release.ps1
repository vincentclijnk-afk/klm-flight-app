<#
=======================================================
✈️  KLM-FLIGHT-APP — Undo Release Script (PowerShell)
-------------------------------------------------------
Herstelt de laatste release (tag + commit)
of een specifieke versie als argument.
Met bevestiging vóór verwijdering.
Gebruik:
    .\undo-release.ps1           → laatste release terugdraaien
    .\undo-release.ps1 v1.9      → specifieke versie terugdraaien
=======================================================
#>

param(
    [string]$Version
)

# 🔍 Zoek laatste tag als er geen versie is opgegeven
if (-not $Version) {
    $Version = git describe --tags (git rev-list --tags --max-count=1) 2>$null
    if (-not $Version) {
        Write-Host "⚠️  Geen release-tags gevonden om ongedaan te maken." -ForegroundColor Yellow
        exit
    }
    Write-Host "📦 Geen versie opgegeven — laatste release gedetecteerd: $Version"
} else {
    Write-Host "📦 Specifieke release opgegeven: $Version"
}

Write-Host "-------------------------------------------------------"
Write-Host "🧹 Klaar om release terug te draaien: $Version"
Write-Host "-------------------------------------------------------"

# ❓Bevestiging vragen
$confirm = Read-Host "⚠️  Weet je zeker dat je release '$Version' wilt verwijderen? (ja/nee)"
if ($confirm -ne "ja" -and $confirm -ne "y") {
    Write-Host "❎ Actie geannuleerd. Er is niets gewijzigd." -ForegroundColor Yellow
    exit
}

Write-Host "-------------------------------------------------------"
Write-Host "🚧 Verwijderen gestart..."
Write-Host "-------------------------------------------------------"

# 🏷️ Controleer of de tag bestaat
$tagExists = git rev-parse $Version 2>$null
if ($tagExists) {
    git tag -d $Version | Out-Null
    Write-Host "✅ Tag verwijderd: $Version"
} else {
    Write-Host "⚠️  Geen tag '$Version' gevonden."
}

# 🔙 Controleer of laatste commit hoort bij de release
$lastCommitMsg = git log -1 --pretty=%B
if ($lastCommitMsg -match $Version) {
    git reset --soft HEAD~1 | Out-Null
    Write-Host "✅ Laatste commit teruggedraaid (soft reset — bestanden behouden)"
} else {
    Write-Host "⚠️  Laatste commit hoort niet bij $Version — commit blijft behouden."
}

Write-Host "------------------------------------------"
Write-Host "🧾 Release $Version is lokaal verwijderd."
Write-Host "💡 Vergeet niet om ook de remote tag te wissen (indien gepusht):"
Write-Host "   git push origin :refs/tags/$Version"
Write-Host "------------------------------------------"
