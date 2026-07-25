FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80

CMD ["npm", "run", "start"]
