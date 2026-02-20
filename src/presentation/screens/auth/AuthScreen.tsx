import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { AuthUser } from "../../../application/auth/AuthGateway";
import { PrimaryButton } from "../../components/PrimaryButton";

type AuthMode = "login" | "signup" | "forgot-password" | "profile";

interface AuthScreenProps {
  user: AuthUser | null;
  playerMatches: Array<{
    id: string;
    scoreSummary: string;
    durationSeconds: number;
    status: "LIVE" | "FINISHED";
    p1Name: string;
    p2Name: string;
  }>;
  onBack: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  user,
  playerMatches,
  onBack,
  onLogin,
  onSignup,
  onResetPassword,
  onDeleteAccount,
  onLogout,
}) => {
  const isDark = useColorScheme() === "dark";
  const [mode, setMode] = useState<AuthMode>(
    user && !user.isAnonymous ? "profile" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      setMessage(null);
      await onLogin(email.trim(), password);
      onBack();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to sign in.";
      setError(message);
    }
  };

  const handleSignup = async () => {
    try {
      setError(null);
      setMessage(null);
      await onSignup(email.trim(), password);
      onBack();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to sign up.";
      setError(message);
    }
  };

  const handleResetPassword = async () => {
    try {
      setError(null);
      setMessage(null);
      await onResetPassword(email.trim());
      setMessage("Password reset email sent. Check your inbox.");
      setMode("login");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to send reset email.";
      setError(message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setError(null);
      setMessage(null);
      await onDeleteAccount();
      onBack();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to delete account.";
      setError(message);
    }
  };

  const handleLogout = async () => {
    try {
      setError(null);
      setMessage(null);
      await onLogout();
      onBack();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to sign out.";
      setError(message);
    }
  };

  if (mode === "profile") {
    return (
      <View style={[styles.container, isDark ? styles.containerDark : null]}>
        <ScrollView contentContainerStyle={styles.profileContent}>
          <View style={styles.content}>
            <Text style={[styles.title, isDark ? styles.titleDark : null]}>
              Your Profile
            </Text>
            <Text
              style={[styles.subtitle, isDark ? styles.subtitleDark : null]}
            >
              Logged in as {user?.email ?? "Unknown"}
            </Text>

            <View style={[styles.card, isDark ? styles.cardDark : null]}>
              <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                Your Match History
              </Text>
              {playerMatches.length === 0 ? (
                <Text
                  style={[
                    styles.emptyHistoryText,
                    isDark ? styles.emptyHistoryTextDark : null,
                  ]}
                >
                  No recent matches yet.
                </Text>
              ) : (
                <View style={styles.historyList}>
                  {playerMatches.slice(0, 8).map((match) => (
                    <View
                      key={match.id}
                      style={[
                        styles.historyCard,
                        isDark ? styles.historyCardDark : null,
                      ]}
                    >
                      <View style={styles.historyTopRow}>
                        <Text
                          style={[
                            styles.historyPlayers,
                            isDark ? styles.historyPlayersDark : null,
                          ]}
                        >
                          {match.p1Name} vs {match.p2Name}
                        </Text>
                        <Text
                          style={[
                            styles.historyStatus,
                            match.status === "LIVE"
                              ? styles.historyStatusLive
                              : styles.historyStatusFinished,
                          ]}
                        >
                          {match.status}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.historyScore,
                          isDark ? styles.historyScoreDark : null,
                        ]}
                      >
                        {match.scoreSummary}
                      </Text>
                      <Text
                        style={[
                          styles.historyMeta,
                          isDark ? styles.historyMetaDark : null,
                        ]}
                      >
                        Duration: {Math.floor(match.durationSeconds / 60)}m
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <PrimaryButton
                label="Log Out"
                onPress={handleLogout}
                style={styles.primaryAction}
              />
              <PrimaryButton
                label="Delete Account"
                onPress={handleDeleteAccount}
                style={styles.logoutAction}
              />

              {error ? (
                <Text style={[styles.error, isDark ? styles.errorDark : null]}>
                  {error}
                </Text>
              ) : null}
            </View>

            <PrimaryButton
              label="Back"
              onPress={onBack}
              style={styles.backAction}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark ? styles.containerDark : null]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDark ? styles.titleDark : null]}>
          Authentication
        </Text>
        <Text style={[styles.subtitle, isDark ? styles.subtitleDark : null]}>
          Use email auth to sync across devices.
        </Text>

        <View style={styles.modeRow}>
          <Pressable
            onPress={() => {
              setError(null);
              setMessage(null);
              setMode("login");
            }}
          >
            <Text
              style={[
                styles.modeChip,
                isDark ? styles.modeChipDark : null,
                mode === "login" ? styles.modeChipActive : null,
              ]}
            >
              Sign In
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setError(null);
              setMessage(null);
              setMode("signup");
            }}
          >
            <Text
              style={[
                styles.modeChip,
                isDark ? styles.modeChipDark : null,
                mode === "signup" ? styles.modeChipActive : null,
              ]}
            >
              Sign Up
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setError(null);
              setMessage(null);
              setMode("forgot-password");
            }}
          >
            <Text
              style={[
                styles.modeChip,
                isDark ? styles.modeChipDark : null,
                mode === "forgot-password" ? styles.modeChipActive : null,
              ]}
            >
              Reset
            </Text>
          </Pressable>
        </View>

        <View style={[styles.card, isDark ? styles.cardDark : null]}>
          <Text style={[styles.label, isDark ? styles.labelDark : null]}>
            Email
          </Text>
          <TextInput
            style={[styles.input, isDark ? styles.inputDark : null]}
            value={email}
            onChangeText={setEmail}
            placeholder="name@club.com"
            placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {mode !== "forgot-password" ? (
            <>
              <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                Password
              </Text>
              <TextInput
                style={[styles.input, isDark ? styles.inputDark : null]}
                value={password}
                onChangeText={setPassword}
                placeholder="******"
                placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
                secureTextEntry
              />
            </>
          ) : null}

          {error ? (
            <Text style={[styles.error, isDark ? styles.errorDark : null]}>
              {error}
            </Text>
          ) : null}
          {message ? (
            <Text style={[styles.message, isDark ? styles.messageDark : null]}>
              {message}
            </Text>
          ) : null}

          {mode === "login" ? (
            <View style={styles.actions}>
              <PrimaryButton
                label="Sign In"
                onPress={handleLogin}
                style={styles.primaryAction}
              />
              <PrimaryButton
                label="Sign Up"
                onPress={() => {
                  setError(null);
                  setMode("signup");
                }}
                style={styles.secondaryAction}
              />
            </View>
          ) : null}

          {mode === "signup" ? (
            <View style={styles.actions}>
              <PrimaryButton
                label="Create"
                onPress={handleSignup}
                style={styles.primaryAction}
              />
              <PrimaryButton
                label="Back to Sign In"
                onPress={() => {
                  setError(null);
                  setMode("login");
                }}
                style={styles.secondaryAction}
              />
            </View>
          ) : null}

          {mode === "forgot-password" ? (
            <View style={styles.actions}>
              <PrimaryButton
                label="Send Reset"
                onPress={handleResetPassword}
                style={styles.primaryAction}
              />
              <PrimaryButton
                label="Back to Sign In"
                onPress={() => {
                  setError(null);
                  setMode("login");
                }}
                style={styles.secondaryAction}
              />
            </View>
          ) : null}

          {mode === "login" ? (
            <PrimaryButton
              label="Forgot Password"
              onPress={() => {
                setError(null);
                setMode("forgot-password");
              }}
              style={styles.backAction}
            />
          ) : null}
        </View>

        <PrimaryButton
          label="Back"
          onPress={onBack}
          style={styles.backAction}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F5F9",
    flex: 1,
    padding: 16,
  },
  containerDark: {
    backgroundColor: "#090714",
  },
  content: {
    alignSelf: "center",
    gap: 10,
    maxWidth: 560,
    width: "100%",
  },
  profileContent: {
    alignItems: "center",
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: 4,
  },
  title: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "900",
  },
  titleDark: {
    color: "#F5F3FF",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 13,
  },
  subtitleDark: {
    color: "#C4B5FD",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  historyList: {
    gap: 6,
    marginBottom: 4,
  },
  historyCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
    padding: 8,
  },
  historyCardDark: {
    backgroundColor: "#261E44",
    borderColor: "#554584",
  },
  historyTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyPlayers: {
    color: "#0F172A",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    marginRight: 8,
  },
  historyPlayersDark: {
    color: "#F5F3FF",
  },
  historyStatus: {
    borderRadius: 999,
    fontSize: 9,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  historyStatusLive: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  historyStatusFinished: {
    backgroundColor: "#E2E8F0",
    color: "#334155",
  },
  historyScore: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
  },
  historyScoreDark: {
    color: "#F5F3FF",
  },
  historyMeta: {
    color: "#64748B",
    fontSize: 11,
  },
  historyMetaDark: {
    color: "#C4B5FD",
  },
  emptyHistoryText: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 6,
  },
  emptyHistoryTextDark: {
    color: "#C4B5FD",
  },
  cardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  modeRow: {
    flexDirection: "row",
    gap: 6,
  },
  modeChip: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  modeChipDark: {
    backgroundColor: "#2A1F47",
    color: "#DDD6FE",
  },
  modeChipActive: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
  },
  label: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  labelDark: {
    color: "#E9D5FF",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#0F172A",
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputDark: {
    backgroundColor: "#261E44",
    borderColor: "#554584",
    color: "#F5F3FF",
  },
  error: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
  },
  errorDark: {
    color: "#FCA5A5",
  },
  message: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "600",
  },
  messageDark: {
    color: "#86EFAC",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  primaryAction: {
    backgroundColor: "#0F172A",
    flex: 1,
  },
  secondaryAction: {
    backgroundColor: "#334155",
    flex: 1,
  },
  logoutAction: {
    backgroundColor: "#B91C1C",
    marginTop: 4,
  },
  backAction: {
    backgroundColor: "#475569",
  },
});
