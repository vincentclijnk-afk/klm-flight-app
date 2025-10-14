#!/bin/bash
# 🧾 Script: update-notes.sh
# Doel: voegt automatisch een regel toe aan het release-notes bestand

VERSION=$1
DATE=$(date +%Y-%m-%d)
NOTES_FILE="releases/releasenotes v1.0"

# 1️⃣ Controleren of er een versie is opgegeven
if [ -z "$VERSION" ]; then
  echo "❌ Gebruik: ./update-notes.sh vX.Y"
  exit 1
fi

# 2️⃣ Check of bestand bestaat
if [ ! -f "$NOTES_FILE" ]; then
  echo "⚠️  Bestand '$NOTES_FILE' niet gevonden!"
  exit 1
fi

# 3️⃣ Samenvatting vragen
echo "📝 Korte beschrijving voor $VERSION (1 regel):"
read SUMMARY

# 4️⃣ Nieuwe regel toevoegen
echo "${VERSION} | ${DATE} | ${SUMMARY}" >> "$NOTES_FILE"

# 5️⃣ Bevestiging
echo "✅ Versie ${VERSION} toegevoegd aan '${NOTES_FILE}'."
