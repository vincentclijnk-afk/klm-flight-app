<#
=======================================================
✈️  KLM-FLIGHT-APP — Release Manager (PowerShell)
-------------------------------------------------------
Interactief menu voor:
1️⃣  Nieuwe release aanmaken
2️⃣  Laatste release terugdraaien
3️⃣  Overzicht tonen
4️⃣  Afsluiten
=======================================================
#>

function Show-Menu {
    Clear-Host
    Write-Host "======================================================="
    Write-Host "✈️  KLM-FLIGHT-APP — Release Manager"
    Write-Host "======================================================="
    Write-Host ""
    Write-Host "1️⃣  Nieuwe release aanmaken"
    Write-Host "2️⃣  Laatste release terugdraaien"
    Write-Host "3️⃣  Toon overzicht (CHANGELOG_SUMMARY.md)"
    Write-Host "4️⃣  Afsluiten"
    Write-Host ""
}

do {
    Show-Menu
    $choice = Read-Host "Maak een keuze (1-4)"

    switch ($choice) {
        1 {
            $version = Read-Host "➡️  Voer het versienummer in (bijv. v1.10)"
            if (-not $version) {
                Write-Host "⚠️  Geen versie ingevoerd. Terug naar menu..." -ForegroundColor Yellow
                Start-Sleep 1.5
                continue
            }

            if (-not (Test-Path ".\release-wizard.ps1")) {
                Write-Host "❌ Bestand 'release-wizard.ps1' niet gevonden!" -ForegroundColor Red
                Start-Sleep 2
                continue
            }

            Write-Host "`n🧩 Start release-wizard..."
            & .\release-wizard.ps1 $version
            Pause
        }
        2 {
            if (-not (Test-Path ".\undo-release.ps1")) {
                Write-Host "❌ Bestand 'undo-release.ps1' niet gevonden!" -ForegroundColor Red
                Start-Sleep 2
                continue
            }

            Write-Host "`n🧹 Start undo-release..."
            & .\undo-release.ps1
            Pause
        }
        3 {
            $summaryPath = ".\releases\CHANGELOG_SUMMARY.md"
            if (Test-Path $summaryPath) {
                Write-Host "`n📘 Inhoud van CHANGELOG_SUMMARY.md:`n" -ForegroundColor Cyan
                Get-Content $summaryPath | Out-Host
            } else {
                Write-Host "⚠️  Bestand '$summaryPath' niet gevonden!" -ForegroundColor Yellow
            }
            Pause
        }
        4 {
            Write-Host "`n👋 Afsluiten... Tot de volgende release!" -ForegroundColor Green
            break
        }
        Default {
            Write-Host "⚠️  Ongeldige keuze, probeer opnieuw..." -ForegroundColor Yellow
            Start-Sleep 1.5
        }
    }

} while ($choice -ne 4)
