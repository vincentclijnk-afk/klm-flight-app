#!/bin/bash
# ======================================================
# 🌍 Map Tools Script voor KLM Flight App
# Backups, herstel, auto-backup, cleanup, GitHub sync + logging + sessie-overzicht
# ======================================================

BACKUP_DIR=~/klm-flight-app/backups
FRONTEND_DIR=~/klm-flight-app/frontend
SRC_DIR="$FRONTEND_DIR/src"
LOG_FILE=~/klm-flight-app/tools/map-tools.log
OVERVIEW_FILE="$FRONTEND_DIR/map-overzicht.txt"

mkdir -p "$BACKUP_DIR"

# 🕓 Logfunctie
log_action() {
    local MESSAGE="$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $MESSAGE" >> "$LOG_FILE"
}

# 📅 Tijd in leesbare vorm
human_time_diff() {
    local file="$1"
    local now=$(date +%s)
    local mod=$(date -r "$file" +%s)
    local diff=$(( (now - mod) / 60 ))
    if [ $diff -lt 60 ]; then
        echo "$diff minuten geleden"
    elif [ $diff -lt 1440 ]; then
        echo "$((diff / 60)) uur geleden"
    else
        echo "$((diff / 1440)) dagen geleden"
    fi
}

# ⚠️ Controleer leeftijd laatste backup
check_backup_age() {
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/frontend_backup_*.zip 2>/dev/null | head -n 1)
    if [ -z "$LATEST_BACKUP" ]; then
        echo "⚠️ Geen backups gevonden. Maak er één met: sync_project"
        log_action "⚠️ Geen backups gevonden bij check_backup_age"
        return 1
    fi
    local now=$(date +%s)
    local mod=$(date -r "$LATEST_BACKUP" +%s)
    local diff_days=$(( (now - mod) / 86400 ))
    if [ $diff_days -ge 3 ]; then
        echo "⚠️ Laatste backup ouder dan 3 dagen! ($(human_time_diff "$LATEST_BACKUP"))"
        log_action "⚠️ Backup ouder dan 3 dagen - $LATEST_BACKUP"
    else
        echo "✅ Laatste backup is recent ($(human_time_diff "$LATEST_BACKUP"))"
        log_action "✅ Backupcontrole ok - $LATEST_BACKUP"
    fi
}

# 💾 Maak nieuwe backup + GitHub sync
sync_project() {
    echo "🔄 Project synchroniseren..."
    mkdir -p "$BACKUP_DIR"
    cd "$FRONTEND_DIR" || { echo "❌ Frontend map niet gevonden"; log_action "❌ Frontend map niet gevonden"; return 1; }

    TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
    BACKUP_FILE="$BACKUP_DIR/frontend_backup_$TIMESTAMP.zip"

    if /data/data/com.termux/files/usr/bin/zip -r "$BACKUP_FILE" . -x "node_modules/*" "backups/*" > /dev/null 2>&1; then
        echo "✅ Backup gemaakt: $BACKUP_FILE"
        log_action "✅ Backup gemaakt: $BACKUP_FILE"
    else
        echo "⚠️ Backup mislukt!"
        log_action "⚠️ Backup mislukt"
    fi

    git add .
    COMMIT_MSG="Auto-sync: $TIMESTAMP"
    git commit -m "$COMMIT_MSG" >/dev/null 2>&1
    git push origin main >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ GitHub sync voltooid!"
        log_action "✅ GitHub sync voltooid - $COMMIT_MSG"
    else
        echo "⚠️ GitHub push mislukt!"
        log_action "⚠️ GitHub push mislukt"
    fi
}

