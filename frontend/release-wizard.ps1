<#
=======================================================
✈️  KLM-FLIGHT-APP — Release Wizard (PowerShell v2.2)
-------------------------------------------------------
1️⃣  Maakt automatisch een changelog (met samenvatting)
2️⃣  Werkt release-notes.txt en CHANGELOG_SUMMARY.md bij
3️⃣  Maakt een Git commit + tag aan
4️⃣  Update release-tools.md datum
5️⃣  Controleert op bestaande versies (veilig)
=======================================================
Gebruik:
    .\release-wizard.ps1 v1.9
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

$Date = Get-Date -Format "yyyy-MM-dd"
$ReleasesDir   = "releases"
$ChangelogDir  = "$ReleasesDir\changelog"
$NotesFile     = "$ReleasesDir\release-notes.txt"
$ToolsFile     = "$ReleasesDir\release-tools.md"
$SummaryFile   = "$ReleasesDir\CHANGELOG_SUMMARY.md"
$ChangelogFile = "$ChangelogDir\$Version.md"

Write-Host "🚀 Nieuwe release voorbereiden: $Version"
Write-Host "📅 Datum: $Date`n"

# --- Veiligheidscontrole ---
if (Test-Path $ChangelogFile) {
    Write-Host "❌ Fout: changelog '$ChangelogFile' bestaat al!" -ForegroundColor Red
    exit
}
if (git rev-parse $Version 2>$null) {
    Write-Host "❌ Fout: Git-tag '$Version' bestaat al!" -ForegroundColor Red
    exit
}

# --- Changelogmap aanmaken ---
if (-not (Test-Path $ChangelogDir)) { New-Item -ItemType Directory -Path $ChangelogDir | Out-Null }

# --- Beschrijving vragen ---
$Desc = Read-Host "📝 Beschrijving van de release (1 zin)"

# --- Changelogbestand aanmaken ---
@"
# ✈️ KLM-FLIGHT-APP — Changelog $Version
**Datum:** $Date

📘 **Samenvatting:** $Desc

---

## 🚀 Nieuwe functies
Beschrijf nieuwe onderdelen of uitbreidingen van de app:
- 

## 🧩 Verbeteringen
Noem kleine verbeteringen, optimalisaties of visuele aanpassingen:
- 

## 🐞 Opgeloste bugs
Wat is er verholpen sinds de vorige versie:
- 

## ⚙️ Technische wijzigingen
Interne verbeteringen, afhankelijkheden of build-updates:
- 

## 🧱 Baseline / Context
Altijd aanwezig voor deze fase van de app:
- Schiphol API fallback actief  
- Mockdata AMS–DEL / AMS–BOM

---

✈️ **KLM-FLIGHT-APP** – interne changelogtemplate  
_Automatisch gegenereerd: $Date_
"@ | Out-File -FilePath $ChangelogFile -Encoding utf8

Write-Host "✅ Nieuw changelogbestand: $ChangelogFile"

# --- Release notes bijwerken ---
"`n### $Version — $Date`n$Desc`n" | Out-File -FilePath $NotesFile -Append -Encoding utf8
Write-Host "📘 Release notes bijgewerkt."

# --- CHANGELOG_SUMMARY.md bijwerken ---
if (-not (Test-Path $SummaryFile)) {
    @"
# ✈️ KLM-FLIGHT-APP — Changelog Samenvatting
Overzicht van alle releases met hun korte beschrijving.

| Versie | Datum | Samenvatting |
|:-------|:-------|:-------------|
"@ | Out-File -FilePath $SummaryFile -Encoding utf8
}
"| $Version | $Date | $Desc |" | Out-File -FilePath $SummaryFile -Append -Encoding utf8
Write-Host "🧾 CHANGELOG_SUMMARY.md bijgewerkt."

# --- Git commit + tag ---
git add $ChangelogFile, $NotesFile, $SummaryFile
git commit -m "📦 Release $Version — $Desc" | Out-Null
git tag $Version
Write-Host "✅ Git commit + tag aangemaakt."

# --- release-tools.md datum bijwerken ---
if (Test-Path $ToolsFile) {
    (Get-Content $ToolsFile) -replace 'Laatste update: _.*_', "Laatste update: _$Date_" | 
        Set-Content -Encoding utf8 $ToolsFile
    git add $ToolsFile
    git commit -m "🗓 release-tools.md bijgewerkt met datum $Date" | Out-Null
    Write-Host "🛠  release-tools.md bijgewerkt."
}

Write-Host ""
Write-Host "-------------------------------------------------------------"
Write-Host "📦 Release $Version succesvol voorbereid!"
Write-Host "👉 Vergeet niet te publiceren met:"
Write-Host "   git push && git push --tags"
Write-Host "-------------------------------------------------------------"
