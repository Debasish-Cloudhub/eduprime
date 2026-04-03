FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Provide a dummy DATABASE_URL so Prisma can validate the schema and generate
# the client during the build phase without requiring a live database connection.
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

# Make the startup script executable
RUN chmod +x start.sh

EXPOSE 8080

# start.sh constructs the real DATABASE_URL from Railway's PG* variables at
# runtime, runs migrations, then launches the application.
ENTRYPOINT ["sh", "start.sh"]