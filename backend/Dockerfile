FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Force fresh build - invalidates ALL layers below including npm ci
ARG CACHEBUST=20260508092231

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build
RUN ls -la dist/

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy 2>&1 | tail -5; node dist/main.js 2>/dev/null || node dist/src/main.js"]
