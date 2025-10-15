#!/bin/bash
# =======================================================
# ✈️  KLM-FLIGHT-APP — Release Manager (Bash)
# -------------------------------------------------------
# Interactief menu voor:
# 1️⃣ Nieuwe release aanmaken
# 2️⃣ Laatste release terugdraaien
# 3️⃣ Toon overzicht (CHANGELOG_SUMMARY.md)
# 4️⃣ Release pushen naar GitHub
# 5️⃣ Afsluiten
# =======================================================

show_menu() {
  clear
  echo "======================================================="
  echo "✈️  KLM-FLIGHT-APP — Release Manager"
  echo "======================================================="
  echo ""
  echo "1️⃣  Nieuwe release aanmaken"
  echo "2️⃣  Laatste release terugdraaien"
  echo "3️⃣  Toon overzicht (CHANGELOG_SUMMARY.md)"
  echo "4️⃣  Push release naar GitHub"
  echo "5️⃣  Afsluiten"
  echo ""
}

while true; do
  show_menu
  read -p "Maak een keuze (1-5): " choice

  case $choice in
    1)
      read -p "➡️  Voer het versienummer in (bijv. v1.10): " version
      if [ -z "$version" ]; then
        echo "⚠️  Geen versie ingevoerd. Terug naar menu..."
        sleep 1.5
        continue
      fi

      if [ ! -f "./release-wizard.sh" ]; then
        echo "❌ release-wizard.sh niet gevonden!"
        sleep 1.5
        continue
      fi

      echo ""
      echo "🧩 Start release-wizard..."
      bash ./release-wizard.sh "$version"
      read -p "Druk op Enter om terug te keren naar het menu..." ;;
    
    2)
      if [ ! -f "./undo-release.sh" ]; then
        echo "❌ undo-release.sh niet gevonden!"
        sleep 1.5
        continue
      fi

      echo ""
      echo "🧹 Start undo-release..."
      bash ./undo-release.sh
      read -p "Druk op Enter om terug te keren naar het menu..." ;;
    
    3)
      SUMMARY_FILE="./releases/CHANGELOG_SUMMARY.md"
      if [ -f "$SUMMARY_FILE" ]; then
        echo ""
        echo "📘 Inhoud van CHANGELOG_SUMMARY.md:"
        echo "--------------------------------------"
        cat "$SUMMARY_FILE"
        echo "--------------------------------------"
      else
        echo "⚠️  Geen samenvatting gevonden."
      fi
      read -p "Druk op Enter om terug te keren naar het menu..." ;;
    
    4)
      echo ""
      echo "🚀 Pushing commits en tags naar GitHub..."
      git push && git push --tags
      echo "✅ Push voltooid!"
      read -p "Druk op Enter om terug te keren naar het menu..." ;;
    
    5)
      echo ""
      echo "👋 Afsluiten... Tot de volgende release!"
      exit 0 ;;
    
    *)
      echo "⚠️  Ongeldige keuze, probeer opnieuw..."
      sleep 1.5 ;;
  esac
done
