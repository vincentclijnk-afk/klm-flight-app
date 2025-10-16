#!/bin/bash
# 🛫 KLM Flight App Manager v10.0
# All-in-one backup, herstel, zip, log en statusbeheer

cd ~/klm-flight-app || exit

# 🎨 Kleuren
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[1;34m'; CYAN='\033[1;36m'; BOLD='\033[1m'; RESET='\033[0m'

BACKUP_DIR=~/klm-flight-backups
LOG_FILE="$BACKUP_DIR/backup-log.txt"
mkdir -p "$BACKUP_DIR"; touch "$LOG_FILE"

timestamp(){ date +"%Y-%m-%d %H:%M:%S"; }
log_action(){ echo "$(timestamp) | $1" >> "$LOG_FILE"; }

# === Grootte-controle ===
check_size(){
  SIZE_MB=$(du -sm ~/klm-flight-app | cut -f1); LIMIT_MB=200
  if (( SIZE_MB > LIMIT_MB )); then
    echo -e "${YELLOW}⚠️  Mapgrootte ${SIZE_MB} MB > ${LIMIT_MB} MB${RESET}"
    read -p "Toch doorgaan? (j/n): " d; [ "$d" = "j" ] || { log_action "Backup afgebroken: ${SIZE_MB}MB"; return 1; }
  fi; return 0
}

# === Oude ZIP’s opruimen ===
cleanup_old_backups(){
  find "$BACKUP_DIR" -type f -name "*.zip" -mtime +30 -delete -print | while read -r f; do
    echo -e "${YELLOW}🗑️  Verwijderd oud bestand:${RESET} $f"; log_action "Verwijderd oud ZIP: $f"; done
  ZIP_COUNT=$(find "$BACKUP_DIR" -type f -name "*.zip" | wc -l)
  if (( ZIP_COUNT > 30 )); then
    echo -e "${YELLOW}⚠️  >30 ZIP’s – opruimen...${RESET}"
    ls -t "$BACKUP_DIR"/*.zip | tail -n +31 | while read -r f; do rm -f "$f"; log_action "Auto-verwijderd (te veel): $f"; done
  fi
}

# === Pull remote wijzigingen ===
auto_pull(){
  echo -e "${CYAN}🔄 Controleren op remote wijzigingen...${RESET}"
  git fetch origin main >/dev/null 2>&1
  LOCAL=$(git rev-parse main); REMOTE=$(git rev-parse origin/main)
  if [ "$LOCAL" != "$REMOTE" ]; then
    echo -e "${YELLOW}⬇️  Nieuwe commits gevonden, uitvoeren git pull...${RESET}"
    git pull origin main >/dev/null && echo -e "${GREEN}✅  Up-to-date met remote.${RESET}"
    log_action "Auto-pull uitgevoerd."
  else
    echo -e "${GREEN}✅  Geen updates nodig.${RESET}"
  fi
}

# === Backup ===
backup(){
  [ -z "$1" ] && { echo -e "${YELLOW}Gebruik:${RESET} ./backup.sh \"beschrijving\""; exit 1; }
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  [ "$BRANCH" != "main" ] && { echo -e "${YELLOW}⚠️  Niet op main (${BRANCH}).${RESET}"; read -p "Switch naar main? (j/n): " a; [ "$a" = "j" ] || exit 0; git stash push -m tmp >/dev/null; git switch main >/dev/null; git stash pop >/dev/null; }
  auto_pull
  git add . >/dev/null; git commit -m "Backup: $1" >/dev/null; git push origin main >/dev/null
  TAG="v$(date +'%Y-%m-%d-%H%M')"; git tag "$TAG"; git push origin --tags >/dev/null
  check_size || exit 0
  ZIP="$BACKUP_DIR/klm-flight-app-${TAG}.zip"; zip -r -q "$ZIP" ~/klm-flight-app
  echo -e "${GREEN}✅ Backup klaar als tag:${RESET} ${BOLD}$TAG${RESET}\n${BLUE}💾 ZIP:${RESET} $ZIP"
  log_action "Backup voltooid: $TAG | $1 | ZIP: $ZIP"; cleanup_old_backups
}

# === Herstel ===
restore(){
  [ -z "$1" ] && { echo -e "${YELLOW}Gebruik:${RESET} ./backup.sh --restore <tag>"; exit 1; }
  echo -e "${YELLOW}⚠️  Herstellen naar ${BOLD}$1${RESET}"; read -p "Doorgaan? (j/n): " c; [ "$c" = "j" ] || exit 0
  PRETAG="pre-restore-$(date +'%Y-%m-%d-%H%M')"; git add . >/dev/null; git commit -m "Auto pre-restore ($PRETAG)" >/dev/null; git tag "$PRETAG"; git push origin main --tags >/dev/null
  check_size || exit 0
  PREZIP="$BACKUP_DIR/klm-flight-app-${PRETAG}.zip"; zip -r -q "$PREZIP" ~/klm-flight-app
  git fetch --all --tags >/dev/null; git restore -s "$1" -- frontend/src/App.jsx frontend/src/index.css
  echo -e "${GREEN}✅ Hersteld naar:${RESET} ${BOLD}$1${RESET}\n${BLUE}💾 Pre-backup:${RESET} $PREZIP"
  log_action "Herstel uitgevoerd: $1 | pre-tag $PRETAG"
}

# === Tags, commits, log ===
list_tags(){ echo -e "${BLUE}📜 Tags:${RESET}"; git fetch --tags >/dev/null; git tag --sort=-creatordate | head -n 15; }
last_commit(){ echo -e "${BLUE}🕓 Laatste commit:${RESET}"; git log -1 --pretty=format:"${BOLD}${GREEN}%h${RESET} - ${YELLOW}%s${RESET} (%cr door %an)"; echo ""; }
search_log(){ echo -e "${BLUE}🔍 Zoeken in log:${RESET} \"$1\""; grep -i --color "$1" "$LOG_FILE" || echo "Geen resultaten."; }

# === Statuscheck ===
status(){
  echo -e "${CYAN}📊 Projectstatus:${RESET}"
  echo -e "Branch: ${BOLD}$(git rev-parse --abbrev-ref HEAD)${RESET}"
  echo -e "Laatste tag: ${BOLD}$(git describe --tags --abbrev=0 2>/dev/null || echo 'geen')${RESET}"
  echo -e "Lokaal vs remote:"; git status -sb | sed 's/^/  /'
  echo -e "Totale mapgrootte: ${BOLD}$(du -sh ~/klm-flight-app | cut -f1)${RESET}"
}

# === Help ===
show_help(){
  echo -e "\n${BOLD}${CYAN}🛠️  KLM Flight App Manager v10.0${RESET}\n"
  echo -e "${YELLOW}Gebruik:${RESET}"
  echo "  ./backup.sh \"beschrijving\"     → Backup maken"
  echo "  ./backup.sh --restore <tag>     → Herstellen"
  echo "  ./backup.sh --list              → Tags tonen"
  echo "  ./backup.sh --last              → Laatste commit"
  echo "  ./backup.sh --log <zoekterm>    → Zoeken in log"
  echo "  ./backup.sh --status            → Projectstatus"
  echo "  ./backup.sh --help              → Deze hulptekst\n"
}

# === Startlogica ===
case "$1" in
  --restore) restore "$2" ;;
  --list) list_tags ;;
  --last) last_commit ;;
  --log) search_log "$2" ;;
  --status) status ;;
  --help|"") show_help ;;
  *) backup "$1" ;;
esac
