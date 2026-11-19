#!/usr/bin/env bash
# Deploy SI-PKMK Mobile PWA ke Cloudflare Pages lewat REST API (tanpa wrangler).
# Auth: Global API Key + email (X-Auth-Email + X-Auth-Key).
#
# Pakai: CLOUDFLARE_EMAIL=... CLOUDFLARE_API_KEY=... bash deploy-pages.sh
#        (opsional) VITE_API_BASE=... (sudah dibake ke dist saat npm run build)

set -euo pipefail
cd "$(dirname "$0")"

: "${CLOUDFLARE_EMAIL:?CLOUDFLARE_EMAIL kosong}"
: "${CLOUDFLARE_API_KEY:?CLOUDFLARE_API_KEY kosong}"

PROJECT="sipkmk-mandor"
DIST="${DIST:-dist}"
ACCOUNT_ID="4a7d3bef1e03585177e274194cab3aa7"
API="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}"
[ -d "$DIST" ] || { echo "Folder $DIST tidak ada. Jalankan npm run build dulu."; exit 1; }

MANIFEST="{"
ARGS=()
first=1
while IFS= read -r f; do
  rel="${f#$DIST/}"
  hash=$(sha256sum "$f" | cut -d' ' -f1)
  if [ "$first" -eq 0 ]; then MANIFEST+=","; fi
  first=0
  MANIFEST+="\"${rel}\":\"${hash}\""
  ARGS+=(-F "file=@${f};filename=${rel}")
done < <(find "$DIST" -type f | sort)
MANIFEST+="}"

curl -sS -X POST "${API}/pages/projects/${PROJECT}/deployments" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_API_KEY}" \
  -F "manifest=${MANIFEST}" \
  -F "branch=master" \
  -F "commit_dirty=true" \
  "${ARGS[@]}" \
  -w "\n[HTTP %{http_code}]\n" | tail -c 300
