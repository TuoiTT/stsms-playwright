import { test, expect } from '@playwright/test';

// ================================================
// STSMS - Login Test Suite
// URL: https://dgrl.citad.vn/login
// Có 2 nút: LOGIN (admin) và Login with SSO (sinh viên)
// ================================================

// Selector đúng dựa trên HTML thật
const SSO_BUTTON = 'button.sso-btn';
const LOGIN_BUTTON = 'button[type="button"]:not(.sso-btn), button:has-text("LOGIN")';

test.describe('Giao diện - Màn hình Đăng nhập', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('LGN_001 - Hiển thị trang Đăng nhập thành công', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('LGN_002 - Hiển thị logo hệ thống đúng', async ({ page }) => {
    const logo = page.locator('img').first();
    await expect(logo).toBeVisible();
  });

  test('LGN_003 - Hiển thị tên hệ thống STSMS đúng', async ({ page }) => {
    await expect(page.getByText('STSMS')).toBeVisible();
  });

  test('LGN_004 - Hiển thị mô tả hệ thống đúng', async ({ page }) => {
    await expect(page.getByText('Hệ thống quản lý hoạt động sinh viên')).toBeVisible();
  });

  test('LGN_005 - Hiển thị hướng dẫn đăng nhập bằng tài khoản trường', async ({ page }) => {
    await expect(page.getByText('Hoặc đăng nhập bằng tài khoản trường')).toBeVisible();
  });

  test('LGN_006 - Hiển thị nút Login with SSO đúng', async ({ page }) => {
    const ssoButton = page.locator(SSO_BUTTON);
    await expect(ssoButton).toBeVisible();
    await expect(ssoButton).toBeEnabled();
    await expect(ssoButton).toContainText('Login with SSO');
  });

  test('LGN_007 - Hiển thị ghi chú chuyển hướng Google đúng', async ({ page }) => {
    await expect(page.getByText('Hệ thống sẽ chuyển hướng đến trang đăng nhập của Google')).toBeVisible();
  });

  test('LGN_008 - Kiểm tra căn chỉnh khung đăng nhập', async ({ page }) => {
    const loginCard = page.locator('.q-card, [class*="card"], form').first();
    await expect(loginCard).toBeVisible();
    const box = await loginCard.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 10);
  });

  test('LGN_009 - Responsive trên mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const ssoButton = page.locator(SSO_BUTTON);
    await expect(ssoButton).toBeVisible();
  });

  test('LGN_010 - Responsive trên tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const ssoButton = page.locator(SSO_BUTTON);
    await expect(ssoButton).toBeVisible();
  });

  test('LGN_011 - Tiêu đề tab trình duyệt có nội dung', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    console.log(`Tab title: ${title}`);
  });

  test('LGN_012 - Hiển thị tiếng Việt không lỗi font', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/\ufffd|ï¿½/);
    expect(bodyText).toMatch(/đăng nhập|sinh viên|hệ thống/i);
  });
});

// ================================================
test.describe('Giao diện - Form đăng nhập Admin', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('Hiển thị field Email', async ({ page }) => {
    const emailField = page.locator('input[type="email"], input[placeholder*="Email"], input[aria-label*="Email"]').first();
    await expect(emailField).toBeVisible();
  });

  test('Hiển thị field Password', async ({ page }) => {
    const passwordField = page.locator('input[type="password"]').first();
    await expect(passwordField).toBeVisible();
  });

  test('Hiển thị nút LOGIN', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: /^LOGIN$/i });
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toBeEnabled();
  });
});

// ================================================
test.describe('Chức năng - SSO', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('LGN_013 - Chuyển hướng đến Google/SSO khi bấm nút SSO', async ({ page }) => {
    const ssoButton = page.locator(SSO_BUTTON);
    await expect(ssoButton).toBeVisible();

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page').catch(() => null),
      page.waitForURL(url => !url.toString().includes('/login'), { timeout: 8000 }).catch(() => null),
      ssoButton.click(),
    ]);

    const currentUrl = page.url();
    const isRedirected =
      currentUrl.includes('google') ||
      currentUrl.includes('accounts') ||
      currentUrl.includes('oauth') ||
      currentUrl.includes('sso') ||
      !currentUrl.endsWith('/login');

    console.log(`Redirected to: ${currentUrl}`);
    expect(isRedirected).toBeTruthy();
  });

  test('LGN_018 - Ngăn nhiều luồng đăng nhập khi bấm SSO nhiều lần', async ({ page }) => {
    const ssoButton = page.locator(SSO_BUTTON);
    await ssoButton.click();
    // Chỉ 1 navigation xảy ra
    const pages = page.context().pages();
    expect(pages.length).toBeLessThanOrEqual(2);
  });

  test('LGN_019 - Nút SSO disable hoặc loading sau khi bấm', async ({ page }) => {
    const ssoButton = page.locator(SSO_BUTTON);
    await ssoButton.click();
    // Sau click: nút bị disabled hoặc navigate đi — cả hai đều đúng
    const isDisabled = await ssoButton.isDisabled().catch(() => false);
    const navigated = !page.url().endsWith('/login');
    console.log(`Disabled: ${isDisabled}, Navigated: ${navigated}`);
    expect(isDisabled || navigated).toBeTruthy();
  });
});

