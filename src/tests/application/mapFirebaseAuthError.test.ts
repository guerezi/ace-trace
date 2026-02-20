import { describe, expect, it } from "vitest";
import { mapFirebaseAuthError } from "../../application/auth/mapFirebaseAuthError";

describe("mapFirebaseAuthError()", () => {
  it("maps known Firebase auth codes to user-friendly messages", () => {
    expect(mapFirebaseAuthError({ code: "auth/invalid-email" })).toBe(
      "Invalid email format."
    );
    expect(mapFirebaseAuthError({ code: "auth/wrong-password" })).toBe(
      "Invalid email or password."
    );
    expect(mapFirebaseAuthError({ code: "auth/email-already-in-use" })).toBe(
      "This email is already in use."
    );
  });

  it("falls back safely for unknown errors", () => {
    expect(mapFirebaseAuthError({ code: "auth/unknown" })).toBe(
      "Authentication failed. Please try again."
    );
    expect(mapFirebaseAuthError(undefined)).toBe(
      "Authentication failed. Please try again."
    );
  });
});
