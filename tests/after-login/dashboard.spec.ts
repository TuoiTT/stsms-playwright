import { test, expect } from '@playwright/test';

// Session đã được load tự động từ playwright.config.ts
// Không cần đăng nhập lại!

test.describe('Dashboard sau đăng nhập', () => {

  test('Hiển thị trang dashboard đúng', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Không bị redirect về login
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('body')).toBeVisible();
    console.log(`✅ Dashboard URL: ${page.url()}`);
  });

  test('Hiển thị tên người dùng sau đăng nhập', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Kiểm tra có hiển thị thông tin user
    const userInfo = page.locator('[class*="user"], [class*="avatar"], [class*="profile"]').first();
    await expect(userInfo).toBeVisible({ timeout: 15000 });
  });

  test('Có thể đăng xuất', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Tìm nút logout/đăng xuất
    const logoutBtn = page.getByRole('button', { name: /logout|đăng xuất/i })
      .or(page.getByText(/logout|đăng xuất/i));
    await expect(logoutBtn).toBeVisible({ timeout: 15000 });
  });
});
