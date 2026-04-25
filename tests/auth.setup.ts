import { test as setup, expect } from '@playwright/test';
import path from 'path';

// File lưu session sau khi đăng nhập
export const SESSION_FILE = path.join(__dirname, '../.auth/session.json');

setup('Đăng nhập và lưu session', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  // Điền Email
  await page.locator('input[type="email"], input[placeholder*="Email"]')
    .first()
    .fill(process.env.TEST_EMAIL || '');

  // Điền Password
  await page.locator('input[type="password"]')
    .first()
    .fill(process.env.TEST_PASSWORD || '');

  // Bấm LOGIN
  await page.getByRole('button', { name: /^LOGIN$/i }).click();

  // Chờ vào được trang sau login (tối đa 15s)
  await page.waitForURL(url => !url.toString().includes('/login'), {
    timeout: 15000
  });

  console.log(`✅ Đã đăng nhập, URL hiện tại: ${page.url()}`);

  // Lưu toàn bộ session (cookie + localStorage)
  await page.context().storageState({ path: SESSION_FILE });
});
