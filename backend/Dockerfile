FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Force fresh build - no cache
ARG CACHEBUST=1

RUN npx prisma generate
RUN npm run build
RUN ls -la dist/

EXPOSE 8080

CMD ["sh", "-c", "node dist/main.js 2>/dev/null || node dist/src/main.js"]
