#!/usr/bin/env bash
# Deploy SI-PKMK Mobile PWA ke Cloudflare Pages lewat REST API (tanpa wrangler/node).
# Mengikuti pola build-notifier/deploy.sh di akar_solutions.
#
# Pakai:  CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... bash deploy-pages.sh
# Token butuh permission: Account -> Cloudflare Pages -> Edit
# Build dulu: VITE_API_BASE=https://... npm run build

set -euo pipefail
cd "$(dirname "$0")"

: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID kosong}"
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN kosong}"

PROJECT="sipkmk-mandor"
DIST="${DIST:-dist}"
API="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}"
AUTH="Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"

[ -d "$DIST" ] || { echo "Folder $DIST tidak ada. Jalankan npm run build dulu."; exit 1; }

# Susun manifest {"path": sha256} + daftar field file (nama file = path relatif).
MANIFEST="{"
ARGS=()
first=1
while IFS= read -r f; do
  rel="${f#"$DIST"/}"
  hash=$(sha256sum "$f" | cut -d' ' -f1)
  if [ "$first" -eq 0 ]; then MANIFEST+=","; fi
  first=0
  MANIFEST+="\"${rel}\":\"${hash}\""
  ARGS+=(-F "file=@${f};filename=${rel}")
done < <(find "$DIST" -type f | sort)
MANIFEST+="}"

echo "== manifest =="
echo "$MANIFEST" | head -c 400; echo
echo "== jumlah file: $((${#ARGS[@]})) =="

curl -sS -X POST "${API}/pages/projects/${PROJECT}/deployments" \
  -H "$AUTH" -H 'Content-Type: multipart/form-data' \
  -F "manifest=${MANIFEST}" \
  -F "branch=master" \
  -F "commit_dirty=true" \
  "${ARGS[@]}" \
  -w "\n[HTTP %{http_code}]\n" | tail -c 700
