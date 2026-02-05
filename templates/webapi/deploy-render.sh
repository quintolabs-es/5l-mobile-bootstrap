#!/bin/bash
set -e

# ===========================================================
# Trigger a Render.com deployment (pull latest image).
# ===========================================================
#
# Reads from `.env` file if present:
#   RENDER_SERVICE_ID_DEV   Required. Render service id for development (srv-xxxxx)
#   RENDER_DEPLOY_KEY_DEV   Required. Render deploy key for development
#   RENDER_SERVICE_ID_STG   Required. Render service id for staging (srv-xxxxx)
#   RENDER_DEPLOY_KEY_STG   Required. Render deploy key for staging
#   RENDER_SERVICE_ID_PROD  Required. Render service id for production (srv-xxxxx)
#   RENDER_DEPLOY_KEY_PROD  Required. Render deploy key for production
#
# Usage:
#   bash deploy-render.sh --env staging

ENVIRONMENT="staging"

while [ $# -gt 0 ]; do
  case "$1" in
    --env)
      if [ -z "${2:-}" ]; then
        echo "Missing --env value. Expected development|staging|production."
        exit 1
      fi
      ENVIRONMENT="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: bash deploy-render.sh --env <development|staging|production>"
      exit 0
      ;;
    *)
      echo "Unknown arg: $1"
      echo "Usage: bash deploy-render.sh --env <development|staging|production>"
      exit 1
      ;;
  esac
done

case "$ENVIRONMENT" in
  development|dev)
    SUFFIX="DEV"
    ;;
  staging|stg)
    SUFFIX="STG"
    ;;
  production|prod)
    SUFFIX="PROD"
    ;;
  *)
    echo "Invalid --env value \"$ENVIRONMENT\". Expected development|staging|production."
    exit 1
    ;;
esac

if [ -f .env ]; then
  echo "Loading .env..."
  set -a
  source .env
  set +a
fi

service_var="RENDER_SERVICE_ID_${SUFFIX}"
deploy_key_var="RENDER_DEPLOY_KEY_${SUFFIX}"

service_id="${!service_var}"
deploy_key="${!deploy_key_var}"

if [ -z "$service_id" ]; then
  echo "Missing ${service_var}."
  exit 1
fi

if [ -z "$deploy_key" ]; then
  echo "Missing ${deploy_key_var}."
  exit 1
fi

url="https://api.render.com/deploy/${service_id}?key=${deploy_key}"

echo "Triggering Render deploy (${ENVIRONMENT})..."
response=$(curl -s -w "\n%{http_code}" -X POST "$url")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
  echo "✓ Done"
else
  echo "✗ Deploy failed (HTTP $http_code)"
  echo "$body"
  exit 1
fi
