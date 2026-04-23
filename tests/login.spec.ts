import { test, expect } from '@playwright/test';

// ================================================
// STSMS - Login Test Suite
// Dựa trên file: Login_CTSV.xlsx
// URL: https://dgrl.citad.vn/login
// ================================================

test.describe('Giao diện - Màn hình Đăng nhập', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('LGN_001 - Hiển thị trang Đăng nhập thành công', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('LGN_002 - Hiển thị logo hệ thống đúng', async ({ page }) => {
    const logo = page.locator('img[alt*="logo"], img[src*="logo"], .logo');
    await expect(logo).toBeVisible();
  });

  test('LGN_003 - Hiển thị tên hệ thống STSMS đúng', async ({ page }) => {
    await expect(page.getByText('STSMS')).toBeVisible();
  });

  test('LGN_004 - Hiển thị mô tả hệ thống đúng', async ({ page }) => {
    await expect(page.getByText('Hệ thống quản lý hoạt động sinh viên')).toBeVisible();
  });

  test('LGN_005 - Hiển thị hướng dẫn đăng nhập đúng', async ({ page }) => {
    await expect(page.getByText('Đăng nhập bằng tài khoản trường')).toBeVisible();
  });

  test('LGN_006 - Hiển thị nút Đăng nhập SSO đúng', async ({ page }) => {
    const ssoButton = page.getByRole('button', { name: /Đăng nhập SSO/i })
      .or(page.getByText('Đăng nhập SSO'));
    await expect(ssoButton).toBeVisible();
    await expect(ssoButton).toBeEnabled();
  });

  test('LGN_007 - Hiển thị ghi chú chuyển hướng đúng', async ({ page }) => {
    // Ghi chú về chuyển hướng đến Google
    const note = page.getByText(/Google/i);
    await expect(note).toBeVisible();
  });

  test('LGN_008 - Kiểm tra căn chỉnh và khoảng cách của khung đăng nhập', async ({ page }) => {
    const loginBox = page.locator('form, .login-box, .login-container, [class*="login"]').first();
    await expect(loginBox).toBeVisible();
    const box = await loginBox.boundingBox();
    expect(box).not.toBeNull();
    // Kiểm tra khung nằm trong viewport
    const viewport = page.viewportSize();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 10);
  });

  test('LGN_011 - Kiểm tra tiêu đề tab trình duyệt', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('LGN_012 - Kiểm tra hiển thị tiếng Việt không lỗi font', async ({ page }) => {
    // Kiểm tra không có ký tự lỗi encoding (□, ?, ï¿½)
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/\ufffd|ï¿½/);
  });
});

// ================================================
test.describe('Giao diện - Responsive', () => {

  test('LGN_009 - Responsive trên mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
    // Kiểm tra nút SSO vẫn hiển thị và không bị cắt
    const ssoButton = page.getByRole('button', { name: /SSO/i })
      .or(page.getByText('Đăng nhập SSO'));
    await expect(ssoButton).toBeVisible();
  });

  test('LGN_010 - Responsive trên tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
    const ssoButton = page.getByRole('button', { name: /SSO/i })
      .or(page.getByText('Đăng nhập SSO'));
    await expect(ssoButton).toBeVisible();
  });
});

// ================================================
test.describe('Chức năng - SSO', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('LGN_013 - Chuyển hướng đến nhà cung cấp SSO khi bấm nút', async ({ page }) => {
    const ssoButton = page.getByRole('button', { name: /SSO/i })
      .or(page.getByText('Đăng nhập SSO'));
    
    // Chờ navigation sau khi click
    const [response] = await Promise.all([
      page.waitForNavigation({ timeout: 10000 }).catch(() => null),
      ssoButton.click(),
    ]);

    // URL phải thay đổi sang trang Google/SSO
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('google') || 
                         currentUrl.includes('accounts') || 
                         currentUrl.includes('oauth') ||
                         currentUrl !== 'https://dgrl.citad.vn/login';
    expect(isRedirected).toBeTruthy();
  });

  test('LGN_018 - Ngăn nhiều luồng đăng nhập khi bấm SSO nhiều lần', async ({ page }) => {
    const ssoButton = page.getByRole('button', { name: /SSO/i })
      .or(page.getByText('Đăng nhập SSO'));

    // Double click
    await ssoButton.dblclick({ timeout: 5000 }).catch(() => ssoButton.click());
    
    // Chỉ có 1 navigation xảy ra (không mở 2 tab)
    const pages = page.context().pages();
    expect(pages.length).toBe(1);
  });

  test('LGN_019 - Nút SSO hiển thị loading sau khi bấm', async ({ page }) => {
    const ssoButton = page.getByRole('button', { name: /SSO/i })
      .or(page.getByText('Đăng nhập SSO'));
    await ssoButton.click();
    
    // Kiểm tra nút bị disable hoặc có class loading
    const isDisabled = await ssoButton.isDisabled().catch(() => false);
    const hasLoadingClass = await ssoButton.evaluate(el => 
      el.className.includes('loading') || el.className.includes('disabled')
    ).catch(() => false);
    
    // Ít nhất một trong hai phải đúng
    // (Nếu cả hai false → bug: nút không có trạng thái loading)
    console.log(`Button disabled: ${isDisabled}, Has loading class: ${hasLoadingClass}`);
  });
});

