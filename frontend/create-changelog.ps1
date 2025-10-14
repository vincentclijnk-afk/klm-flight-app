<#
 🧾 Script: create-changelog.ps1
 Doel: maakt automatisch een changelogbestand aan én voegt het toe aan de release notes
 Gebruik: .\create-changelog.ps1 v1.3
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

# 1️⃣ Datum en paden
$Date = Get-Date -Format "yyyy-MM-dd"
$ChangelogDir = "releases\changelog"
$FilePath = "$ChangelogDir\$Version.md"
$NotesFile = "releases\releasenotes v1.0"

# 2️⃣ Controleren of changelogmap bestaat
if (!(Test-Path $ChangelogDir)) {
    Write-Host "📂 Map $ChangelogDir bestaat niet, aanmaken..."
    New-Item -ItemType Directory -Force -Path $ChangelogDir | Out-Null
}

# 3️⃣ Controleren of changelog al bestaat
if (Test-Path $FilePath) {
    Write-Host "⚠️  Changelog voor $Version bestaat al!"
    exit
}

# 4️⃣ Nieuw changelogbestand aanmaken
@"
# 📦 Changelog $Version
📅 Datum: $Date

## ✨ Nieuw
- 

## 🐞 Opgelost
- 

## 🚧 Bekende problemen
- 

## 📘 Notities
- 
"@ | Out-File -FilePath $FilePath -Encoding utf8

Write-Host "✅ Nieuw changelogbestand aangemaakt: $FilePath"
Write-Host ""

# 5️⃣ Toevoegen aan release notes (indien aanwezig)
if (Test-Path $NotesFile) {
    Write-Host "📝 Korte beschrijving voor $Version (1 regel):"
    $Summary = Read-Host
    "$Version | $Date | $Summary" | Out-File -FilePath $NotesFile -Append -Encoding utf8
    Write-Host "✅ Versie $Version toegevoegd aan '$NotesFile'"
}
else {
    Write-Host "⚠️  Bestand '$NotesFile' niet gevonden — release notes niet bijgewerkt."
}
