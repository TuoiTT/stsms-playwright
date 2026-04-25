import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],

  use: {
    // ✅ URL thật của hệ thống STSMS
    baseURL: 'https://dgrl.citad.vn',

    // ✅ Basic Auth — điền username/password vào đây
    httpCredentials: {
      username: process.env.BASIC_AUTH_USER || 'your_username',
      password: process.env.BASIC_AUTH_PASS || 'your_password',
    },

    // Chụp ảnh khi test fail
    screenshot: 'only-on-failure',

    // Quay video khi test fail
    video: 'retain-on-failure',

    // Chờ tối đa 10s cho mỗi action
    actionTimeout: 10000,

    // Không hiện cửa sổ trình duyệt (chạy ngầm trên server)
    headless: true,

    // Tiếng Việt
    locale: 'vi-VN',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Test responsive mobile (LGN_009)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    // Test responsive tablet (LGN_010)
    {
      name: 'tablet',
      use: { ...devices['iPad Pro 11'] },
    },
  ],
});

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
    // Bước 1: Chạy setup đăng nhập TRƯỚC
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // Bước 2: Chạy test Login (không cần session)
    {
      name: 'login-tests',
      testMatch: '**/login.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // Bước 3: Chạy test sau đăng nhập (dùng session đã lưu)
    {
      name: 'authenticated-tests',
      testMatch: '**/after-login/**/*.spec.ts',
      dependencies: ['setup'], // Chạy sau setup
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/session.json', // Load session
      },
    },
  ],
});
