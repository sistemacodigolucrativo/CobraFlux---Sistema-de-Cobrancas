import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./e2e',
  timeout:45000,
  expect:{timeout:10000},
  retries:process.env.CI?1:0,
  workers:1,
  reporter:process.env.CI?'github':'list',
  use:{
    baseURL:'http://127.0.0.1:8080',
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
  },
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:{
    command:'npm run server',
    url:'http://127.0.0.1:8080/api/health',
    reuseExistingServer:!process.env.CI,
    timeout:60000,
    env:{
      ...process.env,
      APP_ORIGIN:'http://127.0.0.1:8080',
      CF_NO_LISTEN:'false',
      PORT:'8080',
      NODE_ENV:'test',
    }
  },
});
