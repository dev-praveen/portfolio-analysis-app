# ─────────────────────────────────────────────────────────────
# Multi-Stage Dockerfile for Vite SPA (Fully Fixed)
# ─────────────────────────────────────────────────────────────

# ═════════════════════════════════════════════════════════════
# STAGE 1: Builder
# ═════════════════════════════════════════════════════════════
FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


# ═════════════════════════════════════════════════════════════
# STAGE 2: Production
# ═════════════════════════════════════════════════════════════
FROM nginx:1.29-alpine-slim

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix required writable directories for non-root nginx
RUN mkdir -p /var/cache/nginx/client_temp /run && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /run

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/health > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]