# ♻️ Herstel laatste backup
restore_latest_backup() {
    cd "$BACKUP_DIR" || { echo "❌ Geen backup-map"; log_action "❌ Geen backup-map bij herstel"; return 1; }
    LATEST=$(ls -t frontend_backup_*.zip 2>/dev/null | head -n 1)
    [ -z "$LATEST" ] && { echo "⚠️ Geen backups gevonden"; log_action "⚠️ Geen backups gevonden voor herstel"; return 1; }

    echo "📦 Herstellen van: $LATEST"
    rm -rf "$FRONTEND_DIR"
    unzip -q "$BACKUP_DIR/$LATEST" -d ~/klm-flight-app
    if [ $? -eq 0 ]; then
        echo "✅ Herstel voltooid!"
        log_action "✅ Backup hersteld: $LATEST"
    else
        echo "⚠️ Herstel mislukt!"
        log_action "⚠️ Herstel mislukt voor $LATEST"
    fi
    cd "$FRONTEND_DIR" && npm run dev
}

# 🎚️ Herstel specifieke backup uit lijst
restore_specific_backup() {
    echo "📜 Beschikbare backups:"
    ls -t "$BACKUP_DIR"/frontend_backup_*.zip | nl
    echo ""
    read -p "Kies een nummer om te herstellen: " choice
    FILE=$(ls -t "$BACKUP_DIR"/frontend_backup_*.zip | sed -n "${choice}p")
    [ -z "$FILE" ] && { echo "❌ Ongeldige keuze"; log_action "❌ Ongeldige keuze bij restore_specific_backup"; return 1; }

    echo "📦 Herstellen van: $FILE"
    rm -rf "$FRONTEND_DIR"
    unzip -q "$FILE" -d ~/klm-flight-app
    echo "✅ Herstel voltooid!"
    log_action "✅ Specifieke backup hersteld: $FILE"
    cd "$FRONTEND_DIR" && npm run dev
}

# 🧹 Verwijder oude backups (>14 dagen)
cleanup_old_backups() {
    echo "🧹 Verwijderen van oude backups (>14 dagen)..."
    OLD_FILES=$(find "$BACKUP_DIR" -name "frontend_backup_*.zip" -type f -mtime +14)
    if [ -n "$OLD_FILES" ]; then
        echo "$OLD_FILES" | while read f; do
            rm "$f"
            log_action "🧹 Oude backup verwijderd: $f"
        done
        echo "✅ Opschonen voltooid."
    else
        echo "ℹ️ Geen oude backups gevonden."
        log_action "ℹ️ Geen oude backups om te verwijderen"
    fi
}

# 🚀 Start dev server met automatische backup
auto_backup_dev() {
    check_backup_age
    echo "📦 Automatische backup vóór starten dev-server..."
    sync_project
    cd "$FRONTEND_DIR" && npm run dev
    log_action "🚀 auto_backup_dev uitgevoerd"
}

# 🔧 Herstel werkende App.jsx en CSS
restore_map() {
    cp "$SRC_DIR/App.working.backup.jsx" "$SRC_DIR/App.jsx"
    cp "$SRC_DIR/index.working.backup.css" "$SRC_DIR/index.css"
    echo "✅ App en CSS hersteld!"
    log_action "✅ restore_map uitgevoerd"
    cd "$FRONTEND_DIR" && npm run dev
}

# 📊 Toon status van project
show_status() {
    echo "📊 Projectstatus:"
    cd "$FRONTEND_DIR" || { echo "❌ Frontend niet gevonden"; return 1; }

    LAST_BACKUP=$(ls -t "$BACKUP_DIR"/frontend_backup_*.zip 2>/dev/null | head -n 1)
    if [ -n "$LAST_BACKUP" ]; then
        echo "📦 Laatste backup: $(basename "$LAST_BACKUP") ($(human_time_diff "$LAST_BACKUP"))"
    else
        echo "⚠️ Geen backup gevonden"
    fi

    echo ""
    echo "🧭 Git status:"
    git status -s
    echo ""
    log_action "📊 show_status uitgevoerd"
}

# 📜 Toon logboek
show_log() {
    echo "🗒️ Laatste 30 regels van logboek:"
    echo "---------------------------------"
    tail -n 30 "$LOG_FILE" 2>/dev/null || echo "⚠️ Geen logbestand gevonden."
}

