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

cat <<EOF > "$CHANGELOG_FILE"
# 📦 Changelog $VERSION
📅 Datum: $DATE

## ✨ Nieuw
-

## 🐞 Opgelost
-

## 🚧 Bekende problemen
-

## 📘 Notities
-
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
