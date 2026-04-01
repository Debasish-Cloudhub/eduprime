#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# EduPrime — Hostinger VPS Deploy Script
# Run as: chmod +x scripts/deploy-hostinger.sh && ./scripts/deploy-hostinger.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit on error
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

DEPLOY_DIR="/var/www/eduprime"
LOG_DIR="/var/log/eduprime"
REPO_URL="https://github.com/YOUR_ORG/eduprime.git"   # ← update this
BRANCH="main"

log "Starting EduPrime deployment to Hostinger..."

# ─── 1. System dependencies ──────────────────────────────────────────────────
log "Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq curl git nginx postgresql-client

# Node.js 20 LTS
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# PM2
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
fi

log "Node: $(node -v) | NPM: $(npm -v) | PM2: $(pm2 -v)"

# ─── 2. Create directories ───────────────────────────────────────────────────
mkdir -p "$DEPLOY_DIR" "$LOG_DIR"

# ─── 3. Pull latest code ─────────────────────────────────────────────────────
if [ -d "$DEPLOY_DIR/.git" ]; then
  log "Pulling latest changes..."
  cd "$DEPLOY_DIR"
  git pull origin "$BRANCH"
else
  log "Cloning repository..."
  git clone --depth=1 -b "$BRANCH" "$REPO_URL" "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
fi

# ─── 4. Environment files ────────────────────────────────────────────────────
if [ ! -f "$DEPLOY_DIR/backend/.env" ]; then
  warn "backend/.env not found — copying from .env.example"
  warn "IMPORTANT: Edit $DEPLOY_DIR/backend/.env with real values!"
  cp "$DEPLOY_DIR/backend/.env.example" "$DEPLOY_DIR/backend/.env"
fi

# ─── 5. Build backend ────────────────────────────────────────────────────────
log "Building backend..."
cd "$DEPLOY_DIR/backend"
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build

log "Running database seed (skip if already seeded)..."
npx ts-node prisma/seed.ts || warn "Seed skipped (may already exist)"

# ─── 6. Build frontend ───────────────────────────────────────────────────────
log "Building frontend..."
cd "$DEPLOY_DIR/frontend"
npm ci
npm run build

# ─── 7. Copy static files for standalone Next.js ─────────────────────────────
cp -r "$DEPLOY_DIR/frontend/public" "$DEPLOY_DIR/frontend/.next/standalone/"
cp -r "$DEPLOY_DIR/frontend/.next/static" "$DEPLOY_DIR/frontend/.next/standalone/.next/"

# ─── 8. NGINX configuration ──────────────────────────────────────────────────
log "Configuring NGINX..."
cp "$DEPLOY_DIR/nginx/nginx.conf" /etc/nginx/nginx.conf
cp "$DEPLOY_DIR/nginx/conf.d/"*.conf /etc/nginx/conf.d/

warn "Remember to replace YOUR_DOMAIN in /etc/nginx/conf.d/*.conf with your actual domain!"
nginx -t && systemctl reload nginx

# ─── 9. PM2 process management ───────────────────────────────────────────────
log "Starting/reloading PM2 processes..."
cd "$DEPLOY_DIR"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# ─── 10. SSL with Certbot ────────────────────────────────────────────────────
if ! command -v certbot &>/dev/null; then
  log "Installing Certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi

warn "To enable SSL, run:"
warn "  certbot --nginx -d YOUR_DOMAIN -d api.YOUR_DOMAIN -d admin.YOUR_DOMAIN -d sales.YOUR_DOMAIN -d student.YOUR_DOMAIN -d expenses.YOUR_DOMAIN"

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
log "✅ Deployment complete!"
log "Backend:  http://YOUR_SERVER_IP:4000"
log "Frontend: http://YOUR_SERVER_IP:3000"
log "API Docs: http://YOUR_SERVER_IP:4000/api/docs"
echo ""
log "PM2 Status:"
pm2 list
