#!/bin/bash
# =======================================================
# ✈️  KLM-FLIGHT-APP — Release Wizard (v2.2)
# -------------------------------------------------------
# 1️⃣ Maakt automatisch een changelog (met samenvatting)
# 2️⃣ Werkt release-notes bij
# 3️⃣ Werkt CHANGELOG_SUMMARY.md bij
# 4️⃣ Maakt commit + git-tag aan
# 5️⃣ Update release-tools.md datum
# 6️⃣ Controleert op bestaande versies (veilig)
# =======================================================

VERSION="$1"
RELEASES_DIR="releases"
CHANGELOG_DIR="$RELEASES_DIR/changelog"
NOTES_FILE="$RELEASES_DIR/release-notes.txt"
TOOLS_FILE="$RELEASES_DIR/release-tools.md"
SUMMARY_FILE="$RELEASES_DIR/CHANGELOG_SUMMARY.md"
DATE=$(date +%Y-%m-%d)

# --- 1️⃣ Controle op argument ---
if [ -z "$VERSION" ]; then
  echo "⚠️  Gebruik: ./release-wizard.sh vX.X"
  exit 1
fi

echo "🚀 Nieuwe release voorbereiden: $VERSION"
echo "📅 Datum: $DATE"
echo ""

# --- 2️⃣ Veiligheidscontrole ---
if [ -f "$CHANGELOG_DIR/$VERSION.md" ]; then
  echo "❌ Fout: changelog '$CHANGELOG_DIR/$VERSION.md' bestaat al!"
  echo "   → Annuleren om te voorkomen dat deze versie overschreven wordt."
  exit 1
fi

if git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "❌ Fout: Git-tag '$VERSION' bestaat al!"
  echo "   → Gebruik een nieuw versienummer (bijv. v1.8)"
  exit 1
fi

# --- 3️⃣ Maak changelogmap aan ---
mkdir -p "$CHANGELOG_DIR"

# --- 4️⃣ Vraag korte beschrijving ---
read -p "📝 Beschrijving van de release (1 zin): " DESC
echo ""

CHANGELOG_FILE="$CHANGELOG_DIR/$VERSION.md"

# --- 5️⃣ Maak changelogbestand met samenvatting ---
cat > "$CHANGELOG_FILE" <<EOF
# ✈️ KLM-FLIGHT-APP — Changelog $VERSION
**Datum:** $DATE

📘 **Samenvatting:** $DESC

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
_Automatisch gegenereerd: $DATE_
EOF

# --- 6️⃣ Voeg toe aan release notes ---
echo "📘 Bijwerken van release notes..."
echo -e "\n### $VERSION — $DATE\n$DESC\n" >> "$NOTES_FILE"

# --- 7️⃣ Update CHANGELOG_SUMMARY.md ---
echo "🧾 Bijwerken van CHANGELOG_SUMMARY.md..."
if [ ! -f "$SUMMARY_FILE" ]; then
  echo "# ✈️ KLM-FLIGHT-APP — Changelog Samenvatting" > "$SUMMARY_FILE"
  echo "Overzicht van alle releases met hun korte beschrijving." >> "$SUMMARY_FILE"
  echo -e "\n| Versie | Datum | Samenvatting |\n|:-------|:-------|:-------------|" >> "$SUMMARY_FILE"
fi
echo "| $VERSION | $DATE | $DESC |" >> "$SUMMARY_FILE"

# --- 8️⃣ Git commit en tag ---
git add "$CHANGELOG_FILE" "$NOTES_FILE" "$SUMMARY_FILE"
git commit -m "📦 Release $VERSION — $DESC"
git tag "$VERSION"

echo "✅ Release $VERSION voorbereid."
echo ""

# --- 9️⃣ Update 'Laatste update' in release-tools.md ---
if [ -f "$TOOLS_FILE" ]; then
  echo "🛠  Bijwerken van datum in release-tools.md..."
  sed -i "s/Laatste update: _.*/Laatste update: _$DATE_/" "$TOOLS_FILE"
  git add "$TOOLS_FILE"
  git commit -m "🗓  release-tools.md bijgewerkt met datum $DATE" >/dev/null 2>&1
fi

# --- 🔟 Afronding ---
echo ""
echo "-------------------------------------------------------------"
echo "📦 Release $VERSION succesvol voorbereid!"
echo "📄 CHANGELOG_SUMMARY.md bijgewerkt."
echo "👉 Vergeet niet te publiceren met:"
echo "   git push && git push --tags"
echo "-------------------------------------------------------------"