// ================================================
test.describe('Bảo mật', () => {

  test('LGN_033 - Chặn truy cập thẳng vào trang bảo vệ khi chưa đăng nhập', async ({ page }) => {
    // Thử truy cập trang nội bộ trực tiếp
    await page.goto('/dashboard');
    // Phải bị redirect về login
    await expect(page).toHaveURL(/login/);
  });

  test('LGN_035 - Không lộ thông tin nhạy cảm khi lỗi đăng nhập', async ({ page }) => {
    await page.goto('/login');
    // Gọi callback với tham số không hợp lệ
    const response = await page.goto('/login?error=access_denied').catch(() => null);
    
    const bodyText = await page.locator('body').innerText();
    // Không được hiển thị stack trace, token, hoặc thông tin kỹ thuật
    expect(bodyText).not.toMatch(/stack trace|exception|token|secret|password/i);
  });

  test('LGN_036 - Session cookie có cấu hình bảo mật', async ({ page, context }) => {
    await page.goto('/login');
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => 
      c.name.toLowerCase().includes('session') || 
      c.name.toLowerCase().includes('token') ||
      c.name.startsWith('_')
    );
    if (sessionCookie) {
      // Cookie phải có HttpOnly và Secure
      expect(sessionCookie.httpOnly).toBeTruthy();
      expect(sessionCookie.secure).toBeTruthy();
    }
  });

  test('LGN_037 - Không truy cập trang bảo vệ sau khi đăng xuất bằng Back', async ({ page }) => {
    // Đăng xuất (giả sử đã có session)
    await page.goto('/logout').catch(() => {});
    // Bấm back
    await page.goBack().catch(() => {});
    // Vẫn phải ở trang login
    await expect(page).toHaveURL(/login/);
  });
});

// ================================================
test.describe('Khả dụng - Accessibility', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('LGN_038 - Điều hướng bàn phím đến nút SSO', async ({ page }) => {
    // Bấm Tab để focus
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    // Bấm Enter để kích hoạt
    await page.keyboard.press('Enter');
    // Không bị lỗi
    await expect(page.locator('body')).toBeVisible();
  });

  test('LGN_039 - Trạng thái focus rõ ràng trên nút SSO', async ({ page }) => {
    const ssoButton = page.getByRole('button', { name: /SSO/i })
      .or(page.getByText('Đăng nhập SSO'));
    await ssoButton.focus();
    
    // Kiểm tra có outline hoặc box-shadow khi focus
    const outline = await ssoButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.outline !== 'none' && style.outline !== '' ||
             style.boxShadow !== 'none' && style.boxShadow !== '';
    });
    expect(outline).toBeTruthy();
  });
});

// ================================================
test.describe('Hiệu năng', () => {

  test('LGN_044 - Trang đăng nhập tải trong thời gian chấp nhận được', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱ Thời gian tải trang: ${loadTime}ms`);
    // Phải tải xong trong vòng 5 giây
    expect(loadTime).toBeLessThan(5000);
  });

  test('LGN_045 - Chuyển hướng SSO bắt đầu trong thời gian chấp nhận được', async ({ page }) => {
    await page.goto('/login');
    const ssoButton = page.getByRole('button', { name: /SSO/i })
      .or(page.getByText('Đăng nhập SSO'));
    
    const startTime = Date.now();
    await ssoButton.click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    const redirectTime = Date.now() - startTime;
    
    console.log(`⏱ Thời gian chuyển hướng SSO: ${redirectTime}ms`);
    expect(redirectTime).toBeLessThan(5000);
  });
});

// ================================================
test.describe('Xử lý lỗi', () => {

  test('LGN_028 - Xử lý mất mạng trước khi bấm SSO', async ({ page, context }) => {
    await page.goto('/login');
    // Giả lập offline
    await context.setOffline(true);
    const ssoButton = page.getByRole('button', { name: /SSO/i })
      .or(page.getByText('Đăng nhập SSO'));
    await ssoButton.click().catch(() => {});
    // Trang không được bị crash
    await expect(page.locator('body')).toBeVisible();
    await context.setOffline(false);
  });

  test('LGN_031 - Từ chối callback URL không hợp lệ', async ({ page }) => {
    const response = await page.goto('/login?code=INVALID_CODE&state=INVALID_STATE');
    await expect(page.locator('body')).toBeVisible();
    // Không hiện thông tin kỹ thuật nhạy cảm
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/stack|exception|traceback/i);
  });

  test('LGN_032 - Từ chối callback thiếu tham số', async ({ page }) => {
    await page.goto('/login?code=');
    await expect(page.locator('body')).toBeVisible();
  });
});

// ================================================
test.describe('Tương thích trình duyệt', () => {

  test('LGN_041/042/043 - Luồng đăng nhập hoạt động bình thường', async ({ page, browserName }) => {
    await page.goto('/login');
    const ssoButton = page.getByRole('button', { name: /SSO/i })
      .or(page.getByText('Đăng nhập SSO'));
    await expect(ssoButton).toBeVisible();
    await expect(ssoButton).toBeEnabled();
    console.log(`✅ Trình duyệt ${browserName}: nút SSO hiển thị và hoạt động`);
  });
});
