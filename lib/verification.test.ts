import { describe, expect, it } from "vitest";
import { buildVerificationSummary } from "./verification";

describe("buildVerificationSummary", () => {
  it("returns no badges and pending label when nothing is verified", () => {
    const result = buildVerificationSummary({});
    expect(result.badges).toEqual([]);
    expect(result.tierLabel).toBe("Verification pending");
  });

  it("adds Email badge when emailVerified is set", () => {
    const result = buildVerificationSummary({ emailVerified: new Date() });
    expect(result.badges).toContain("Email");
    expect(result.tierLabel).toBe("Email verified");
  });

  it("adds Profile badge when isApproved is true", () => {
    const result = buildVerificationSummary({ isApproved: true });
    expect(result.badges).toContain("Profile");
    expect(result.tierLabel).toBe("Profile verified");
  });

  it("adds Photo badge when approvedPhotoCount > 0", () => {
    const result = buildVerificationSummary({ approvedPhotoCount: 2 });
    expect(result.badges).toContain("Photo");
    expect(result.tierLabel).toBe("Photo verified");
  });

  it("prioritises Video > ID > Photo > Email > Profile for tierLabel", () => {
    const result = buildVerificationSummary({
      isApproved: true,
      emailVerified: new Date(),
      approvedPhotoCount: 1,
      idVerified: true,
      videoVerified: true,
    });
    expect(result.tierLabel).toBe("Video verified");
    expect(result.badges).toEqual(
      expect.arrayContaining(["Profile", "Photo", "Email", "ID", "Video"])
    );
  });

  it("does not add Photo badge when approvedPhotoCount is 0", () => {
    const result = buildVerificationSummary({ approvedPhotoCount: 0 });
    expect(result.badges).not.toContain("Photo");
  });
});
