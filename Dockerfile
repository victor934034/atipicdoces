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

# Persisted across deploys via volumes mounted at these paths (configure in Easypanel)
RUN mkdir -p /app/data /app/public/uploads

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
