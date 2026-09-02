const { defineConfig } = require("@playwright/test");

/**
 * Dedicated config for the LIVE API security/consistency suites.
 * - Boots its own Next dev server on an isolated port (3101) so it never
 *   collides with an existing dev server or the ngrok https session cookies.
 * - Overrides NEXTAUTH_URL to http so NextAuth issues plain (non-Secure) cookies
 *   that Playwright's request context can send back over plain http.
 * - Sets DISABLE_RATE_LIMIT=1 so the distributed limiter can't throttle the
 *   happy-path suites (the 429 path is verified deterministically elsewhere).
 */
module.exports = defineConfig({
  testDir: "./tests/api-live",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://localhost:3101",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- -p 3101",
    url: "http://localhost:3101",
    reuseExistingServer: false,
    timeout: 240000,
    env: {
      ...process.env,
      NEXTAUTH_URL: "http://localhost:3101",
      NODE_ENV: "development",
      DISABLE_RATE_LIMIT: "1",
    },
  },
});
