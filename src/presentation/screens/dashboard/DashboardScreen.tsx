import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { LiveMatchSummary } from "../../../application/live-sync/LiveMatchGateway";
import { PlayerId } from "../../../domain/match/entities/MatchTypes";
import { resolvePlayerColorTheme } from "../../../shared/playerColors";
import { PrimaryButton } from "../../components/PrimaryButton";

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
};

const getVisibleDuration = (match: LiveMatchSummary, now: number): number => {
  if (match.status !== "LIVE" || match.isPaused || !match.startTime) {
    return Math.max(0, match.durationSeconds);
  }

  const elapsed = Math.max(0, Math.floor((now - match.startTime) / 1000));
  return Math.max(match.durationSeconds, elapsed);
};

interface DashboardScreenProps {
  topic: string;
  matches: LiveMatchSummary[];
  authUserId: string | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  loading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onShareClub: () => void;
  onGoToAuth: () => void;
  onSwitchClub: () => void;
  onStartSetup: () => void;
  onWatchMatch: (match: LiveMatchSummary) => void;
  onDeleteMatch: (match: LiveMatchSummary) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  topic,
  matches,
  authUserId,
  isAuthenticated,
  userEmail,
  loading,
  errorMessage,
  onRetry,
  onShareClub,
  onGoToAuth,
  onSwitchClub,
  onStartSetup,
  onWatchMatch,
  onDeleteMatch,
}) => {
  const isDark = useColorScheme() === "dark";
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.container, isDark ? styles.containerDark : null]}>
      <View style={styles.content}>
        <View
          style={[styles.headerCard, isDark ? styles.headerCardDark : null]}
        >
          <View style={styles.headerRowTop}>
            <View style={styles.headerLeftCol}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, isDark ? styles.titleDark : null]}>
                  {topic === "offline" ? "OFFLINE MODE" : topic.toUpperCase()}
                </Text>
                {topic !== "offline" ? (
                  <Pressable onPress={onShareClub} style={styles.shareAction}>
                    <Ionicons
                      name="share-social-outline"
                      size={15}
                      color={isDark ? "#C4B5FD" : "#64748B"}
                    />
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.subRow}>
                {topic !== "offline" ? (
                  <>
                    <View style={styles.liveDot} />
                    <Text
                      style={[
                        styles.feedLabel,
                        isDark ? styles.feedLabelDark : null,
                      ]}
                    >
                      LIVE FEED
                    </Text>
                  </>
                ) : (
                  <Text
                    style={[
                      styles.feedLabel,
                      isDark ? styles.feedLabelDark : null,
                    ]}
                  >
                    No internet required
                  </Text>
                )}
                <Pressable onPress={onSwitchClub}>
                  <Text
                    style={[
                      styles.switchLink,
                      isDark ? styles.switchLinkDark : null,
                    ]}
                  >
                    {topic === "offline" ? "Go Online" : "Switch Club"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.headerSpacer} />

            <View style={styles.headerActionsCompact}>
              <Pressable
                onPress={onGoToAuth}
                style={[
                  styles.authIconButton,
                  isDark ? styles.authIconButtonDark : null,
                ]}
              >
                {isAuthenticated ? (
                  <Text
                    style={[
                      styles.authInitial,
                      isDark ? styles.authInitialDark : null,
                    ]}
                  >
                    {userEmail?.charAt(0).toUpperCase() ?? "U"}
                  </Text>
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={20}
                    color={isDark ? "#E9D5FF" : "#334155"}
                  />
                )}
              </Pressable>
              <PrimaryButton
                label="New Match"
                onPress={onStartSetup}
                style={styles.primaryButton}
              />
            </View>
          </View>
        </View>

        <Text
          style={[styles.sectionTitle, isDark ? styles.sectionTitleDark : null]}
        >
          Live / Recent Matches
        </Text>

        {errorMessage ? (
          <View
            style={[styles.errorCard, isDark ? styles.errorCardDark : null]}
          >
            <Text
              style={[styles.errorText, isDark ? styles.errorTextDark : null]}
            >
              {errorMessage}
            </Text>
            <PrimaryButton
              label="Retry"
              onPress={onRetry}
              style={styles.retryButton}
            />
          </View>
        ) : null}

        {loading ? (
          <View
            style={[styles.loadingCard, isDark ? styles.loadingCardDark : null]}
          >
            <Text
              style={[
                styles.loadingText,
                isDark ? styles.loadingTextDark : null,
              ]}
            >
              Loading matches...
            </Text>
          </View>
        ) : null}

        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, isDark ? styles.emptyDark : null]}>
              No matches yet for this topic.
            </Text>
          }
          renderItem={({ item }) => {
            const duration = getVisibleDuration(item, now);
            const p1Color = resolvePlayerColorTheme(item.p1Color, "blue").solid;
            const p2Color = resolvePlayerColorTheme(item.p2Color, "red").solid;

            return (
              <Pressable
                style={[styles.matchCard, isDark ? styles.matchCardDark : null]}
                onPress={() => onWatchMatch(item)}
              >
                <View style={styles.rowBetweenTop}>
                  <View style={styles.chipsRow}>
                    {item.status === "LIVE" ? (
                      <View style={styles.liveBadge}>
                        <Ionicons name="eye-outline" size={9} color="#FFFFFF" />
                        <Text style={styles.liveBadgeText}>LIVE</Text>
                      </View>
                    ) : null}
                    <Text
                      style={[
                        styles.modeChip,
                        isDark ? styles.modeChipDark : null,
                      ]}
                    >
                      {item.isDoubles ? "DOUBLES" : "SINGLES"}
                    </Text>
                  </View>

                  <View style={styles.metaRightRow}>
                    <Text
                      style={[
                        styles.timerMeta,
                        isDark ? styles.timerMetaDark : null,
                      ]}
                    >
                      {formatDuration(duration)}
                    </Text>
                    {item.creatorUid === authUserId ? (
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          onDeleteMatch(item);
                        }}
                        style={styles.deleteIconAction}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={14}
                          color={isDark ? "#FCA5A5" : "#991B1B"}
                        />
                      </Pressable>
                    ) : null}
                  </View>
                </View>

                <View style={styles.rowBetweenBottom}>
                  <View style={styles.playersColumn}>
                    <View style={styles.playerLine}>
                      <View
                        style={[
                          styles.playerColorIndicator,
                          { backgroundColor: p1Color },
                        ]}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.playerName,
                          isDark ? styles.playerNameDark : null,
                        ]}
                      >
                        {item.p1Name}
                      </Text>
                      {item.status === "LIVE" && item.server === PlayerId.P1 ? (
                        <View style={styles.serverDot} />
                      ) : null}
                    </View>
                    <View style={styles.playerLine}>
                      <View
                        style={[
                          styles.playerColorIndicator,
                          { backgroundColor: p2Color },
                        ]}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.playerName,
                          isDark ? styles.playerNameDark : null,
                        ]}
                      >
                        {item.p2Name}
                      </Text>
                      {item.status === "LIVE" && item.server === PlayerId.P2 ? (
                        <View style={styles.serverDot} />
                      ) : null}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.scoreText,
                      isDark ? styles.scoreTextDark : null,
                    ]}
                  >
                    {item.scoreSummary}
                  </Text>
                </View>

                {item.creatorUid === authUserId ? (
                  <View
                    style={[
                      styles.ownerFooter,
                      isDark ? styles.ownerFooterDark : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ownerFooterText,
                        isDark ? styles.ownerFooterTextDark : null,
                      ]}
                    >
                      YOUR MATCH
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
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
    maxWidth: 980,
    width: "100%",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  headerCardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  title: {
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "900",
  },
  titleDark: {
    color: "#F5F3FF",
  },
  headerRowTop: {
    alignItems: "center",
    flexDirection: "row",
  },
  headerLeftCol: {
    gap: 4,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  subRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  headerSpacer: {
    flex: 1,
  },
  headerActionsCompact: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  shareAction: {
    alignItems: "center",
    borderRadius: 999,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  liveDot: {
    backgroundColor: "#10B981",
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  feedLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  feedLabelDark: {
    color: "#C4B5FD",
  },
  switchLink: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
    textTransform: "uppercase",
  },
  switchLinkDark: {
    color: "#93C5FD",
  },
  label: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  labelDark: {
    color: "#C4B5FD",
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
  primaryButton: {
    backgroundColor: "#0F172A",
    minWidth: 104,
  },
  authIconButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  authIconButtonDark: {
    backgroundColor: "#2A1F47",
    borderColor: "#554584",
  },
  authInitial: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "900",
  },
  authInitialDark: {
    color: "#E9D5FF",
  },
  sectionTitle: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  sectionTitleDark: {
    color: "#DDD6FE",
  },
  errorCard: {
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    padding: 10,
  },
  errorCardDark: {
    backgroundColor: "#3F1A2A",
    borderColor: "#7F1D1D",
  },
  errorText: {
    color: "#7F1D1D",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  errorTextDark: {
    color: "#FCA5A5",
  },
  retryButton: {
    backgroundColor: "#B91C1C",
    minWidth: 76,
    paddingVertical: 8,
  },
  loadingCard: {
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    marginBottom: 10,
    padding: 10,
  },
  loadingCardDark: {
    backgroundColor: "#2A1F47",
  },
  loadingText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  loadingTextDark: {
    color: "#DDD6FE",
  },
  list: {
    gap: 8,
    paddingBottom: 28,
  },
  empty: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
  },
  emptyDark: {
    color: "#C4B5FD",
  },
  matchCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  matchCardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  rowBetweenTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  rowBetweenBottom: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  chipsRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaRightRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  deleteIconAction: {
    alignItems: "center",
    borderRadius: 999,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  statusChip: {
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveBadge: {
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderRadius: 6,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  modeChip: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    color: "#334155",
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modeChipDark: {
    backgroundColor: "#2A1F47",
    color: "#DDD6FE",
  },
  liveChip: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  finishedChip: {
    backgroundColor: "#E2E8F0",
    color: "#334155",
  },
  finishedChipDark: {
    backgroundColor: "#2A1F47",
    color: "#DDD6FE",
  },
  timerMeta: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "800",
  },
  timerMetaDark: {
    color: "#DDD6FE",
  },
  playersColumn: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  playerLine: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
  playerColorIndicator: {
    borderRadius: 999,
    height: 12,
    width: 3,
  },
  playerName: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "900",
    maxWidth: "88%",
    textTransform: "uppercase",
  },
  playerNameDark: {
    color: "#F5F3FF",
  },
  serverDot: {
    backgroundColor: "#FACC15",
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  scoreText: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900",
  },
  scoreTextDark: {
    color: "#F5F3FF",
  },
  ownerFooter: {
    alignItems: "flex-end",
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 6,
  },
  ownerFooterDark: {
    borderTopColor: "#2A1F47",
  },
  ownerFooterText: {
    color: "#2563EB",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  ownerFooterTextDark: {
    color: "#93C5FD",
  },
});