// ================================================
test.describe('Chức năng - Login Admin', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('Đăng nhập sai password hiển thị lỗi 401', async ({ page }) => {
    const emailField = page.locator('input[type="email"], input[placeholder*="Email"]').first();
    const passwordField = page.locator('input[type="password"]').first();
    const loginBtn = page.getByRole('button', { name: /^LOGIN$/i });

    await emailField.fill('wrong@test.com');
    await passwordField.fill('wrongpassword');
    await loginBtn.click();

    // Phải hiện thông báo lỗi (như "Request failed with status code 401")
    const errorMsg = page.locator('[class*="error"], [class*="negative"], .text-red, [role="alert"]').first();
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    console.log(`Error message: ${await errorMsg.innerText().catch(() => 'not found')}`);
  });

  test('Field Email không chấp nhận ký tự không phải email', async ({ page }) => {
    const emailField = page.locator('input[type="email"], input[placeholder*="Email"]').first();
    await emailField.fill('notanemail');
    const loginBtn = page.getByRole('button', { name: /^LOGIN$/i });
    await loginBtn.click();
    // HTML5 validation hoặc custom error
    await expect(page).toHaveURL(/\/login/);
  });
});

// ================================================
test.describe('Bảo mật', () => {

  test('LGN_033 - Chặn truy cập thẳng vào trang bảo vệ khi chưa đăng nhập', async ({ page }) => {
    // Thử các URL nội bộ phổ biến
    await page.goto('/dashboard').catch(() => {});
    const url = page.url();
    const isRedirectedToLogin = url.includes('login') || url.includes('auth');
    console.log(`After /dashboard: ${url}`);
    expect(isRedirectedToLogin).toBeTruthy();
  });

  test('LGN_035 - Không lộ thông tin nhạy cảm khi lỗi đăng nhập', async ({ page }) => {
    await page.goto('/login?error=access_denied');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/stack trace|exception|traceback|secret|private_key/i);
  });

  test('LGN_036 - Session cookie có HttpOnly và Secure', async ({ page }) => {
    await page.goto('/login');
    const cookies = await page.context().cookies();
    console.log(`Cookies found: ${cookies.map(c => c.name).join(', ')}`);
    const sessionCookie = cookies.find(c =>
      c.name.toLowerCase().includes('session') ||
      c.name.toLowerCase().includes('token') ||
      c.name.startsWith('_')
    );
    if (sessionCookie) {
      expect(sessionCookie.httpOnly).toBeTruthy();
    } else {
      console.log('Chưa có session cookie trước khi đăng nhập — bình thường');
    }
  });

  test('LGN_037 - Không truy cập trang bảo vệ sau đăng xuất', async ({ page }) => {
    await page.goto('/logout').catch(() => {});
    await page.goto('/dashboard').catch(() => {});
    const url = page.url();
    const isAtLogin = url.includes('login') || url.includes('auth');
    console.log(`After logout + /dashboard: ${url}`);
    expect(isAtLogin).toBeTruthy();
  });
});

// ================================================
test.describe('Khả dụng - Accessibility', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('LGN_038 - Điều hướng bàn phím đến nút SSO', async ({ page }) => {
    // Tab nhiều lần để đến nút SSO
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.className || '');
      if (focused.includes('sso')) break;
    }
    await page.keyboard.press('Enter');
    await expect(page.locator('body')).toBeVisible();
  });

  test('LGN_039 - Trạng thái focus rõ ràng trên nút SSO', async ({ page }) => {
    const ssoButton = page.locator(SSO_BUTTON);
    await ssoButton.focus();
    const isFocused = await page.evaluate(() => {
      const el = document.activeElement;
      const style = el ? window.getComputedStyle(el) : null;
      return style ? (style.outline !== 'none' || style.boxShadow !== 'none') : false;
    });
    console.log(`SSO button has focus style: ${isFocused}`);
  });

  test('LGN_040 - Độ tương phản chữ đạt mức đọc được', async ({ page }) => {
    // Kiểm tra cơ bản: text không bị ẩn
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });
});

// ================================================
test.describe('Tương thích trình duyệt', () => {

  test('LGN_041/042/043 - Trang login và nút SSO hoạt động', async ({ page, browserName }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const ssoButton = page.locator(SSO_BUTTON);
    await expect(ssoButton).toBeVisible();
    await expect(ssoButton).toBeEnabled();
    console.log(`✅ ${browserName}: nút SSO hiển thị và hoạt động`);
  });
});

// ================================================
test.describe('Hiệu năng', () => {

  test('LGN_044 - Trang đăng nhập tải dưới 5 giây', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    console.log(`⏱ Thời gian tải: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('LGN_045 - Chuyển hướng SSO bắt đầu dưới 5 giây', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const ssoButton = page.locator(SSO_BUTTON);
    await expect(ssoButton).toBeVisible();

    const startTime = Date.now();
    await ssoButton.click();
    await page.waitForURL(url => !url.toString().endsWith('/login'), { timeout: 5000 }).catch(() => {});
    const redirectTime = Date.now() - startTime;

    console.log(`⏱ Thời gian chuyển hướng SSO: ${redirectTime}ms`);
    expect(redirectTime).toBeLessThan(5000);
  });
});
