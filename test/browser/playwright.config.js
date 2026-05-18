// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:8787',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npx serve ../../_site -l 8787 -s',
    port: 8787,
    reuseExistingServer: !process.env.CI,
  },
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  outputDir: './test-results',
});
