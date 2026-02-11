#!/bin/bash
exec 2>&1

# ==========================================
# 1. ENV
# ==========================================
ENV_FILE="/home/greg/amalfiday/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo '{"error":"ENV file not found"}'
  exit 1
fi

GHOST_API_URL=$(grep "^GHOST_API_URL=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')
GHOST_ADMIN_API_KEY=$(grep "^GHOST_ADMIN_API_KEY=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')

if [[ -z "$GHOST_API_URL" || -z "$GHOST_ADMIN_API_KEY" ]]; then
  echo '{"error":"Missing Ghost credentials in .env"}'
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo '{"error":"jq not installed"}'
  exit 1
fi

# ==========================================
# 2. PARSE PAYLOAD
# ==========================================
PAYLOAD="$1"

if [ -z "$PAYLOAD" ]; then
  echo '{"error":"No payload received"}'
  exit 1
fi

EMAIL=$(echo "$PAYLOAD" | jq -r '.email // empty')
HP=$(echo "$PAYLOAD" | jq -r '.hp // empty')
T=$(echo "$PAYLOAD" | jq -r '.t // empty')

# Honeypot — bots fill hidden fields
if [ -n "$HP" ]; then
  echo '{"ok":true}'
  exit 0
fi

# Timing check — form must exist >2s
if [ -n "$T" ]; then
  NOW_MS=$(date +%s%3N)
  DIFF=$((NOW_MS - T))
  if [ "$DIFF" -lt 2000 ]; then
    echo '{"ok":true}'
    exit 0
  fi
fi

# Validate email
if [ -z "$EMAIL" ]; then
  echo '{"error":"Email is required"}'
  exit 1
fi

EMAIL=$(echo "$EMAIL" | tr '[:upper:]' '[:lower:]' | xargs)

if ! echo "$EMAIL" | grep -qP '^[^\s@]+@[^\s@]+\.[^\s@]+$'; then
  echo '{"error":"Invalid email address"}'
  exit 1
fi

# ==========================================
# 3. GHOST ADMIN JWT
# ==========================================
KEY_ID="${GHOST_ADMIN_API_KEY%%:*}"
SECRET_HEX="${GHOST_ADMIN_API_KEY##*:}"

b64url() {
  openssl base64 -A | tr '+/' '-_' | tr -d '='
}

NOW=$(date +%s)
EXP=$((NOW + 300))

HEADER=$(printf '{"alg":"HS256","typ":"JWT","kid":"%s"}' "$KEY_ID" | b64url)
PAYLOAD_JWT=$(printf '{"iat":%d,"exp":%d,"aud":"/admin/"}' "$NOW" "$EXP" | b64url)

SIGNATURE=$(printf '%s.%s' "$HEADER" "$PAYLOAD_JWT" \
  | openssl dgst -sha256 -mac HMAC -macopt "hexkey:${SECRET_HEX}" -binary \
  | b64url)

TOKEN="${HEADER}.${PAYLOAD_JWT}.${SIGNATURE}"

# ==========================================
# 4. CREATE GHOST MEMBER
# ==========================================
GHOST_BASE="${GHOST_API_URL%/}"

BODY=$(jq -n --arg email "$EMAIL" '{"members":[{"email":$email}]}')

RESULT=$(curl -s -w "\n%{http_code}" -X POST \
  "${GHOST_BASE}/ghost/api/admin/members/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Ghost ${TOKEN}" \
  -d "$BODY")

HTTP_CODE=$(echo "$RESULT" | tail -1)
RESPONSE=$(echo "$RESULT" | sed '$d')

# Success
if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo '{"ok":true}'
  exit 0
fi

# Member already exists — treat as success
if echo "$RESPONSE" | jq -e '.errors[]? | select(.type == "ValidationError")' >/dev/null 2>&1; then
  echo '{"ok":true}'
  exit 0
fi

# Other error
ERR=$(echo "$RESPONSE" | jq -c '.errors[0].message // "Ghost API error"' 2>/dev/null)
echo "{\"error\":${ERR}}"
exit 1
