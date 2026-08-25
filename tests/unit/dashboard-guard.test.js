import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  nextResponse: Symbol("next"),
  jsonResponse: vi.fn((body, init) => ({ status: init?.status || 200, body })),
  validateApiKey: vi.fn(),
  getConsistentMachineId: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => mocks.nextResponse),
    json: mocks.jsonResponse,
    redirect: vi.fn((url) => ({ status: 307, url })),
  },
}));

vi.mock("@/lib/localDb", () => ({ validateApiKey: mocks.validateApiKey }));
vi.mock("@/shared/utils/machineId", () => ({ getConsistentMachineId: mocks.getConsistentMachineId }));

const { proxy, __test__ } = await import("../../src/dashboardGuard.js");
const PEER_TOKEN = "peer-token-fixture";

function request(pathname, headers = {}) {
  return {
    nextUrl: { pathname, searchParams: new URL(`http://localhost${pathname}`).searchParams },
    headers: new Headers(headers),
    url: `http://localhost${pathname}`,
  };
}

function localRequest(pathname, headers = {}) {
  return request(pathname, { "x-9r-peer-token": PEER_TOKEN, "x-9r-real-ip": "127.0.0.1", ...headers });
}

describe("dashboard guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NINEROUTER_PEER_TOKEN = PEER_TOKEN;
    mocks.validateApiKey.mockResolvedValue(false);
    mocks.getConsistentMachineId.mockResolvedValue("cli-token");
  });

  it("allows the open dashboard", async () => {
    expect(await proxy(request("/dashboard", { host: "router.example.com" }))).toBe(mocks.nextResponse);
  });

  it("requires an API key for remote LLM API access", async () => {
    const response = await proxy(request("/v1/chat/completions", { host: "router.example.com" }));
    expect(response.status).toBe(401);
  });

  it("allows remote LLM API access with a valid key", async () => {
    mocks.validateApiKey.mockResolvedValue(true);
    expect(await proxy(request("/v1/chat/completions", { authorization: "Bearer sk-valid" }))).toBe(mocks.nextResponse);
  });

  it("allows local-only routes from loopback", async () => {
    expect(await proxy(localRequest("/api/mcp/filesystem/sse", { origin: "http://localhost:20128" }))).toBe(mocks.nextResponse);
  });

  it("rejects remote access to local-only routes", async () => {
    const response = await proxy(request("/api/mcp/filesystem/sse", { host: "router.example.com" }));
    expect(response.status).toBe(403);
  });

  it("extracts bearer API keys before other headers", () => {
    expect(__test__.extractApiKey(request("/v1/chat/completions", {
      authorization: "Bearer bearer-key",
      "x-api-key": "header-key",
    }))).toBe("bearer-key");
  });
});
