#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# EduPrime — Railway Deployment Script
# Prerequisites: Railway CLI installed + logged in (railway login)
# Usage: ./scripts/deploy-railway.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[RAILWAY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Check Railway CLI
if ! command -v railway &>/dev/null; then
  echo "Installing Railway CLI..."
  curl -fsSL https://railway.app/install.sh | sh
fi

log "Setting up Railway project..."
railway login

# ─── Create project ──────────────────────────────────────────────────────────
log "Creating Railway project: eduprime"
railway init --name eduprime

# ─── Add PostgreSQL plugin ────────────────────────────────────────────────────
log "Provisioning PostgreSQL..."
railway add --plugin postgresql

# ─── Deploy backend ──────────────────────────────────────────────────────────
log "Deploying backend service..."
cd backend

railway service create --name eduprime-backend
railway up --service eduprime-backend

# Set backend env vars (Railway auto-injects DATABASE_URL from plugin)
log "Setting backend environment variables..."
railway variables set \
  NODE_ENV=production \
  JWT_SECRET="$(openssl rand -hex 64)" \
  JWT_EXPIRES_IN=7d \
  --service eduprime-backend

warn "Set CORS_ORIGINS, SULEKHA_API_KEY, and SMTP_* variables manually in Railway dashboard"

cd ..

# ─── Deploy frontend ─────────────────────────────────────────────────────────
log "Deploying frontend service..."
cd frontend

railway service create --name eduprime-frontend

# Get the backend URL first
BACKEND_URL=$(railway domain --service eduprime-backend 2>/dev/null || echo "")
if [ -n "$BACKEND_URL" ]; then
  railway variables set NEXT_PUBLIC_API_URL="https://$BACKEND_URL/api/v1" --service eduprime-frontend
fi

railway up --service eduprime-frontend
cd ..

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
log "✅ Railway deployment initiated!"
log "Monitor at: https://railway.app/dashboard"
echo ""
log "After deployment completes:"
log "1. Get URLs from Railway dashboard"
log "2. Set CORS_ORIGINS on backend to include frontend URL"
log "3. Set NEXT_PUBLIC_API_URL on frontend to backend URL"
log "4. Run database seed: railway run --service eduprime-backend 'npx ts-node prisma/seed.ts'"
