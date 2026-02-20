export const mapFirebaseAuthError = (error: unknown): string => {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  if (!code) {
    return "Authentication failed. Please try again.";
  }

  switch (code) {
    case "auth/invalid-email":
      return "Invalid email format.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "This email is already in use.";
    case "auth/weak-password":
      return "Password must contain at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and retry.";
    case "auth/network-request-failed":
      return "Network error. Check connection and retry.";
    case "auth/requires-recent-login":
      return "Please sign out and sign in again before deleting your account.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    default:
      return "Authentication failed. Please try again.";
  }
};
