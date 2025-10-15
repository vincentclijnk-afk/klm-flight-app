#!/bin/bash
# =======================================================
# ✈️  KLM-FLIGHT-APP — Undo Release Script (safe & smart)
# -------------------------------------------------------
# Herstelt de laatste release (tag + commit)
# of een specifieke versie als argument.
# Met bevestiging vóór verwijdering.
# Gebruik:
#   ./undo-release.sh          → laatste release ongedaan maken
#   ./undo-release.sh v1.4     → specifieke versie terugdraaien
# =======================================================

VERSION=$1

# 🔍 Als geen versie opgegeven is, pak de laatste tag
if [ -z "$VERSION" ]; then
  VERSION=$(git describe --tags $(git rev-list --tags --max-count=1) 2>/dev/null)
  if [ -z "$VERSION" ]; then
    echo "⚠️  Geen release-tags gevonden om ongedaan te maken."
    exit 1
  fi
  echo "📦 Geen versie opgegeven — laatste release gedetecteerd: $VERSION"
else
  echo "📦 Specifieke release opgegeven: $VERSION"
fi

echo "-------------------------------------------------------"
echo "🧹 Klaar om release terug te draaien: $VERSION"
echo "-------------------------------------------------------"

# ❓Bevestiging vragen
read -p "⚠️  Weet je zeker dat je release '$VERSION' wilt verwijderen? (ja/nee): " CONFIRM

if [[ "$CONFIRM" != "ja" && "$CONFIRM" != "y" ]]; then
  echo "❎ Actie geannuleerd. Er is niets gewijzigd."
  exit 0
fi

echo "-------------------------------------------------------"
echo "🚧 Verwijderen gestart..."
echo "-------------------------------------------------------"

# 🏷️ Controleer of de tag bestaat
if git rev-parse "$VERSION" >/dev/null 2>&1; then
  git tag -d "$VERSION" >/dev/null 2>&1
  echo "✅ Tag verwijderd: $VERSION"
else
  echo "⚠️  Geen tag '$VERSION' gevonden."
fi

# 🔙 Controleer of de laatste commit overeenkomt met de release
LAST_COMMIT_MSG=$(git log -1 --pretty=%B)
if [[ "$LAST_COMMIT_MSG" == *"$VERSION"* ]]; then
  git reset --soft HEAD~1
  echo "✅ Laatste commit teruggedraaid (soft reset — bestanden behouden)"
else
  echo "⚠️  Laatste commit hoort niet bij $VERSION — commit blijft behouden."
fi

echo "------------------------------------------"
echo "🧾 Release $VERSION is lokaal verwijderd."
echo "💡 Vergeet niet om ook op remote te wissen (indien gepusht):"
echo "   git push origin :refs/tags/$VERSION"
echo "------------------------------------------"
