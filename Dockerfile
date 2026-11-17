# BloodStat pitch demo: build the static site once, then serve it with nginx.

# Build stage: generate the synthetic data and compile TypeScript.
# Node 24 runs scripts/generate.ts natively (type stripping needs Node 23.6+).
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.scripts.json ./
COPY scripts ./scripts
COPY src ./src
COPY demo ./demo
ARG SEED=20261201
RUN node scripts/generate.ts "$SEED" && npx tsc -p tsconfig.json && npx tsc -p tsconfig.scripts.json

# Runtime stage: static files only, served by a non-root nginx on port 8080.
FROM nginxinc/nginx-unprivileged:alpine
COPY --from=build /app/demo/index.html /app/demo/styles.css /app/demo/data.js /app/demo/more.js /app/demo/app.js /usr/share/nginx/html/
EXPOSE 8080
