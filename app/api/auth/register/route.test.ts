import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock Prisma
const prismaMock = vi.hoisted(() => ({
  user: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  verificationToken: {
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

// Mock bcrypt
vi.mock("bcryptjs", () => ({ hash: vi.fn(async () => "hashed-password") }));

// Mock email — prevents Resend from crashing without API key
vi.mock("@/lib/email", () => ({
  sendVerificationEmail: vi.fn(async () => {}),
}));

const validPhoto = {
  url: "https://res.cloudinary.com/dcfsgwac2/image/upload/v1/sneh-matrimony/profiles/photo.jpg",
  publicId: "sneh-matrimony/profiles/photo",
};

const validPayload = {
  fullName: "Priya Sharma",
  email: "priya@example.com",
  phone: "9876543210",
  password: "password123",
  gender: "Female",
  photos: [validPhoto],
};

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "user-1", email: "priya@example.com" });
    prismaMock.verificationToken.deleteMany.mockResolvedValue({});
    prismaMock.verificationToken.create.mockResolvedValue({});
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeDefined();
  });

  it("returns 400 for invalid email format", async () => {
    const res = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, email: "not-an-email" }),
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/email/i);
  });

  it("returns 400 for invalid phone number", async () => {
    const res = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, phone: "12345" }),
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/mobile/i);
  });

  it("returns 400 when password is too short", async () => {
    const res = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, password: "short" }),
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/8 characters/i);
  });

  it("returns 400 when no photos are provided", async () => {
    const res = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, photos: [] }),
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/photo/i);
  });

  it("returns 400 when photo URL is not from approved Cloudinary path", async () => {
    const res = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, photos: [{ url: "https://evil.com/photo.jpg" }] }),
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/approved upload flow/i);
  });

  // ── Conflict ─────────────────────────────────────────────────────────────────

  it("returns 409 when email or phone already exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: "existing-user" });
    const res = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/already registered/i);
  });

  // ── Success ───────────────────────────────────────────────────────────────────

  it("creates a user and returns 201 on valid payload", async () => {
    const res = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    }));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.user).toEqual({ id: "user-1", email: "priya@example.com" });
    expect(prismaMock.user.create).toHaveBeenCalledOnce();
  });

  it("still returns 201 even if sending verification email fails", async () => {
    const { sendVerificationEmail } = await import("@/lib/email");
    vi.mocked(sendVerificationEmail).mockRejectedValueOnce(new Error("SMTP error"));

    const res = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    }));
    expect(res.status).toBe(201);
  });
});
