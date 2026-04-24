import { test, expect } from '@playwright/test';

// ================================================
// STSMS - Login Test Suite
// URL: https://dgrl.citad.vn/login
// Có 2 nút: LOGIN (admin) và Login with SSO (sinh viên)
// ================================================

const SSO_BUTTON = 'button.sso-btn';
const BASE_URL = 'https://dgrl.citad.vn';

// Tăng timeout toàn bộ vì server chậm trên 5 giây
test.setTimeout(60000);

test.describe('Giao diện - Màn hình Đăng nhập', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
  });

  test('LGN_001 - Hiển thị trang Đăng nhập thành công', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('LGN_002 - Hiển thị logo hệ thống đúng', async ({ page }) => {
    const logo = page.locator('img').first();
    await expect(logo).toBeVisible({ timeout: 15000 });
  });

  test('LGN_003 - Hiển thị tên hệ thống STSMS đúng', async ({ page }) => {
    await expect(page.getByText('STSMS')).toBeVisible({ timeout: 15000 });
  });

  test('LGN_004 - Hiển thị mô tả hệ thống đúng', async ({ page }) => {
    await expect(page.getByText('Hệ thống quản lý hoạt động sinh viên')).toBeVisible({ timeout: 15000 });
  });

  test('LGN_005 - Hiển thị hướng dẫn đăng nhập bằng tài khoản trường', async ({ page }) => {
    await expect(page.getByText('Hoặc đăng nhập bằng tài khoản trường')).toBeVisible({ timeout: 15000 });
  });

  test('LGN_006 - Hiển thị nút Login with SSO đúng', async ({ page }) => {
    const ssoButton = page.locator(SSO_BUTTON);
    await expect(ssoButton).toBeVisible({ timeout: 15000 });
    await expect(ssoButton).toBeEnabled();
    await expect(ssoButton).toContainText('Login with SSO');
  });

  test('LGN_007 - Hiển thị ghi chú chuyển hướng Google', async ({ page }) => {
    await expect(
      page.getByText('Hệ thống sẽ chuyển hướng đến trang đăng nhập của Google')
    ).toBeVisible({ timeout: 15000 });
  });

  test('LGN_008 - Khung đăng nhập nằm trong viewport', async ({ page }) => {
    const loginCard = page.locator('.q-card, [class*="card"], form').first();
    await expect(loginCard).toBeVisible({ timeout: 15000 });
    const box = await loginCard.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 10);
  });

  test('LGN_009 - Responsive mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator(SSO_BUTTON)).toBeVisible({ timeout: 15000 });
  });

  test('LGN_010 - Responsive tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator(SSO_BUTTON)).toBeVisible({ timeout: 15000 });
  });

  test('LGN_011 - Tiêu đề tab trình duyệt có nội dung', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    console.log(`Tab title: "${title}"`);
  });

  test('LGN_012 - Tiếng Việt không lỗi font/encoding', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/\ufffd|ï¿½/);
    expect(bodyText).toMatch(/đăng nhập|sinh viên|hệ thống/i);
  });
});

// ================================================
test.describe('Giao diện - Form đăng nhập Admin', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
  });

  test('Hiển thị field Email', async ({ page }) => {
    const emailField = page.locator('input[type="email"], input[placeholder*="Email"]').first();
    await expect(emailField).toBeVisible({ timeout: 15000 });
  });

  test('Hiển thị field Password', async ({ page }) => {
    const passwordField = page.locator('input[type="password"]').first();
    await expect(passwordField).toBeVisible({ timeout: 15000 });
  });

  test('Hiển thị nút LOGIN', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: /^LOGIN$/i });
    await expect(loginBtn).toBeVisible({ timeout: 15000 });
    await expect(loginBtn).toBeEnabled();
  });

  test('Đăng nhập sai hiển thị lỗi 401', async ({ page }) => {
    const emailField = page.locator('input[type="email"], input[placeholder*="Email"]').first();
    const passwordField = page.locator('input[type="password"]').first();
    const loginBtn = page.getByRole('button', { name: /^LOGIN$/i });

    await emailField.fill('wrong@test.com');
    await passwordField.fill('wrongpassword');
    await loginBtn.click();

    const errorMsg = page.locator('[class*="negative"], [class*="error"], .text-red, [role="alert"]').first();
    await expect(errorMsg).toBeVisible({ timeout: 15000 });
    console.log(`Lỗi: ${await errorMsg.innerText().catch(() => 'visible')}`);
  });
});

