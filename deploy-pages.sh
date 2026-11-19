#!/usr/bin/env bash
# Deploy SI-PKMK Mobile PWA ke Cloudflare Pages lewat wrangler CLI.
# Auth: Global API Key + email (CLOUDFLARE_API_KEY + CLOUDFLARE_EMAIL).
# Token Bearer (cfat_...) tidak punya permission Pages — pakai Global API Key.
#
# Pakai:  CLOUDFLARE_EMAIL=... CLOUDFLARE_API_KEY=... bash deploy-pages.sh
# Build dulu: VITE_API_BASE=https://... npm run build

set -euo pipefail
cd "$(dirname "$0")"

: "${CLOUDFLARE_EMAIL:?CLOUDFLARE_EMAIL kosong}"
: "${CLOUDFLARE_API_KEY:?CLOUDFLARE_API_KEY kosong}"

export CLOUDFLARE_EMAIL CLOUDFLARE_API_KEY
npx --yes wrangler@3.99.0 pages deploy dist \
  --project-name=sipkmk-mandor \
  --branch=master \
  --commit-dirty=true
