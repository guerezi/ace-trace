import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AuthUser } from "./src/application/auth/AuthGateway";
import { mapFirebaseAuthError } from "./src/application/auth/mapFirebaseAuthError";
import {
  LiveMatchSummary,
  MatchRealtimeData,
} from "./src/application/live-sync/LiveMatchGateway";
import { reconstructMatchState } from "./src/application/live-sync/reconstructMatchState";
import { DefaultMatchController } from "./src/application/match/MatchController";
import {
  MatchConfig,
  MatchState,
  PlayerId,
} from "./src/domain/match/entities/MatchTypes";
import { FirebaseAuthGateway } from "./src/infrastructure/firebase/firebaseAuthGateway";
import { FirebaseLiveMatchGateway } from "./src/infrastructure/firebase/firebaseLiveMatchGateway";
import { ConfirmDialog } from "./src/presentation/components/ConfirmDialog";
import { AuthScreen } from "./src/presentation/screens/auth/AuthScreen";
import { DashboardScreen } from "./src/presentation/screens/dashboard/DashboardScreen";
import { LandingScreen } from "./src/presentation/screens/landing/LandingScreen";
import { MatchScreen } from "./src/presentation/screens/MatchScreen";
import { SetupScreen } from "./src/presentation/screens/SetupScreen";
import { SpectatorScreen } from "./src/presentation/screens/spectator/SpectatorScreen";
import { DEFAULT_MATCH_CONFIG } from "./src/shared/defaultConfig";
import {
  addRecentClub,
  loadRecentClubs,
  removeRecentClub,
} from "./src/shared/recentClubsStorage";

type AppView =
  | "landing"
  | "dashboard"
  | "setup"
  | "match"
  | "spectator"
  | "auth";

const controller = new DefaultMatchController();
const liveGateway = new FirebaseLiveMatchGateway();
const authGateway = new FirebaseAuthGateway();

