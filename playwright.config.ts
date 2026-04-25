import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],

  use: {
    baseURL: 'https://dgrl.citad.vn',
    httpCredentials: {
      username: process.env.BASIC_AUTH_USER || '',
      password: process.env.BASIC_AUTH_PASS || '',
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    locale: 'vi-VN',
  },

  projects: [
    // Bước 1: Đăng nhập và lưu session
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // Bước 2: Test màn hình Login (không cần session)
    {
      name: 'login-tests',
      testMatch: '**/login.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // Bước 3: Test sau đăng nhập (dùng session đã lưu)
    {
      name: 'authenticated-tests',
      testMatch: '**/after-login/**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/session.json',
      },
    },
  ],
});
