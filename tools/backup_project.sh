#!/data/data/com.termux/files/usr/bin/bash
set -e

# Automatisch backupscript voor KLM Flight App
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
message="${1:-Automatische backup $timestamp}"

echo "🔄 Backup gestart: $message"

# Zorg dat tools-map bestaat
mkdir -p tools

# Voeg alles toe behalve wat in .gitignore staat
git add -A

# Maak commit
git commit -m "$message" || echo "⚠️  Geen wijzigingen om te committen."

# Push naar GitHub
git push origin main && echo "✅ Backup voltooid en gepusht: $message"
