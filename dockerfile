FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Copy email templates
COPY templates ./templates

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

WORKDIR /app

# Change ownership of the app directory to the nestjs user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Copy package.json and package-lock.json
COPY --chown=nestjs:nodejs package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema
COPY --chown=nestjs:nodejs prisma ./prisma/

# Copy built app from builder stage
COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist
COPY --chown=nestjs:nodejs --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nestjs:nodejs --from=builder /app/templates ./templates

# Expose port
EXPOSE 3000

# Set NODE_ENV to 'development', 'production', 'staging', 'test'
ENV NODE_ENV=production

# Run migrations and start the app
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
