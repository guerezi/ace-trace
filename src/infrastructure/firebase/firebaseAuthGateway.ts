import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { AuthGateway, AuthUser } from "../../application/auth/AuthGateway";
import { getFirebaseAuthOrNull } from "./firebaseClient";

const buildGuestUser = (): AuthUser => ({
  uid: "offline-guest",
  isAnonymous: true,
  email: null,
});

export class FirebaseAuthGateway implements AuthGateway {
  subscribeAuthState(callback: (user: AuthUser | null) => void): () => void {
    const auth = getFirebaseAuthOrNull();

    if (!auth) {
      callback(buildGuestUser());
      return () => undefined;
    }

    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        callback(null);
        return;
      }

      callback({
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous,
      });
    });
  }

  async signInAnonymouslyIfNeeded(): Promise<void> {
    const auth = getFirebaseAuthOrNull();
    if (!auth || auth.currentUser) {
      return;
    }

    await signInAnonymously(auth);
  }

  async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<void> {
    const auth = getFirebaseAuthOrNull();
    if (!auth) {
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);
  }

  async signUpWithEmailPassword(
    email: string,
    password: string
  ): Promise<void> {
    const auth = getFirebaseAuthOrNull();
    if (!auth) {
      return;
    }

    await createUserWithEmailAndPassword(auth, email, password);
  }

  async sendPasswordReset(email: string): Promise<void> {
    const auth = getFirebaseAuthOrNull();
    if (!auth) {
      return;
    }

    await sendPasswordResetEmail(auth, email);
  }

  async deleteCurrentUser(): Promise<void> {
    const auth = getFirebaseAuthOrNull();
    if (!auth || !auth.currentUser) {
      return;
    }

    await deleteUser(auth.currentUser);
  }

  async signOut(): Promise<void> {
    const auth = getFirebaseAuthOrNull();
    if (!auth) {
      return;
    }

    await signOut(auth);
  }
}
