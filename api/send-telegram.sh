#!/bin/bash
exec 2>&1

# ==========================================
# 1. НАСТРОЙКА И ENV
# ==========================================
ENV_FILE="/home/greg/amalfiday/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo '{"error":"ENV file not found"}'
  exit 1
fi

TELEGRAM_BOT_TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')
TELEGRAM_CHAT_ID=$(grep "^TELEGRAM_CHAT_ID=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')

if [[ -z "$TELEGRAM_BOT_TOKEN" || -z "$TELEGRAM_CHAT_ID" ]]; then
  echo '{"error":"Missing Telegram credentials in .env"}'
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo '{"error":"jq not installed"}'
  exit 1
fi

# ==========================================
# 2. ПАРСИНГ PAYLOAD
# ==========================================
PAYLOAD="$1"

if [ -z "$PAYLOAD" ]; then
  echo '{"error":"No payload received"}'
  exit 1
fi

NAME=$(echo "$PAYLOAD" | jq -r '.name // empty')
CONTACT=$(echo "$PAYLOAD" | jq -r '.contact // empty')
DATES=$(echo "$PAYLOAD" | jq -r '.dates // empty')
MESSAGE=$(echo "$PAYLOAD" | jq -r '.message // empty')
SERVICE=$(echo "$PAYLOAD" | jq -r '.service // empty')
PAYLOAD_IP=$(echo "$PAYLOAD" | jq -r '.ip // empty')
PAYLOAD_LOCATION=$(echo "$PAYLOAD" | jq -r '.location // empty')
PAYLOAD_COORDS=$(echo "$PAYLOAD" | jq -r '.coords // empty')
PAYLOAD_USER_AGENT=$(echo "$PAYLOAD" | jq -r '.userAgent // .user_agent // empty')
PAYLOAD_REFERRER=$(echo "$PAYLOAD" | jq -r '.referrer // .referer // .page // empty')
PAYLOAD_LANGUAGE=$(echo "$PAYLOAD" | jq -r '.language // .locale // empty')
PAYLOAD_TIMEZONE=$(echo "$PAYLOAD" | jq -r '.timezone // empty')

if [[ -z "$CONTACT" || -z "$DATES" || -z "$SERVICE" ]]; then
  echo '{"error":"Missing required fields (contact, dates, or service)"}'
  exit 1
fi

# ==========================================
# 3. МЕТАДАННЫЕ
# ==========================================
get_val() { [ -z "$1" ] && echo "unknown" || echo "$1"; }

IP=$(get_val "${HTTP_X_FORWARDED_FOR:-${REMOTE_ADDR}}")
IP="${IP%%,*}"
if [[ "$IP" == "unknown" && -n "$PAYLOAD_IP" ]]; then
  IP="$PAYLOAD_IP"
fi

CITY=$(get_val "${HTTP_X_VERCEL_IP_CITY:-${HTTP_CF_IPCITY}}")
REGION=$(get_val "${HTTP_X_VERCEL_IP_COUNTRY_REGION:-${HTTP_X_VERCEL_IP_REGION}}")
COUNTRY=$(get_val "${HTTP_X_VERCEL_IP_COUNTRY:-${HTTP_CF_IPCOUNTRY}}")
LOCATION="$CITY, $REGION, $COUNTRY"
[[ "$LOCATION" == "unknown, unknown, unknown" ]] && LOCATION="unknown"
if [[ "$LOCATION" == "unknown" && -n "$PAYLOAD_LOCATION" ]]; then
  LOCATION="$PAYLOAD_LOCATION"
fi

LAT="${HTTP_X_VERCEL_IP_LATITUDE}"
LON="${HTTP_X_VERCEL_IP_LONGITUDE}"
[[ -n "$LAT" && -n "$LON" ]] && COORDS="$LAT, $LON" || COORDS="unknown"
if [[ "$COORDS" == "unknown" && -n "$PAYLOAD_COORDS" ]]; then
  COORDS="$PAYLOAD_COORDS"
fi

USER_AGENT=$(get_val "${HTTP_USER_AGENT}")
if [[ "$USER_AGENT" == "unknown" && -n "$PAYLOAD_USER_AGENT" ]]; then
  USER_AGENT="$PAYLOAD_USER_AGENT"
fi
REFERER=$(get_val "${HTTP_REFERER}")
if [[ "$REFERER" == "unknown" && -n "$PAYLOAD_REFERRER" ]]; then
  REFERER="$PAYLOAD_REFERRER"
fi
LANGUAGE=$(get_val "${HTTP_ACCEPT_LANGUAGE}")
if [[ "$LANGUAGE" == "unknown" && -n "$PAYLOAD_LANGUAGE" ]]; then
  LANGUAGE="$PAYLOAD_LANGUAGE"
fi
TIMEZONE=$(get_val "${PAYLOAD_TIMEZONE}")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

# ==========================================
# 4. ФОРМИРОВАНИЕ СООБЩЕНИЯ
# ==========================================
escape_html() {
  echo "$1" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g'
}

SAFE_NAME=$(escape_html "${NAME:-—}")
SAFE_CONTACT=$(escape_html "$CONTACT")
SAFE_DATES=$(escape_html "$DATES")
SAFE_SERVICE=$(escape_html "$SERVICE")
SAFE_MESSAGE=$(escape_html "${MESSAGE:-—}")

TECH_LINES="ip: $IP
location: $LOCATION
coords: $COORDS
user_agent: $USER_AGENT
referrer: $REFERER
locale: $LANGUAGE
timezone: $TIMEZONE
time: $TIMESTAMP"

SAFE_TECH=$(escape_html "$TECH_LINES")

TEXT_BODY="📩 <b>New Amalfi.Day inquiry</b>

👤 <b>Name:</b> ${SAFE_NAME}
📞 <b>Contact:</b> ${SAFE_CONTACT}
🧭 <b>Service:</b> ${SAFE_SERVICE}
📅 <b>Dates & location:</b> ${SAFE_DATES}
💬 <b>Message:</b> ${SAFE_MESSAGE}

🧾 <b>Technical</b>
<pre>${SAFE_TECH}</pre>"

# ==========================================
# 5. ОТПРАВКА В TELEGRAM
# ==========================================
JSON_PAYLOAD=$(jq -n \
  --arg chat_id "$TELEGRAM_CHAT_ID" \
  --arg text "$TEXT_BODY" \
  '{chat_id: $chat_id, text: $text, parse_mode: "HTML", disable_web_page_preview: true}')

# Убран пробел между bot и токеном
TG_RESULT=$(curl -s -X POST \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD")

if echo "$TG_RESULT" | jq -e '.ok' >/dev/null 2>&1; then
  echo '{"ok":true}'
else
  ERR_DETAILS=$(echo "$TG_RESULT" | jq -c .)
  echo "{\"error\":\"Telegram request failed\", \"details\":$ERR_DETAILS}"
  exit 1
fi
