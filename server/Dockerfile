# Use Node.js 20 Alpine for compatibility
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment variables for Prisma
ENV PRISMA_QUERY_ENGINE_TYPE=binary
ENV PRISMA_QUERY_ENGINE_BINARY=linux-musl

# Install system dependencies including OpenSSL for Prisma
RUN apk add --no-cache \
    curl \
    postgresql-client \
    openssl \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads backups keys

# Set proper permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"] 