#!/bin/bash
# Backup script voor klm-flight-app
# Maakt lokale zip + commit/push naar GitHub

timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
message=${1:-"Automatische backup"}

backup_dir="backups"
mkdir -p "$backup_dir"

zip_file="$backup_dir/backup_$timestamp.zip"
zip -r "$zip_file" frontend/ >/dev/null

echo "✅ Lokale backup gemaakt: $zip_file"

git add .
git commit -m "$message"
git push origin main

echo "✅ GitHub backup voltooid met bericht: $message"
