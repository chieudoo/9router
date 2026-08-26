<div align="center">
  <img src="./public/xproxy-mark.svg" alt="XProxy" width="96" />

  # XProxy

  **A local AI gateway for coding agents and AI providers.**

  [English](./README.md) | [Tieng Viet](./README.vi.md)
</div>

## Overview

XProxy exposes one OpenAI-compatible endpoint and routes requests to configured AI providers. It provides a local dashboard for provider credentials, API keys, usage, request details, CLI tool setup, fallbacks, and token-saving controls.

## Features

- One endpoint for Claude Code, Codex, Cursor, Cline, OpenCode, OpenClaw, and other compatible tools
- Provider routing, model aliases, multi-account rotation, and fallback
- OpenAI, Claude, Gemini, Responses API, and provider-specific format translation
- OAuth and API-key credential management with token refresh and quota tracking
- Usage, request details, cached-token accounting, and pricing estimates
- RTK tool-output compression, optional Headroom context compression, Caveman, and Ponytail prompts
- Optional Cloudflare Tunnel, Tailscale, MITM, and outbound proxy support

## Requirements

- Node.js 22.5.0 or later
- npm

## Run From Source

```bash
git clone https://github.com/chieudoo/xproxy.git xproxy
cd xproxy
cp .env.example .env
npm install
npm run dev
```

Set `PORT` in `.env` before starting. The default local configuration uses:

```env
PORT=20127
```

Open the dashboard at `http://localhost:20127/dashboard` and use the API at `http://localhost:20127/v1`.

For production:

```bash
npm run build
npm run start
```

## Docker

The published image remains `chieudoo/9router`.

```bash
docker run -d --name xproxy \
  -p 20127:20127 \
  -v xproxy-data:/app/data \
  -e PORT=20127 \
  chieudoo/9router:latest
```

See [DOCKER.md](./DOCKER.md) for Docker Compose and persistent-storage details.

## Quick Setup

1. Open **Dashboard > Providers** and connect an upstream provider.
2. Open **Dashboard > Endpoint & Key** and create or copy an API key.
3. Configure your tool with:

```text
Base URL: http://localhost:20127/v1
API key:  Your XProxy API key
Model:    provider/model
```

The exact configuration for supported tools is available in **Dashboard > CLI Tools**.

## Token Saver

XProxy applies enabled token savers to the final upstream request:

- **RTK** compresses large structured tool outputs such as git diffs, grep results, directory listings, build output, and repeated logs.
- **Headroom** optionally sends message history to a configured `/v1/compress` service. It fails open if unavailable.
- **Caveman** injects a terse-response system instruction.
- **Ponytail** injects a minimal-code system instruction.

Disable every saver for one request with:

```http
x-xproxy-token-saver: off
```

## Request Logs And Privacy

`ENABLE_REQUEST_LOGS=true` writes full request and response traces beneath `logs/` and enables request-detail retention in the dashboard. These logs can include prompts, responses, cookies, and API credentials. Enable it only while debugging and protect or remove the generated files afterwards.

## Configuration

Copy `.env.example` to `.env`. Frequently used variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port used by the dashboard and API |
| `DATA_DIR` | Persistent database and application-data directory |
| `ENABLE_REQUEST_LOGS` | Enable detailed local request/response logs |
| `LOG_LEVEL` | Console verbosity: `debug`, `info`, `warn`, or `error` |
| `HOSTNAME` | Bind host for the production server |

## Development

```bash
npm run dev
npm run build
npx vitest run --exclude ".next/**"
```

## License

See [LICENSE](./LICENSE).