const createMatchId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const AppContent = (): React.JSX.Element => {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const [view, setView] = useState<AppView>("landing");
  const [topic, setTopic] = useState("");
  const [recentClubs, setRecentClubs] = useState<string[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [clubMatches, setClubMatches] = useState<LiveMatchSummary[]>([]);
  const [spectatingMatchId, setSpectatingMatchId] = useState<string | null>(
    null
  );
  const [spectatorSummary, setSpectatorSummary] =
    useState<LiveMatchSummary | null>(null);
  const [spectatorRealtime, setSpectatorRealtime] =
    useState<MatchRealtimeData | null>(null);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [refreshFeedKey, setRefreshFeedKey] = useState(0);
  const [pendingDeleteMatch, setPendingDeleteMatch] =
    useState<LiveMatchSummary | null>(null);
  const [lastConfig, setLastConfig] =
    useState<MatchConfig>(DEFAULT_MATCH_CONFIG);
  const [matchState, setMatchState] = useState<MatchState>(() =>
    controller.create(DEFAULT_MATCH_CONFIG)
  );

  useEffect(() => {
    const unsubscribe = authGateway.subscribeAuthState((user) => {
      setAuthUser(user);
    });

    authGateway.signInAnonymouslyIfNeeded().catch(() => undefined);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadRecentClubs()
      .then(setRecentClubs)
      .catch(() => setRecentClubs([]));
  }, []);

  useEffect(() => {
    setIsFeedLoading(true);
    setFeedError(null);

    const timeout = setTimeout(() => {
      setIsFeedLoading(false);
      setFeedError("Unable to load matches. Check connection and retry.");
    }, 7000);

    const unsubscribe = liveGateway.subscribeClubMatches(topic, (matches) => {
      clearTimeout(timeout);
      setClubMatches(matches);
      setIsFeedLoading(false);
      setFeedError(null);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [topic, refreshFeedKey]);

  useEffect(() => {
    if (!spectatingMatchId) {
      return;
    }

    const unsubscribeSummary = liveGateway.subscribeMatchSummary(
      topic,
      spectatingMatchId,
      (summary) => {
        setSpectatorSummary(summary);
      }
    );

    const unsubscribeRealtime = liveGateway.subscribeMatchRealtime(
      topic,
      spectatingMatchId,
      (realtime) => {
        setSpectatorRealtime(realtime);
      }
    );

    return () => {
      unsubscribeSummary();
      unsubscribeRealtime();
    };
  }, [spectatingMatchId, topic]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMatchState((previous) => controller.tick(previous));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (
      view !== "match" ||
      !matchState.matchId ||
      !authUser?.uid ||
      topic === "offline"
    ) {
      return;
    }

    liveGateway
      .syncMatch(topic, matchState.matchId, matchState, authUser.uid)
      .then(() => setSyncError(null))
      .catch(() => setSyncError("Live sync is temporarily unavailable."));
  }, [authUser?.uid, matchState, topic, view]);

  const onStartMatch = (config: MatchConfig): void => {
    const id = createMatchId();
    setLastConfig(config);
    setMatchState({
      ...controller.create(config),
      matchId: id,
    });
    setView("match");
  };

  const onConnectClub = async (topicInput: string): Promise<void> => {
    const normalized = topicInput.trim().toLowerCase();
    if (!normalized) {
      return;
    }

    setTopic(normalized);
    setView("dashboard");
    const nextRecents = await addRecentClub(normalized);
    setRecentClubs(nextRecents);
  };

  const onGoOffline = (): void => {
    setTopic("offline");
    setView("dashboard");
  };

  const onRemoveRecentClub = async (topicToRemove: string): Promise<void> => {
    const next = await removeRecentClub(topicToRemove);
    setRecentClubs(next);
  };

  const onScorePoint = (winner: PlayerId): void => {
    setMatchState((previous) => controller.scorePoint(previous, winner));
  };

  const onUndo = (): void => {
    setMatchState((previous) => controller.undo(previous));
  };

  const onTogglePause = (): void => {
    setMatchState((previous) => controller.togglePause(previous));
  };

  const onEndMatch = (): void => {
    if (matchState.matchId && topic !== "offline" && authUser?.uid) {
      liveGateway
        .endMatch(topic, matchState.matchId, authUser.uid)
        .catch(() => {
          setOperationError("Could not mark match as finished on cloud.");
        });
    }

    setMatchState(controller.create(lastConfig));
    setView("dashboard");
  };

  const onResumeMatch = async (summary: LiveMatchSummary): Promise<void> => {
    if (!authUser || summary.creatorUid !== authUser.uid) {
      setSpectatingMatchId(summary.id);
      setSpectatorSummary(summary);
      setView("spectator");
      return;
    }

    try {
      setOperationError(null);
      const data = await liveGateway.fetchMatch(topic, summary.id);
      if (!data) {
        setOperationError("Could not resume this match. It may have expired.");
        return;
      }

      const resumedState: MatchState = {
        ...reconstructMatchState(
          data.summary,
          data.realtime,
          DEFAULT_MATCH_CONFIG
        ),
      };

      setLastConfig(resumedState.config);
      setMatchState(resumedState);
      setView("match");
    } catch {
      setOperationError("Could not resume this match. Please retry.");
    }
  };

  const onDeleteMatch = async (summary: LiveMatchSummary): Promise<void> => {
    if (!authUser || summary.creatorUid !== authUser.uid) {
      setOperationError("Only match owner can delete this match.");
      return;
    }

    setPendingDeleteMatch(summary);
  };

  const onConfirmDeleteMatch = async (): Promise<void> => {
    if (!pendingDeleteMatch || !authUser?.uid) {
      setPendingDeleteMatch(null);
      return;
    }

    try {
      await liveGateway.deleteMatch(topic, pendingDeleteMatch.id, authUser.uid);
      setOperationError(null);
    } catch {
      setOperationError("Failed to delete match. Retry in a moment.");
    } finally {
      setPendingDeleteMatch(null);
    }
  };

  const onSaveSettings = (config: MatchConfig): void => {
    setLastConfig(config);
    setMatchState((previous) => ({
      ...previous,
      config,
    }));
  };

  const spectatorState = useMemo<MatchState | null>(() => {
    if (!spectatorSummary) {
      return null;
    }

    return reconstructMatchState(
      spectatorSummary,
      spectatorRealtime,
      DEFAULT_MATCH_CONFIG
    );
  }, [spectatorRealtime, spectatorSummary]);

  const playerMatches = useMemo(() => {
    if (!authUser?.uid) {
      return [];
    }

    return clubMatches.filter((match) => match.creatorUid === authUser.uid);
  }, [authUser?.uid, clubMatches]);

  const onShareClub = async (): Promise<void> => {
    if (!topic || topic === "offline") {
      return;
    }

    const clubPath = `?topic=${topic}`;
    const baseUrl =
      Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "https://acetrace.live/";
    const shareUrl = `${baseUrl}${clubPath}`;

    await Share.share({
      message: `Join my club live feed: ${shareUrl}`,
      url: shareUrl,
      title: "Share Club",
    });
  };

  const content = useMemo(() => {
    if (view === "landing") {
      return (
        <LandingScreen
          recentClubs={recentClubs}
          userEmail={authUser?.email ?? null}
          isAuthenticated={Boolean(authUser && !authUser.isAnonymous)}
          onConnectClub={(club) => {
            void onConnectClub(club);
          }}
          onRemoveRecentClub={(club) => {
            void onRemoveRecentClub(club);
          }}
          onOffline={onGoOffline}
          onAuth={() => setView("auth")}
        />
      );
    }

    if (view === "setup") {
      return (
        <SetupScreen initialConfig={lastConfig} onStartMatch={onStartMatch} />
      );
    }

    if (view === "dashboard") {
      return (
        <DashboardScreen
          topic={topic}
          matches={clubMatches}
          authUserId={authUser?.uid ?? null}
          isAuthenticated={Boolean(authUser && !authUser.isAnonymous)}
          userEmail={authUser?.email ?? null}
          loading={isFeedLoading}
          errorMessage={feedError}
          onRetry={() => setRefreshFeedKey((value) => value + 1)}
          onShareClub={() => {
            void onShareClub();
          }}
          onGoToAuth={() => setView("auth")}
          onSwitchClub={() => setView("landing")}
          onStartSetup={() => setView("setup")}
          onWatchMatch={onResumeMatch}
          onDeleteMatch={onDeleteMatch}
        />
      );
    }

    if (view === "spectator" && spectatorState) {
      return (
        <SpectatorScreen
          state={spectatorState}
          onBack={() => setView("dashboard")}
        />
      );
    }

    if (view === "auth") {
      return (
        <AuthScreen
          user={authUser}
          playerMatches={playerMatches}
          onBack={() => setView(topic ? "dashboard" : "landing")}
          onLogin={async (email, password) => {
            try {
              setOperationError(null);
              await authGateway.signInWithEmailPassword(email, password);
            } catch (error) {
              const message = mapFirebaseAuthError(error);
              setOperationError(message);
              throw new Error(message);
            }
          }}
          onSignup={async (email, password) => {
            try {
              setOperationError(null);
              await authGateway.signUpWithEmailPassword(email, password);
            } catch (error) {
              const message = mapFirebaseAuthError(error);
              setOperationError(message);
              throw new Error(message);
            }
          }}
          onResetPassword={async (email) => {
            try {
              setOperationError(null);
              await authGateway.sendPasswordReset(email);
            } catch (error) {
              const message = mapFirebaseAuthError(error);
              setOperationError(message);
              throw new Error(message);
            }
          }}
          onDeleteAccount={async () => {
            try {
              setOperationError(null);
              await authGateway.deleteCurrentUser();
            } catch (error) {
              const message = mapFirebaseAuthError(error);
              setOperationError(message);
              throw new Error(message);
            }
          }}
          onLogout={async () => {
            try {
              setOperationError(null);
              await authGateway.signOut();
            } catch (error) {
              const message = mapFirebaseAuthError(error);
              setOperationError(message);
              throw new Error(message);
            }
          }}
        />
      );
    }

    return (
      <MatchScreen
        state={matchState}
        onScorePoint={onScorePoint}
        onUndo={onUndo}
        onTogglePause={onTogglePause}
        onEndMatch={onEndMatch}
        onBackToDashboard={() => setView("dashboard")}
        onSaveSettings={onSaveSettings}
      />
    );
  }, [
    feedError,
    authUser,
    clubMatches,
    isFeedLoading,
    lastConfig,
    matchState,
    onTogglePause,
    onDeleteMatch,
    onResumeMatch,
    spectatorState,
    playerMatches,
    recentClubs,
    topic,
    view,
  ]);

  return (
    <View
      style={[
        styles.safeArea,
        isDark ? styles.safeAreaDark : null,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#090714" : "#F1F5F9"}
      />
      {syncError || operationError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            {operationError ?? syncError}
          </Text>
          <View style={styles.errorActions}>
            <Pressable onPress={() => setRefreshFeedKey((value) => value + 1)}>
              <Text style={styles.errorActionLabel}>Retry</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setSyncError(null);
                setOperationError(null);
              }}
            >
              <Text style={styles.errorActionLabel}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      {content}
      <ConfirmDialog
        visible={Boolean(pendingDeleteMatch)}
        title="Delete match"
        message="This action cannot be undone. Are you sure you want to permanently delete this match?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setPendingDeleteMatch(null)}
        onConfirm={onConfirmDeleteMatch}
      />
    </View>
  );
};

const App = (): React.JSX.Element => (
  <SafeAreaProvider>
    <AppContent />
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F1F5F9",
    flex: 1,
  },
  safeAreaDark: {
    backgroundColor: "#090714",
  },
  errorBanner: {
    backgroundColor: "#7F1D1D",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: "100%",
  },
  errorBannerText: {
    color: "#FEE2E2",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    marginRight: 8,
  },
  errorActions: {
    flexDirection: "row",
    gap: 12,
  },
  errorActionLabel: {
    color: "#FECACA",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});

export default App;
