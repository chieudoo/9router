<div align="center">
  <img src="./public/xproxy-mark.svg" alt="XProxy" width="96" />

  # XProxy

  **AI gateway cục bộ cho coding agent và các AI provider.**

  [English](./README.md) | [Tieng Viet](./README.vi.md)
</div>

## Tổng quan

XProxy cung cấp một endpoint tương thích OpenAI và định tuyến request tới các AI provider đã kết nối. Dashboard cục bộ quản lý credentials provider, API key, usage, request details, cấu hình CLI tool, fallback và Token Saver.

## Tính năng

- Một endpoint cho Claude Code, Codex, Cursor, Cline, OpenCode, OpenClaw và các tool tương thích khác
- Định tuyến provider, model alias, xoay vòng nhiều tài khoản và fallback
- Chuyển đổi định dạng OpenAI, Claude, Gemini, Responses API và các định dạng riêng của provider
- Quản lý OAuth/API key, tự refresh token và theo dõi quota
- Usage, request details, cached tokens và ước tính chi phí
- RTK nén tool output, Headroom nén context tùy chọn, Caveman và Ponytail prompts
- Hỗ trợ tùy chọn Cloudflare Tunnel, Tailscale, MITM và outbound proxy

## Yêu cầu

- Node.js 22.5.0 trở lên
- npm

## Chạy từ source

```bash
git clone https://github.com/chieudoo/xproxy.git xproxy
cd xproxy
cp .env.example .env
npm install
npm run dev
```

Đặt `PORT` trong `.env` trước khi khởi động. Cấu hình local mặc định dùng:

```env
PORT=20127
```

Mở dashboard tại `http://localhost:20127/dashboard`; API ở `http://localhost:20127/v1`.

Chạy production:

```bash
npm run build
npm run start
```

## Docker

Docker image phát hành hiện vẫn là `chieudoo/9router`.

```bash
docker run -d --name xproxy \
  -p 20127:20127 \
  -v xproxy-data:/app/data \
  -e PORT=20127 \
  chieudoo/9router:latest
```

Xem [DOCKER.md](./DOCKER.md) để dùng Docker Compose và cấu hình persistent storage.

## Thiết lập nhanh

1. Mở **Dashboard > Providers** và kết nối provider upstream.
2. Mở **Dashboard > Endpoint & Key** để tạo hoặc sao chép API key.
3. Cấu hình tool của bạn:

```text
Base URL: http://localhost:20127/v1
API key:  API key của XProxy
Model:    provider/model
```

Hướng dẫn cụ thể cho từng tool có trong **Dashboard > CLI Tools**.

## Token Saver

XProxy áp dụng các cơ chế Token Saver đang bật lên request cuối cùng gửi tới upstream:

- **RTK** nén tool output có cấu trúc và kích thước lớn, như git diff, grep, danh sách thư mục, build output và log lặp lại.
- **Headroom** tùy chọn gửi message history tới dịch vụ `/v1/compress` đã cấu hình. Nếu dịch vụ lỗi, request gốc vẫn được gửi đi.
- **Caveman** chèn system instruction để model trả lời ngắn gọn.
- **Ponytail** chèn system instruction hướng model tới giải pháp tối giản.

Tắt toàn bộ Token Saver cho một request bằng header:

```http
x-xproxy-token-saver: off
```

## Request Logs Và Quyền Riêng Tư

`ENABLE_REQUEST_LOGS=true` ghi request/response chi tiết vào `logs/` và bật lưu Request Details trên dashboard. Log có thể chứa prompt, response, cookie và API credentials. Chỉ bật khi debug, bảo vệ hoặc xóa các file log sau khi dùng.

## Cấu hình

Sao chép `.env.example` thành `.env`. Các biến hay dùng:

| Biến | Mục đích |
| --- | --- |
| `PORT` | HTTP port cho dashboard và API |
| `DATA_DIR` | Thư mục database và application data |
| `ENABLE_REQUEST_LOGS` | Bật log request/response chi tiết ở local |
| `LOG_LEVEL` | Mức log console: `debug`, `info`, `warn`, hoặc `error` |
| `HOSTNAME` | Host bind cho production server |

## Phát triển

```bash
npm run dev
npm run build
npx vitest run --exclude ".next/**"
```

## License

Xem [LICENSE](./LICENSE).
