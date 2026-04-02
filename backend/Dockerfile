[build]
builder = "DOCKERFILE"

[deploy]
startCommand = "npx prisma migrate deploy && node dist/main.js"
healthcheckPath = "/api/v1/health"
healthcheckTimeout = 120
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

The only change is line 7: `/api/v1` → `/api/v1/health`

---

**Then also add this in Railway → Variables:**
```
NODE_ENV = production