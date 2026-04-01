# EduPrime — B2C Education Consulting Platform

> India & Abroad Admissions Consulting | CRM + Student Portal + Admin + Expenses

[![CI/CD](https://github.com/YOUR_ORG/eduprime/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_ORG/eduprime/actions)

---

## 🏗 Architecture

```
eduprime/
├── backend/          # NestJS API (Port 4000)
├── frontend/         # Next.js App Router (Port 3000)
├── nginx/            # NGINX reverse proxy configs
├── scripts/          # Deploy scripts
├── docs/             # Documentation
├── docker-compose.yml
└── ecosystem.config.js   # PM2 config
```

### Tech Stack
| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Next.js 14 (App Router) + Tailwind CSS |
| Backend     | NestJS 10 + TypeScript            |
| Database    | PostgreSQL 16 + Prisma ORM        |
| Auth        | JWT + Role-Based Access Control   |
| Cron Jobs   | @nestjs/schedule                  |
| Deployment  | Docker / Railway / Hostinger + PM2 |

### Subdomains
| Subdomain                 | Purpose             | Roles           |
|---------------------------|---------------------|-----------------|
| `student.eduprime.in`     | Student Portal      | STUDENT         |
| `sales.eduprime.in`       | CRM for agents      | SALES_AGENT     |
| `admin.eduprime.in`       | Admin Dashboard     | ADMIN, FINANCE  |
| `expenses.eduprime.in`    | Expense portal      | All             |
| `api.eduprime.in`         | Backend API         | —               |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm 9+

### 1. Clone & Setup

```bash
git clone https://github.com/YOUR_ORG/eduprime.git
cd eduprime
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts   # Seeds test users + data
npm run start:dev            # Starts on :4000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

npm install
npm run dev                  # Starts on :3000
```

### 4. Open in Browser

| URL                              | Login                         |
|----------------------------------|-------------------------------|
| `http://localhost:3000`          | Role-based redirect           |
| `http://localhost:4000/api/docs` | Swagger API docs              |

---

## 🐳 Docker (Recommended)

```bash
# Copy and configure env
cp .env.example .env
# Edit .env with your values

# Build and start everything
docker-compose up -d --build

# Run seed
docker-compose exec backend npx ts-node prisma/seed.ts

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🧪 Test Accounts

| Email                | Password     | Role         | Portal     |
|----------------------|--------------|--------------|------------|
| admin@test.com       | Admin@123    | Admin        | /admin     |
| sales@test.com       | Sales@123    | Sales Agent  | /sales     |
| sales2@test.com      | Sales@123    | Sales Agent  | /sales     |
| finance@test.com     | Finance@123  | Finance      | /admin     |
| student@test.com     | Student@123  | Student      | /student   |

---

## 📡 API Documentation

Full Swagger docs at `http://localhost:4000/api/docs`

### Auth Endpoints
```
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/me
POST /api/v1/auth/change-password
```

### Lead Endpoints
```
GET    /api/v1/leads              # List (paginated, filterable)
POST   /api/v1/leads              # Create
GET    /api/v1/leads/board        # Kanban board view
GET    /api/v1/leads/:id          # Get one
PUT    /api/v1/leads/:id          # Update
PATCH  /api/v1/leads/:id/transition   # Status transition (with incentive lock)
PATCH  /api/v1/leads/:id/assign       # Assign to agent
POST   /api/v1/leads/:id/notes        # Add note
GET    /api/v1/leads/:id/activities   # Activity timeline
GET    /api/v1/leads/:id/incentive-preview
```

### Incentive Endpoints
```
GET    /api/v1/incentives/preview/:courseId
GET    /api/v1/incentives/my
GET    /api/v1/incentives              # Admin/Finance
PATCH  /api/v1/incentives/:id/mark-paid
POST   /api/v1/incentives/config       # Update DEFAULT_INCENTIVE_PCT
```

### Excel Endpoints
```
POST   /api/v1/excel/upload     # Upload .xlsx (Admin only)
GET    /api/v1/excel/template   # Download template
GET    /api/v1/excel/history    # Upload history
```

### Analytics Endpoints
```
GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/funnel
GET    /api/v1/analytics/conversion-by-source
GET    /api/v1/analytics/revenue-vs-expense?year=2025
GET    /api/v1/analytics/leaderboard
GET    /api/v1/analytics/lead-trend?days=30
```

---

## 💰 Incentive Engine

### Logic Flow

```
1. Lead created → incentive = NULL

2. Agent selects College + Course:
   └─ Fetch course.fees from DB (populated via Excel)
   └─ Check course.incentiveFixed
      ├─ IF set → incentiveAmount = course.incentiveFixed
      │           incentiveSource = EXCEL_FIXED
      └─ ELSE  → pct = course.incentivePct OR SystemConfig.DEFAULT_INCENTIVE_PCT (default 5%)
                 incentiveAmount = fees × pct / 100
                 incentiveSource = PERCENTAGE_OF_FEES

3. Lead transitions to WON:
   └─ incentiveAmount LOCKED (immutable)
   └─ feesAtClosure LOCKED
   └─ incentiveLockedAt = NOW()
   └─ IncentiveRecord created

4. Finance marks paid:
   └─ paidAt = NOW()
```

### Configuring Default Incentive %
```bash
# Via API (Admin only)
POST /api/v1/incentives/config
{ "key": "DEFAULT_INCENTIVE_PCT", "value": "7" }
```

---

## 📊 SLA System

| Status         | SLA Deadline |
|----------------|-------------|
| INITIATED      | 7 days      |
| IN_PROGRESS    | 15 days     |
| DOCS_SUBMITTED | 10 days     |
| OFFER_RECEIVED | 5 days      |

- **Cron**: Runs every hour to check breaches
- **AT_RISK**: Triggered 24h before due date
- **BREACHED**: Triggers notifications to agent + admin
- **Daily Summary**: Sent to all admins at 9:00 AM
- **Inactivity Alert**: Leads with no activity for 3+ days

---

## 📋 Excel Template Format

Download from Admin → Excel Upload → Download Template

| Column          | Required | Notes                                      |
|-----------------|----------|--------------------------------------------|
| College Name    | ✅        | Used for deduplication                    |
| Course Name     | ✅        | Used for deduplication                    |
| Annual Fees     | ✅        | Numeric (INR)                             |
| Incentive Fixed | ❌        | If set, overrides Incentive %             |
| Incentive %     | ❌        | Fallback if Incentive Fixed is empty       |
| Stream          | ❌        | Engineering / Management / Medical / etc  |
| Degree          | ❌        | B.Tech / MBA / M.Sc / etc                 |
| Duration        | ❌        | e.g. "4 years"                            |
| Total Fees      | ❌        | Full program cost                         |
| City / State    | ❌        | College location                          |
| Country         | ❌        | Defaults to "India"                       |

---

## 🚂 Railway Deployment

### Step-by-Step

1. **Push code to GitHub** (required — Railway deploys from Git)

2. **Create Railway project**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub repo
   - Select your repo

3. **Add PostgreSQL**
   - In Railway project: + New → Database → PostgreSQL
   - `DATABASE_URL` is auto-injected into all services

4. **Backend service**
   - Root directory: `backend`
   - Railway detects Dockerfile automatically
   - Add env vars:
     ```
     JWT_SECRET=<run: openssl rand -hex 64>
     NODE_ENV=production
     CORS_ORIGINS=https://<frontend-railway-url>
     ```

5. **Frontend service**
   - Root directory: `frontend`
   - Add env vars:
     ```
     NEXT_PUBLIC_API_URL=https://<backend-railway-url>/api/v1
     ```

6. **Seed database**
   ```bash
   # In Railway dashboard → backend service → Terminal
   npx ts-node prisma/seed.ts
   ```

### Quick CLI Deploy
```bash
npm install -g @railway/cli
railway login
chmod +x scripts/deploy-railway.sh
./scripts/deploy-railway.sh
```

---

## 🌐 Hostinger VPS Deployment

### Requirements
- VPS with Ubuntu 22.04+
- 2 vCPU, 4GB RAM minimum
- Domain with DNS access

### One-Command Deploy
```bash
# On your VPS as root:
git clone https://github.com/YOUR_ORG/eduprime.git /var/www/eduprime
cd /var/www/eduprime
chmod +x scripts/deploy-hostinger.sh
./scripts/deploy-hostinger.sh
```

### DNS Setup (in Hostinger control panel)
```
A    @              → YOUR_VPS_IP
A    api            → YOUR_VPS_IP
A    admin          → YOUR_VPS_IP
A    sales          → YOUR_VPS_IP
A    student        → YOUR_VPS_IP
A    expenses       → YOUR_VPS_IP
```

### SSL Certificates
```bash
certbot --nginx \
  -d eduprime.in \
  -d api.eduprime.in \
  -d admin.eduprime.in \
  -d sales.eduprime.in \
  -d student.eduprime.in \
  -d expenses.eduprime.in
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/           # JWT + RBAC
│   ├── leads/          # CRM core
│   ├── courses/        # College + Course CRUD
│   ├── incentives/     # Incentive engine
│   ├── sla/            # SLA cron + breach alerts
│   ├── expenses/       # Expense approval flow
│   ├── excel/          # Excel parse + bulk upsert
│   ├── sulekha/        # Sulekha API cron sync
│   ├── analytics/      # Funnel, leaderboard, revenue
│   ├── users/          # User management
│   ├── notifications/  # Notification system
│   └── prisma/         # DB service
├── prisma/
│   ├── schema.prisma   # Full database schema
│   └── seed.ts         # Test data seeder
└── Dockerfile

frontend/
├── src/
│   ├── app/
│   │   ├── auth/login/ # Login page
│   │   ├── admin/      # Admin portal pages
│   │   ├── sales/      # Sales agent pages
│   │   └── student/    # Student portal pages
│   ├── components/
│   │   └── ui/         # Sidebar, Topbar, StatCard, StatusBadge
│   ├── lib/api.ts      # All API calls (axios)
│   └── hooks/useAuth.tsx
└── Dockerfile
```

---

## 🔒 Security

- JWT tokens expire in 7 days (configurable)
- Role-based access control on every endpoint
- Rate limiting: 30 req/min general, 10 req/min auth
- Input validation via class-validator
- SQL injection protected by Prisma ORM
- CORS restricted to configured origins
- Passwords hashed with bcrypt (12 rounds)

---

## 📞 Sulekha Integration

Configure in `backend/.env`:
```env
SULEKHA_API_KEY=your_api_key
SULEKHA_API_URL=https://api.sulekha.com
```

- **Auto-sync**: Daily at 6:00 AM
- **Manual sync**: Admin → Sulekha → Sync Now
- **Deduplication**: By sulekhaId, phone, and email
- **Retry**: Failed leads retried on next sync

---

*Built with ❤️ for EduPrime Engineering*
