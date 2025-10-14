#!/bin/bash
# =======================================================
# ✈️  KLM-FLIGHT-APP — Release Tag Generator
# -------------------------------------------------------
# Maakt automatisch een commit + git-tag aan met changelog.
# Gebruik: ./create-release-tag.sh v1.3
# =======================================================

VERSION=$1
DATE=$(date +%Y-%m-%d)

# 🧱 Controleer of versie is opgegeven
if [ -z "$VERSION" ]; then
  echo "⚠️  Gebruik: ./create-release-tag.sh vX.X"
  exit 1
fi

# 📄 Controleer of changelog-bestand bestaat
CHANGELOG_FILE="releases/changelog/$VERSION.md"
if [ ! -f "$CHANGELOG_FILE" ]; then
  echo "⚠️  Geen changelog gevonden voor $VERSION"
  echo "➡️  Verwacht bestand: $CHANGELOG_FILE"
  exit 1
fi

# 🧾 Commitbericht opbouwen
DESCRIPTION=$(grep -m1 "-" "$CHANGELOG_FILE" | sed 's/^- //')
if [ -z "$DESCRIPTION" ]; then
  DESCRIPTION="Update $VERSION"
fi

echo "✅ Changelog gevonden: $CHANGELOG_FILE"
echo "📝 Beschrijving: $DESCRIPTION"

# 🧩 Git-commit en tag aanmaken
git add .
git commit -m "📦 Release $VERSION — $DESCRIPTION" --quiet

# Controleer of commit geslaagd is
if [ $? -ne 0 ]; then
  echo "⚠️  Geen wijzigingen om te committen of fout bij commit."
else
  echo "✅ Commit gemaakt voor versie $VERSION"
fi

git tag -a "$VERSION" -m "✈️ KLM-FLIGHT-APP $VERSION — $DESCRIPTION"
echo "✅ Git-tag aangemaakt: $VERSION"

echo "------------------------------------------"
echo "📘 Release $VERSION aangemaakt op $DATE"
echo "💡 Gebruik 'git push && git push --tags' om te publiceren"
echo "------------------------------------------"
