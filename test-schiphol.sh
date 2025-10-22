#!/bin/bash
# Schiphol API v4 testscript
# Doel: testen of de API verbinding maakt en correcte mapping gebruikt

API_URL="https://api.schiphol.nl/v4/public-flights/flights?flightDirection=D"
APP_ID="e9a0ceb7"
APP_KEY="d731e4b9256cee2d4e2c0a7bc4974c68"

echo "✈️  Schiphol API test starten..."
echo "URL: $API_URL"
echo "----------------------------------------"

curl -v -X GET "$API_URL" \
  -H "app_id: $APP_ID" \
  -H "app_key: $APP_KEY" \
  -H "Accept: application/json" \
  -H "ResourceVersion: v4"
