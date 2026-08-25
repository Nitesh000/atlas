FROM node:20-bookworm AS base

# Install pnpm and turbo
RUN npm install -g pnpm@9.0.0 turbo

# 1. Prune the workspace to only include the required packages
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune scraper --docker

# 2. Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# First install the dependencies
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=scraper...

# Install playwright dependencies
RUN cd apps/scraper && pnpm exec playwright install --with-deps chromium

# 3. Final production image
FROM base AS runner
WORKDIR /app

# Copy the entire installer stage to keep playwright binaries in place
COPY --from=installer /app .
# Copy playwright browser cache from installer
COPY --from=installer /root/.cache/ms-playwright /root/.cache/ms-playwright

CMD [ "pnpm", "--filter", "scraper", "run", "start:prod" ]