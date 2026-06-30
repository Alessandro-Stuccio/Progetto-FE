# ============================================================
#  Frontend kore — immagine "tutto in uno":
#  Stage 1 compila Angular (build di produzione)
#  Stage 2 Caddy serve il sito statico E fa da reverse proxy
#          verso il backend Spring Boot (stesso dominio).
# ============================================================

# ---- Stage 1: build Angular ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Usa la configurazione "production" (default in angular.json):
# environment.prod.ts -> apiUrl '' (stesso dominio)
RUN npm run build

# ---- Stage 2: Caddy (sito + reverse proxy + HTTPS automatico) ----
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
# L'application builder di Angular mette l'output in dist/<progetto>/browser
COPY --from=build /app/dist/Progetto/browser /srv
