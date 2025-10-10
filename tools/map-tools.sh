#!/bin/bash
# 🌍 map-tools.sh — handige CLI voor KLM kaartbeheer
# Installeert alle alias-commando’s voor backup, herstel en lijstweergave

echo "🔧 Map Tools installeren..."

# map-help
echo "alias map-help='echo -e \"\
\\n🗺️  MAP COMMANDO OVERZICHT:\\n\
 save-map       → Maak een backup van App.jsx en index.css met tijdstempel\\n\
 list-backups   → Toon de 10 nieuwste backups\\n\
 restore-latest → Herstel automatisch de nieuwste backup\\n\
 restore-map    → Herstel naar vaste stabiele versie (App.backup.jsx + index.backup.css)\\n\
 map-help       → Toon dit overzicht\\n\"'" >> ~/.bashrc

# save-map
echo "alias save-map='ts=\$(date +%Y-%m-%d_%H-%M-%S) && cp ~/klm-flight-app/frontend/src/App.jsx ~/klm-flight-app/frontend/src/App.backup_\$ts.jsx && cp ~/klm-flight-app/frontend/src/index.css ~/klm-flight-app/frontend/src/index.backup_\$ts.css && echo 💾 Backup opgeslagen op \$ts'" >> ~/.bashrc

# list-backups
echo "alias list-backups='ls -lt ~/klm-flight-app/frontend/src/App.backup_*.jsx 2>/dev/null | head -n 10 && echo ------------------------------------ && ls -lt ~/klm-flight-app/frontend/src/index.backup_*.css 2>/dev/null | head -n 10'" >> ~/.bashrc

# restore-latest
echo "alias restore-latest='latest_jsx=\$(ls -t ~/klm-flight-app/frontend/src/App.backup_*.jsx 2>/dev/null | head -n 1) && latest_css=\$(ls -t ~/klm-flight-app/frontend/src/index.backup_*.css 2>/dev/null | head -n 1) && if [ -n \"\$latest_jsx\" ] && [ -n \"\$latest_css\" ]; then cp \"\$latest_jsx\" ~/klm-flight-app/frontend/src/App.jsx && cp \"\$latest_css\" ~/klm-flight-app/frontend/src/index.css && echo 🔄 Hersteld vanaf backup: \$(basename \$latest_jsx); else echo ❌ Geen backups gevonden.; fi'" >> ~/.bashrc

# restore-map
echo "alias restore-map='cp ~/klm-flight-app/frontend/src/App.backup.jsx ~/klm-flight-app/frontend/src/App.jsx && cp ~/klm-flight-app/frontend/src/index.backup.css ~/klm-flight-app/frontend/src/index.css && echo ✅ Vaste stabiele versie hersteld'" >> ~/.bashrc

source ~/.bashrc
echo "✅ Map Tools succesvol geïnstalleerd!"
