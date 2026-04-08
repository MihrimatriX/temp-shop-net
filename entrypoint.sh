#!/bin/sh
set -eu

API_URL="${NEXT_PUBLIC_API_URL:-}"

mkdir -p /app/public
cat > /app/public/runtime-config.js <<EOF
(function () {
  window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {};
  window.__RUNTIME_CONFIG__.NEXT_PUBLIC_API_URL = "${API_URL}";
})();
EOF

exec node server.js

