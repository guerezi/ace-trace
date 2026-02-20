export interface AuthUser {
  uid: string;
  email?: string | null;
  isAnonymous: boolean;
}

export interface AuthGateway {
  subscribeAuthState(callback: (user: AuthUser | null) => void): () => void;
  signInAnonymouslyIfNeeded(): Promise<void>;
  signInWithEmailPassword(email: string, password: string): Promise<void>;
  signUpWithEmailPassword(email: string, password: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  deleteCurrentUser(): Promise<void>;
  signOut(): Promise<void>;
}
