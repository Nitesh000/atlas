FROM node:20-alpine AS base

# Install pnpm and turbo
RUN npm install -g pnpm@9.0.0 turbo

# 1. Prune the workspace to only include the required packages
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# 2. Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# We need typescript/turbo globally for building
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
# Note: apps/api currently builds with tsc but uses tsx to run. We can just run it using tsx in production or use standard node.
RUN pnpm turbo run build --filter=api...

# 3. Final production image
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api_user
USER api_user

COPY --from=installer /app .

EXPOSE 3001
CMD [ "sh", "-c", "pnpm --filter @atlas/database run db:migrate:prod && pnpm --filter api run start" ]
