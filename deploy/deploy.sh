#!/bin/bash
set -e

REPO_PATH="/home/i-depo/htdocs/i-depo.com/public"
BRANCH="main"
LOG_FILE="$REPO_PATH/deploy/deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "=== Deploy Started ==="

cd "$REPO_PATH"

# Fix permissions before git operations
chown -R i-depo:i-depo .git 2>/dev/null || true

# Git pull
log "Fetching latest code..."
git fetch origin 2>&1 >> "$LOG_FILE" || log "Git fetch warning"
git reset --hard origin/$BRANCH 2>&1 >> "$LOG_FILE" || log "Git reset warning"

# Fix ownership after git pull
chown -R i-depo:i-depo . 2>/dev/null || true

# Backend deploy
log "Running composer install..."
cd "$REPO_PATH/backend"
su - i-depo -c "cd $REPO_PATH/backend && composer install --no-dev --optimize-autoloader --no-interaction" 2>&1 >> "$LOG_FILE" || true

log "Running Laravel optimizations..."
su - i-depo -c "cd $REPO_PATH/backend && php artisan config:cache" 2>&1 >> "$LOG_FILE" || true
su - i-depo -c "cd $REPO_PATH/backend && php artisan route:cache" 2>&1 >> "$LOG_FILE" || true
su - i-depo -c "cd $REPO_PATH/backend && php artisan view:cache" 2>&1 >> "$LOG_FILE" || true
su - i-depo -c "cd $REPO_PATH/backend && php artisan migrate --force" 2>&1 >> "$LOG_FILE" || true

# Frontend deploy
log "Building frontend..."
cd "$REPO_PATH/frontend"
su - i-depo -c "cd $REPO_PATH/frontend && npm install" 2>&1 >> "$LOG_FILE" || true
su - i-depo -c "cd $REPO_PATH/frontend && npm run build" 2>&1 >> "$LOG_FILE" || true

# Restart PM2
log "Restarting PM2..."
pm2 restart i-depo-frontend 2>&1 >> "$LOG_FILE" || pm2 start npm --name 'i-depo-frontend' -- start 2>&1 || true

log "=== Deploy Completed ==="
