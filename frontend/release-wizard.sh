#!/bin/bash
# =======================================================
# ✈️  KLM-FLIGHT-APP – Release Wizard
# -------------------------------------------------------
# 1️⃣ Maakt automatisch een changelog
# 2️⃣ Werkt release-notes bij
# 3️⃣ Maakt een git commit + tag
# -------------------------------------------------------
# Gebruik: ./release-wizard.sh v1.4
# =======================================================

VERSION=$1
DATE=$(date +%Y-%m-%d)
CHANGELOG_DIR="releases/changelog"

# 🔍 Check parameters
if [ -z "$VERSION" ]; then
  echo "❌ Gebruik: ./release-wizard.sh vX.X"
  exit 1
fi

# 📂 Maak changelogmap aan als die niet bestaat
mkdir -p "$CHANGELOG_DIR"
CHANGELOG_FILE="$CHANGELOG_DIR/$VERSION.md"

# 🔎 Zoek automatisch het juiste release notes bestand
if [ -f "releases/release-notes.txt" ]; then
  NOTES_FILE="releases/release-notes.txt"
elif [ -f "releases/release-notes.md" ]; then
  NOTES_FILE="releases/release-notes.md"
elif [ -f "releases/releasenotes v1.0" ]; then
  NOTES_FILE="releases/releasenotes v1.0"
else
  NOTES_FILE=""
fi

echo "-------------------------------------------------------"
echo "✈️  KLM-FLIGHT-APP Release Wizard"
echo "-------------------------------------------------------"
echo "🆕 Nieuwe versie: $VERSION"
echo "📅 Datum: $DATE"
echo ""

# 📝 Vraag korte beschrijving
echo -n "📄 Beschrijving (1 regel): "
read DESCRIPTION
echo ""

# 📘 Maak changelogbestand
cat <<EOF > "$CHANGELOG_FILE"
# 📦 Changelog $VERSION
📅 Datum: $DATE

## ✨ Nieuw
- $DESCRIPTION

## 🐞 Opgelost
-

## 🚧 Bekende problemen
-

## 📘 Notities
-
EOF

echo "✅ Nieuw changelogbestand: $CHANGELOG_FILE"

# 🧾 Update release notes als bestand aanwezig is
if [ -n "$NOTES_FILE" ]; then
  echo "$VERSION | $DATE | $DESCRIPTION" >> "$NOTES_FILE"
  echo "✅ Toegevoegd aan $NOTES_FILE"
else
  echo "⚠️  Geen release-notes bestand gevonden."
fi

# 🧩 Git-commit en tag aanmaken
git add .
git commit -m "📦 Release $VERSION — $DESCRIPTION" --quiet

if [ $? -ne 0 ]; then
  echo "⚠️  Geen wijzigingen om te committen of fout bij commit."
else
  echo "✅ Git commit aangemaakt."
fi

git tag -a "$VERSION" -m "✈️ KLM-FLIGHT-APP $VERSION — $DESCRIPTION"
echo "✅ Git tag aangemaakt: $VERSION"
echo ""

echo "------------------------------------------"
echo "📘 Release $VERSION succesvol voorbereid"
echo "💡 Gebruik 'git push && git push --tags' om te publiceren"
echo "------------------------------------------"
