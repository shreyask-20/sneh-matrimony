import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  verificationToken: {
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(async () => ({ id: "user-1" })),
}));

const makeRequest = (body: object) =>
  new Request("http://localhost/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findUnique.mockResolvedValue({ email: "priya@example.com", emailVerified: null });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.verificationToken.deleteMany.mockResolvedValue({});
  });

  it("returns 400 for missing OTP", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/5-digit/i);
  });

  it("returns 400 for non-numeric OTP", async () => {
    const res = await POST(makeRequest({ otp: "abcde" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when no token record exists", async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue(null);
    const res = await POST(makeRequest({ otp: "12345" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/no verification code/i);
  });

  it("returns 400 when OTP is expired", async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      token: "12345",
      identifier: "priya@example.com",
      expires: new Date(Date.now() - 1000), // already expired
    });
    const res = await POST(makeRequest({ otp: "12345" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/expired/i);
  });

  it("returns 400 when OTP is incorrect", async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      token: "99999",
      identifier: "priya@example.com",
      expires: new Date(Date.now() + 60000),
    });
    const res = await POST(makeRequest({ otp: "12345" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/incorrect/i);
  });

  it("returns 200 and marks email verified on correct OTP", async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      token: "12345",
      identifier: "priya@example.com",
      expires: new Date(Date.now() + 60000),
    });
    const res = await POST(makeRequest({ otp: "12345" }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({ emailVerified: expect.any(Date) }),
      })
    );
  });

  it("returns 400 when email is already verified", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      email: "priya@example.com",
      emailVerified: new Date(),
    });
    const res = await POST(makeRequest({ otp: "12345" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/already verified/i);
  });

  it("returns 401 when not authenticated", async () => {
    const { getToken } = await import("next-auth/jwt");
    vi.mocked(getToken).mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ otp: "12345" }));
    expect(res.status).toBe(401);
  });
});
