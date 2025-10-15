#!/bin/bash
# =======================================================
# ✈️  KLM-FLIGHT-APP – Changelog generator (v1.3)
# -------------------------------------------------------
# Werkt op Linux / macOS / Termux.
# Maakt automatisch een changelog aan in releases/changelog/
# en voegt een samenvatting toe aan het hoofdbestand met release notes.
# =======================================================

VERSION=$1
DATE=$(date +%Y-%m-%d)
CHANGELOG_DIR="releases/changelog"

# 🧩 Detecteer automatisch het juiste release notes bestand
if [ -f "releases/release-notes.txt" ]; then
  NOTES_FILE="releases/release-notes.txt"
elif [ -f "releases/release-notes.md" ]; then
  NOTES_FILE="releases/release-notes.md"
elif [ -f "releases/releasenotes v1.0" ]; then
  NOTES_FILE="releases/releasenotes v1.0"
else
  NOTES_FILE=""
fi

# 🧱 Check of versie is opgegeven
if [ -z "$VERSION" ]; then
  echo "⚠️  Gebruik: ./create-changelog.sh vX.X"
  exit 1
fi

# 📝 Maak changelog-map aan als die nog niet bestaat
mkdir -p "$CHANGELOG_DIR"

# 📄 Maak nieuw changelogbestand
CHANGELOG_FILE="$CHANGELOG_DIR/$VERSION.md"

cat > "$CHANGELOG_FILE" <<EOF
# ✈️ KLM-FLIGHT-APP — Changelog $VERSION
**Datum:** $DATE

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
Interne verbeteringen, afhankelijkheden, of build-updates:
- 

## 🧱 Baseline / Context
Altijd aanwezig voor deze fase van de app:
- Schiphol API fallback actief  
- Mockdata AMS–DEL / AMS–BOM

---

✈️ **KLM-FLIGHT-APP** – interne changelogtemplate  
_Automatisch gegenereerd: $DATE_
EOF

echo "✅ Nieuw changelogbestand aangemaakt: $CHANGELOG_FILE"

# 🧾 Voeg korte beschrijving toe
echo -n "📝 Korte beschrijving voor $VERSION (1 regel): "
read DESCRIPTION

# 📚 Voeg entry toe aan release notes als bestand gevonden is
if [ -n "$NOTES_FILE" ]; then
  echo "✅ Release notes bestand gevonden: $NOTES_FILE"
  echo "$VERSION | $DATE | $DESCRIPTION" >> "$NOTES_FILE"
  echo "✅ Versie $VERSION toegevoegd aan '$NOTES_FILE'"
else
  echo "⚠️  Geen release notes bestand gevonden – alleen changelog aangemaakt."
fi

echo "✅ Klaar."
