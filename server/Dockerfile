################  build stage  ################
FROM node:20-alpine AS build
WORKDIR /app

# OS packages for Prisma
RUN apk add --no-cache openssl postgresql-client libc6-compat

# Dependency manifests first
COPY package*.json ./
COPY prisma ./prisma/

# Fail fast if the CLI ever goes missing
# (inline comments are on their own line to satisfy the legacy parser)
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=1
RUN npm ci --legacy-peer-deps
RUN npx prisma generate


# ───────────────────────── source code ─────────────────────────
COPY . .
RUN npm run build || true               # if you have a build script
RUN npm prune --omit=dev                # strip devDeps for runtime image

############################  runtime stage  ############################
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl postgresql-client libc6-compat
ENV NODE_ENV=production \
    PRISMA_GENERATE_SKIP_AUTOINSTALL=1

COPY --from=build /app /app
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD \
  node -e "require('http').get('http://localhost:3001/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node","src/index.js"]
