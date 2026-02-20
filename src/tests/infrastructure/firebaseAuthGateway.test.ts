import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  signInAnonymously: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  deleteUser: vi.fn(),
  signOutFn: vi.fn(),
  getFirebaseAuthOrNull: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
  signInAnonymously: mocks.signInAnonymously,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  deleteUser: mocks.deleteUser,
  signOut: mocks.signOutFn,
}));

vi.mock("../../infrastructure/firebase/firebaseClient", () => ({
  getFirebaseAuthOrNull: mocks.getFirebaseAuthOrNull,
}));

import { FirebaseAuthGateway } from "../../infrastructure/firebase/firebaseAuthGateway";

describe("FirebaseAuthGateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to guest user when firebase is not configured", () => {
    mocks.getFirebaseAuthOrNull.mockReturnValue(null);
    const callback = vi.fn();

    const gateway = new FirebaseAuthGateway();
    const unsubscribe = gateway.subscribeAuthState(callback);

    expect(callback).toHaveBeenCalledWith({
      uid: "offline-guest",
      isAnonymous: true,
      email: null,
    });
    expect(typeof unsubscribe).toBe("function");
  });

  it("forwards sign-in calls to firebase auth methods", async () => {
    const currentUser = { uid: "user-1" };
    const fakeAuth = { currentUser: null as null | { uid: string } };
    mocks.getFirebaseAuthOrNull.mockReturnValue(fakeAuth);

    const gateway = new FirebaseAuthGateway();

    await gateway.signInAnonymouslyIfNeeded();
    await gateway.signInWithEmailPassword("coach@club.com", "secret");
    await gateway.signUpWithEmailPassword("new@club.com", "secret");
    await gateway.sendPasswordReset("coach@club.com");
    fakeAuth.currentUser = currentUser;
    await gateway.deleteCurrentUser();
    await gateway.signOut();

    expect(mocks.signInAnonymously).toHaveBeenCalledWith(fakeAuth);
    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      fakeAuth,
      "coach@club.com",
      "secret"
    );
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      fakeAuth,
      "new@club.com",
      "secret"
    );
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(
      fakeAuth,
      "coach@club.com"
    );
    expect(mocks.deleteUser).toHaveBeenCalledWith(currentUser);
    expect(mocks.signOutFn).toHaveBeenCalledWith(fakeAuth);
  });
});
