<div align="center">
  <img src="./public/xproxy-mark.svg" alt="XProxy" width="112" />

  # XProxy

  ### Một endpoint local cho toàn bộ workflow AI coding.

  Định tuyến request, xoay vòng tài khoản, chuyển đổi định dạng provider, theo dõi usage và tối ưu các phiên agent có nhiều tool call.

  [Bắt đầu](#bat-dau) · [Token Saver](#token-saver) · [Cấu hình](#cau-hinh) · [English](./README.md)

  [![Node.js](https://img.shields.io/badge/Node.js-22.5%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![GitHub](https://img.shields.io/badge/GitHub-chieudoo%2Fxproxy-181717?logo=github)](https://github.com/chieudoo/xproxy)
  [![Docker](https://img.shields.io/badge/Docker-chieudoo%2Fxproxy-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/)
</div>

---

<p align="center">
  <img src="./images/xproxy-providers.webp" alt="Dashboard providers của XProxy" width="100%" />
</p>

## Control Plane Cho Agent Của Bạn

Editor, CLI và coding agent sử dụng các API khác nhau. Provider có model, quota, credentials và response format khác nhau. XProxy nằm ở giữa để mọi tool dùng một endpoint, còn bạn kiểm soát route.

```text
 Claude Code   Codex   Cursor   Cline   OpenCode   OpenClaw
      \          |       |       |        |          /
       \         |       |       |        |         /
        └──────────── XProxy : PORT /v1 ───────────┘
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
  Translation       Token Saver        Routing
  OpenAI/Claude/    RTK/Headroom/      accounts, aliases,
  Gemini/Responses  Caveman/Ponytail   fallbacks, quotas
       │                 │                  │
       └─────────────────┴──────────────────┘
                         │
             AI providers và local gateways
```

| Kết nối một lần | Luôn tiếp tục làm việc | Biết chính xác điều gì xảy ra |
| --- | --- | --- |
| Dùng một OpenAI-compatible base URL cho các tool tương thích. | Xoay vòng account và fallback khi provider hoặc quota không khả dụng. | Xem request, token usage, cache read, chi phí và provider health. |

## Dành Cho Agent Traffic Thực Tế

### Định tuyến mà không đổi workflow

- Kết nối OAuth và API-key provider trên dashboard.
- Dùng model alias và định danh `provider/model` qua một endpoint.
- Xoay nhiều account và áp dụng model-combo fallback.
- Cấu hình Claude Code, Codex, Cursor, Cline, OpenCode, OpenClaw và các client tương thích trong **Dashboard > CLI Tools**.

### Chuyển đổi tại edge

- OpenAI Chat Completions, OpenAI Responses, Claude, Gemini và provider-native formats.
- Streaming và non-streaming response.
- Tool call, reasoning, image, embedding, TTS, STT, search và các capability riêng của provider khi được hỗ trợ.

### Vận hành local

- Dashboard quản lý provider, API key, usage, request details, pricing, tunnel và diagnostics.
- OAuth refresh, quota tracking, provider health check và outbound proxy.
- Tùy chọn Cloudflare Tunnel, Tailscale, MITM và Headroom.

<p align="center">
  <img src="./images/xproxy-endpoint.webp" alt="Dashboard endpoint và API key của XProxy" width="49%" />
  <img src="./images/xproxy-token-saver.webp" alt="Dashboard Token Saver của XProxy" width="49%" />
</p>

## Bắt Đầu

**Yêu cầu Node.js 22.5.0 trở lên.**

### Chạy từ source

```bash
git clone https://github.com/chieudoo/xproxy.git
cd xproxy
cp .env.example .env
npm install
npm run dev
```

Đặt port bạn muốn trong `.env`:

```env
PORT=20127
```

Sau đó mở:

```text
Dashboard  http://localhost:<PORT>/dashboard
API        http://localhost:<PORT>/v1
```

### Kết nối tool đầu tiên

1. Mở **Dashboard > Providers** và kết nối provider upstream.
2. Mở **Dashboard > Endpoint & Key** để tạo API key.
3. Trỏ client của bạn tới XProxy:

```text
Base URL  http://localhost:<PORT>/v1
API Key   API key của XProxy
Model     provider/model
```

Dashboard tạo hướng dẫn cụ thể cho từng tool trong **CLI Tools**.

### Production

```bash
npm run build
npm run start
```

Xem [DOCKER.md](./DOCKER.md) cho container và persistent data.

## Token Saver

Token Saver thay đổi request cuối cùng gửi lên upstream, không thay đổi cấu hình client của bạn.

| Cơ chế | Hoạt động | Mặc định |
| --- | --- | --- |
| **RTK** | Nén tool output có cấu trúc và lớn: diff, grep, tree, build output, log lặp lại. | Bật |
| **Headroom** | Gửi history tới dịch vụ `/v1/compress` đã cấu hình. Request gốc vẫn chạy nếu dịch vụ lỗi. | Tắt |
| **Caveman** | Append system instruction để model trả lời ngắn gọn. | Tắt |
| **Ponytail** | Append system instruction hướng model tới code tối giản. | Tắt |

Tắt toàn bộ Token Saver cho một request:

```http
x-xproxy-token-saver: off
```

RTK chỉ hoạt động khi tìm thấy tool result có thể nén. Ponytail và Caveman xuất hiện trong upstream payload cuối cùng, không có trong raw client request.

## Cấu Hình

Sao chép `.env.example` thành `.env`. Các biến quan trọng:

| Biến | Mục đích |
| --- | --- |
| `PORT` | Port cho dashboard và OpenAI-compatible API |
| `DATA_DIR` | Thư mục database và application data |
| `HOSTNAME` | Host bind cho production server |
| `LOG_LEVEL` | Mức log console: `debug`, `info`, `warn`, hoặc `error` |
| `ENABLE_REQUEST_LOGS` | Ghi request/response chi tiết và bật request details |
| `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY` | Outbound proxy tùy chọn cho provider request |

## Observability Và Quyền Riêng Tư

Usage dashboard theo dõi request, input/output tokens, cached tokens, tổng theo provider/model và chi phí ước tính.

Chỉ đặt `ENABLE_REQUEST_LOGS=true` khi debug. Nó ghi request/response đầy đủ vào `logs/`, có thể chứa prompt, response, cookie và API credentials. Hãy bảo vệ hoặc xóa các file này sau khi dùng.

## Phát Triển

```bash
npm run dev
npm run build
npx vitest run --exclude ".next/**"
```

## License

Xem [LICENSE](./LICENSE).
