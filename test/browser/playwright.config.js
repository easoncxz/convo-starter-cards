// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// On NixOS, resolve the chromium executable from PLAYWRIGHT_BROWSERS_PATH
// since the browser revision in Nix may differ from what the npm package expects.
function findNixChromium() {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!browsersPath) return undefined;
  const dirs = fs.readdirSync(browsersPath).filter(d => d.startsWith('chromium-') && !d.includes('headless'));
  if (dirs.length === 0) return undefined;
  const candidate = path.join(browsersPath, dirs[0], 'chrome-linux64', 'chrome');
  return fs.existsSync(candidate) ? candidate : undefined;
}

const nixChromium = findNixChromium();

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
      use: {
        browserName: 'chromium',
        ...(nixChromium ? { launchOptions: { executablePath: nixChromium } } : {}),
      },
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
