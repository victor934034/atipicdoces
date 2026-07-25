FROM node:20-bookworm-slim

WORKDIR /app

# better-sqlite3 needs to compile a native module at install time
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Persisted across deploys via a single volume mounted at /app/data
# (configure DATABASE_URL=file:/app/data/dev.db and UPLOADS_DIR=/app/data/uploads)
RUN mkdir -p /app/data/uploads

ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80

CMD ["npm", "run", "start"]