# 📝 Schrijf/append overzicht + archiveer
write_overview() {
    local NOTES="$*"
    local NOW_TS="$(date '+%Y-%m-%d %H:%M')"
    local FILE_TS="$(date '+%Y-%m-%d_%H-%M')"

    {
        echo "==============================="
        echo "Laatste update: $NOW_TS"
        echo "==============================="
        echo "SAMENVATTING (huidige status)"
        echo "Projectmap: $FRONTEND_DIR"
        LAST_BACKUP=$(ls -t "$BACKUP_DIR"/frontend_backup_*.zip 2>/dev/null | head -n 1)
        if [ -n "$LAST_BACKUP" ]; then
            echo "Laatste backup: $(basename "$LAST_BACKUP") ($(human_time_diff "$LAST_BACKUP"))"
        else
            echo "Laatste backup: –"
        fi
        echo ""
        echo "Git laatste commit:"
        (cd "$FRONTEND_DIR" && git log -1 --pretty=format:"Commit: %h | %s (%cr)") 2>/dev/null
        echo ""
        echo "Git status:"
        (cd "$FRONTEND_DIR" && git status -s) 2>/dev/null
        echo "---"
        echo "LOGBOEK (sessie $NOW_TS)"
        [ -n "$NOTES" ] && echo "Notities: $NOTES"
        echo "Gewijzigde bestanden deze sessie:"
        (cd "$FRONTEND_DIR" && git diff --name-only HEAD 2>/dev/null) | sed 's/^/ - /'
        echo "==============================="
        echo
    } > "$OVERVIEW_FILE".new 2>/dev/null

    [ -f "$OVERVIEW_FILE" ] && cat "$OVERVIEW_FILE" >> "$OVERVIEW_FILE".new
    mv "$OVERVIEW_FILE".new "$OVERVIEW_FILE"
    cp "$OVERVIEW_FILE" "$BACKUP_DIR/map-overzicht_$FILE_TS.txt"

    echo "✅ Overzicht bijgewerkt en gearchiveerd."
    log_action "📝 write_overview uitgevoerd (archief: map-overzicht_$FILE_TS.txt)"
}

# 🔚 Sessie stoppen: overzicht + backup + GitHub sync
end_session() {
    write_overview "$@"
    echo "🔔 Herinnering: draai nu een backup & sync (sync_project)."
    sync_project
    echo "✅ Sessie afgesloten: overzicht geschreven + backup + GitHub sync"
    log_action "✅ end_session voltooid"
}

# 📘 Help
show_help() {
    echo "📘 Beschikbare commando's:"
    echo "  sync_project            - Maak backup + push naar GitHub"
    echo "  restore_latest_backup   - Herstel de meest recente backup"
    echo "  restore_specific_backup - Kies een oudere backup om te herstellen"
    echo "  cleanup_old_backups     - Verwijder backups ouder dan 14 dagen"
    echo "  auto_backup_dev         - Backup + start npm run dev"
    echo "  restore_map             - Herstel App.jsx en index.css"
    echo "  check_backup_age        - Controleer leeftijd laatste backup"
    echo "  show_status             - Toon status van backup & GitHub"
    echo "  show_log                - Bekijk de laatste 30 logregels"
    echo "  write_overview [tekst]  - Schrijf overzicht + archiveer (met commit info)"
    echo "  end_session [tekst]     - Overzicht + backup + GitHub sync (alles-in-1)"
    echo "  show_help               - Toon dit overzicht"
}

# 🏁 Startpunt
if [ $# -eq 0 ]; then
    show_help
else
    case "$1" in
        sync_project) sync_project ;;
        restore_latest_backup) restore_latest_backup ;;
        restore_specific_backup) restore_specific_backup ;;
        cleanup_old_backups) cleanup_old_backups ;;
        auto_backup_dev) auto_backup_dev ;;
        restore_map) restore_map ;;
        check_backup_age) check_backup_age ;;
        show_status) show_status ;;
        show_log) show_log ;;
        write_overview) shift; write_overview "$@";;
        end_session) shift; end_session "$@";;
        show_help) show_help ;;
        *) echo "❓ Onbekend commando: $1"; show_help ;;
    esac
fi