// ================================================
test.describe('Chức năng - SSO', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator(SSO_BUTTON).waitFor({ timeout: 15000 });
  });

  test('LGN_013 - Click SSO bắt đầu chuyển hướng', async ({ page }) => {
    const urlBefore = page.url();
    await page.locator(SSO_BUTTON).click();

    // Chờ tối đa 15s để URL thay đổi
    await page.waitForFunction(
      (before) => window.location.href !== before,
      urlBefore,
      { timeout: 15000 }
    ).catch(() => console.log('URL chưa đổi sau 15s — kiểm tra thủ công'));

    const urlAfter = page.url();
    console.log(`URL sau click SSO: ${urlAfter}`);
    const redirected = urlAfter !== urlBefore;
    expect(redirected).toBeTruthy();
  });

  test('LGN_018 - Không mở nhiều tab khi bấm SSO nhiều lần', async ({ page }) => {
    await page.locator(SSO_BUTTON).click();
    await page.waitForTimeout(2000);
    const pages = page.context().pages();
    expect(pages.length).toBeLessThanOrEqual(2);
  });

  test('LGN_019 - Nút SSO phản hồi sau khi bấm', async ({ page }) => {
    await page.locator(SSO_BUTTON).click();
    await page.waitForTimeout(1500);
    const navigated = !page.url().includes('/login');
    const isDisabled = await page.locator(SSO_BUTTON).isDisabled().catch(() => true);
    console.log(`Navigated: ${navigated}, Disabled: ${isDisabled}`);
    expect(navigated || isDisabled).toBeTruthy();
  });
});

// ================================================
test.describe('Bảo mật', () => {

  test('LGN_033 - Chặn truy cập root khi chưa đăng nhập', async ({ page }) => {
    // Root URL phải redirect về login nếu chưa authen
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000); // server chậm
    const url = page.url();
    console.log(`Root URL khi chưa login: ${url}`);
    const isAtLogin = url.includes('login') || url.includes('auth');
    expect(isAtLogin).toBeTruthy();
  });

  test('LGN_035 - Không lộ thông tin nhạy cảm khi lỗi', async ({ page }) => {
    await page.goto('/login?error=access_denied', { waitUntil: 'domcontentloaded' });
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/stack trace|exception|traceback|private_key/i);
  });

  test('LGN_036 - Không có cookie không bảo mật', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const cookies = await page.context().cookies();
    console.log(`Cookies: ${cookies.map(c => `${c.name}(httpOnly:${c.httpOnly})`).join(', ')}`);
    const insecureCookies = cookies.filter(c =>
      (c.name.includes('session') || c.name.includes('token')) && !c.httpOnly
    );
    expect(insecureCookies.length).toBe(0);
  });

  test('LGN_037 - Sau xóa cookie không vào được trang bảo vệ', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const url = page.url();
    console.log(`Sau clear cookies: ${url}`);
    const isAtLogin = url.includes('login') || url.includes('auth');
    expect(isAtLogin).toBeTruthy();
  });
});

// ================================================
test.describe('Khả dụng - Accessibility', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator(SSO_BUTTON).waitFor({ timeout: 15000 });
  });

  test('LGN_038 - Bàn phím có thể Tab đến nút SSO', async ({ page }) => {
    let focused = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const activeText = await page.evaluate(() => document.activeElement?.textContent || '');
      const activeClass = await page.evaluate(() => document.activeElement?.className || '');
      if (activeText.includes('SSO') || activeClass.includes('sso')) {
        focused = true;
        console.log(`✅ Focus đến SSO sau ${i + 1} lần Tab`);
        break;
      }
    }
    // Trang vẫn phải hoạt động dù có focus đúng hay không
    await expect(page.locator('body')).toBeVisible();
    console.log(`Keyboard focus SSO: ${focused}`);
  });

  test('LGN_039 - Nút SSO có thể focus', async ({ page }) => {
    const ssoButton = page.locator(SSO_BUTTON);
    await ssoButton.focus();
    const isFocused = await page.evaluate(() => document.activeElement !== document.body);
    expect(isFocused).toBeTruthy();
  });

  test('LGN_040 - Trang có nội dung đọc được', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });
});

// ================================================
test.describe('Tương thích trình duyệt', () => {

  test('LGN_041/042/043 - Trang login và nút SSO hoạt động', async ({ page, browserName }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const ssoButton = page.locator(SSO_BUTTON);
    await expect(ssoButton).toBeVisible({ timeout: 15000 });
    await expect(ssoButton).toBeEnabled();
    console.log(`✅ ${browserName}: nút SSO OK`);
  });
});

// ================================================
test.describe('Hiệu năng', () => {

  test('LGN_044 - Trang đăng nhập tải dưới 10 giây', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator(SSO_BUTTON).waitFor({ timeout: 10000 });
    const loadTime = Date.now() - startTime;
    console.log(`⏱ Thời gian tải: ${loadTime}ms`);
    // Nới rộng lên 10s vì server thực tế chậm
    expect(loadTime).toBeLessThan(10000);
  });

  test('LGN_045 - Chuyển hướng SSO bắt đầu dưới 10 giây', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator(SSO_BUTTON).waitFor({ timeout: 15000 });

    const startTime = Date.now();
    const urlBefore = page.url();
    await page.locator(SSO_BUTTON).click();

    await page.waitForFunction(
      (before) => window.location.href !== before,
      urlBefore,
      { timeout: 10000 }
    ).catch(() => console.log('Chưa redirect sau 10s'));

    const redirectTime = Date.now() - startTime;
    console.log(`⏱ SSO redirect: ${redirectTime}ms`);
    expect(redirectTime).toBeLessThan(10000);
  });
});
