import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";

const prismaMock = vi.hoisted(() => ({
  user: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn(async () => "hashed-password"),
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    prismaMock.user.findFirst.mockReset();
    prismaMock.user.create.mockReset();
  });

  it("returns 400 when required fields are missing", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 409 when email or phone already exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: "user-1" });

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test User",
        email: "test@example.com",
        phone: "9999999999",
        password: "secret",
        gender: "Female",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBeDefined();
  });

  it("creates a user and returns 201", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    });

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test User",
        email: "test@example.com",
        phone: "9999999999",
        password: "secret",
        gender: "Female",
        preferredAgeRange: "24-29",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.user).toEqual({ id: "user-1", email: "test@example.com" });
    expect(prismaMock.user.create).toHaveBeenCalled();
  });
});
