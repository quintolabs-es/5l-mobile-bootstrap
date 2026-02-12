#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT_DIR_REL="."
APP_ID="smoke-test-app"
APP_ROOT="$SCRIPT_DIR/$OUTPUT_DIR_REL/$APP_ID"

cleanup() {
  cd "$SCRIPT_DIR" >/dev/null 2>&1 || true
  rm -rf "$APP_ROOT"
}
trap cleanup EXIT

on_error() {
  echo ""
  echo "Smoke test failed:"
  echo "  ${BASH_COMMAND:-unknown}"
  exit 1
}
trap on_error ERR

rm -rf "$APP_ROOT"

echo "Creating test app ......................"
echo ""
npm run create-app -- "$APP_ID" --auth required --output "$OUTPUT_DIR_REL" --with-mongo-s3-infra

echo "Building webapi ......................"
echo ""
cd "$APP_ROOT/${APP_ID}-webapi"
dotnet build

echo "Building mobile ......................"
echo ""
cd "$APP_ROOT/${APP_ID}-mobile"
npm install
npm run build

echo ""
echo "Smoke test passed"
