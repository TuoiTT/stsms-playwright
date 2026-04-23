# 🧪 STSMS Login Test - Hướng dẫn sử dụng

## Dành cho: Manual Tester (không cần cài code về máy)

---

## Cấu trúc thư mục

```
stsms-playwright/
├── tests/
│   └── login.spec.ts          # 45 test cases cho Login
├── .github/
│   └── workflows/
│       └── login-test.yml     # Tự động chạy trên GitHub
├── playwright.config.ts       # Cấu hình URL, auth, browser
├── .env.example               # Mẫu biến môi trường
└── package.json
```

---

## Lần đầu thiết lập (chỉ làm 1 lần)

### Bước 1: Tạo GitHub repository
1. Vào https://github.com → New repository
2. Đặt tên: `stsms-playwright`
3. Private repo
4. Upload toàn bộ file này lên

### Bước 2: Cài password vào GitHub Secrets (an toàn)
1. Vào repo → **Settings** → **Secrets and variables** → **Actions**
2. Bấm **New repository secret**
3. Thêm 2 secrets:
   - `BASIC_AUTH_USER` = username của bạn
   - `BASIC_AUTH_PASS` = password của bạn

---

## Chạy test (hàng ngày)

### Cách 1: Chạy thủ công
1. Vào GitHub repo → tab **Actions**
2. Chọn **"STSMS Login Test - Tự động chạy"**
3. Bấm **"Run workflow"**
4. Chọn trình duyệt (chromium / firefox / all)
5. Bấm **"Run workflow"** màu xanh

### Cách 2: Tự động mỗi sáng
Test sẽ **tự chạy lúc 8:00 SA** từ Thứ 2 đến Thứ 6 — không cần làm gì.

---

## Xem kết quả

Sau khi chạy xong:
1. Vào tab **Actions** → chọn lần chạy vừa rồi
2. Kéo xuống phần **Artifacts**
3. Tải về `playwright-report-XXX`
4. Mở file `index.html` → xem báo cáo đẹp

### Ý nghĩa kết quả:
| Màu | Nghĩa |
|-----|-------|
| ✅ Xanh | Test PASS |
| ❌ Đỏ | Test FAIL — có bug |
| ⚠️ Vàng | Flaky — cần xem lại |

---

## Test cases được tự động hóa

| ID | Mô tả | Nhóm |
|----|-------|------|
| LGN_001 | Hiển thị trang đăng nhập | Giao diện |
| LGN_002 | Logo hiển thị đúng | Giao diện |
| LGN_003 | Tên hệ thống STSMS | Giao diện |
| LGN_004 | Mô tả hệ thống | Giao diện |
| LGN_005 | Hướng dẫn đăng nhập | Giao diện |
| LGN_006 | Nút Đăng nhập SSO | Giao diện |
| LGN_007 | Ghi chú chuyển hướng | Giao diện |
| LGN_008 | Căn chỉnh khung login | Giao diện |
| LGN_009 | Responsive mobile | Giao diện |
| LGN_010 | Responsive tablet | Giao diện |
| LGN_011 | Tiêu đề tab trình duyệt | Giao diện |
| LGN_012 | Hiển thị tiếng Việt | Giao diện |
| LGN_013 | Chuyển hướng SSO | Chức năng |
| LGN_018 | Ngăn nhiều luồng SSO | Chức năng |
| LGN_019 | Trạng thái loading nút | Chức năng |
| LGN_028 | Xử lý mất mạng | Xử lý lỗi |
| LGN_031 | Callback URL không hợp lệ | Xử lý lỗi |
| LGN_032 | Callback thiếu tham số | Xử lý lỗi |
| LGN_033 | Chặn truy cập chưa đăng nhập | Bảo mật |
| LGN_035 | Không lộ thông tin nhạy cảm | Bảo mật |
| LGN_036 | Cookie bảo mật | Bảo mật |
| LGN_037 | Không truy cập sau đăng xuất | Bảo mật |
| LGN_038 | Điều hướng bàn phím | Khả dụng |
| LGN_039 | Focus rõ ràng | Khả dụng |
| LGN_041-043 | Tương thích Chrome/Firefox | Tương thích |
| LGN_044 | Thời gian tải trang (<5s) | Hiệu năng |
| LGN_045 | Thời gian chuyển hướng SSO | Hiệu năng |

### ⚠️ Test cần thực hiện thủ công (vì cần tài khoản Google thật):
- LGN_014: Đăng nhập thành công với tài khoản hợp lệ
- LGN_015: Từ chối tài khoản ngoài domain
- LGN_016: Tài khoản chưa được cấp quyền
- LGN_017: Hủy đăng nhập ở trang Google
- LGN_020: Truy cập lại /login khi đã đăng nhập
- LGN_021-025: Các test điều hướng sau đăng nhập
- LGN_026-027: Timeout phiên đăng nhập
