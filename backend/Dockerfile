FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Force fresh build - no cache
ARG CACHEBUST=20260501073609

RUN npx prisma generate
RUN npm run build
RUN ls -la dist/

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && (node dist/main.js 2>/dev/null || node dist/src/main.js)"]
