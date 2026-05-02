# Stage 1: Build
FROM node:20-slim AS builder

# Install OpenSSL and other dependencies needed for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
# Use --legacy-peer-deps to resolve React 19 RC dependency conflicts
RUN npm install --legacy-peer-deps

# Copy source and prisma schema
COPY . .
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS runner

# Install OpenSSL for Prisma runtime
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3993

# Copy only the necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3993

CMD npx prisma db push && npx next start -p 3993
