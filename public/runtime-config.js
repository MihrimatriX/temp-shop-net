// This file is intentionally plain JS and lives in /public so it can be loaded
// before the React bundle. In Docker, it is overwritten at container start.
// For local dev without Docker, it provides an empty default (fallbacks apply).
(function () {
  window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {};
  if (typeof window.__RUNTIME_CONFIG__.NEXT_PUBLIC_API_URL !== "string") {
    window.__RUNTIME_CONFIG__.NEXT_PUBLIC_API_URL = "";
  }
})();

