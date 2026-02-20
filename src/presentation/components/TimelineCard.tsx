import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { HistoryEvent, PlayerId } from "../../domain/match/entities/MatchTypes";
import { resolvePlayerColorTheme } from "../../shared/playerColors";

interface TimelineCardProps {
  events: HistoryEvent[];
  p1Color?: string;
  p2Color?: string;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  events,
  p1Color,
  p2Color,
}) => {
  const isDark = useColorScheme() === "dark";
  const p1Theme = resolvePlayerColorTheme(p1Color, "blue");
  const p2Theme = resolvePlayerColorTheme(p2Color, "red");
  const [isFullHistoryOpen, setIsFullHistoryOpen] = React.useState(false);
  const compactScrollRef = React.useRef<ScrollView | null>(null);

  const rounds: {
    gameIndex: number;
    setIndex: number;
    winner?: PlayerId;
    points: HistoryEvent[];
    gameScoreStr: string;
  }[] = [];

  let currentRound: HistoryEvent[] = [];
  let gameCounter = 0;
  let setCounter = 0;

  events.forEach((event) => {
    currentRound.push(event);

    if (
      event.type === "GAME_WIN" ||
      event.type === "SET_WIN" ||
      event.type === "MATCH_WIN"
    ) {
      const p1G = event.scoreSnapshot.games[PlayerId.P1];
      const p2G = event.scoreSnapshot.games[PlayerId.P2];

      rounds.push({
        gameIndex: gameCounter,
        setIndex: setCounter,
        winner: event.winnerId,
        points: [...currentRound],
        gameScoreStr: `${p1G}-${p2G}`,
      });

      gameCounter += 1;
      currentRound = [];

      if (event.type === "SET_WIN" || event.type === "MATCH_WIN") {
        setCounter += 1;
      }
    }
  });

  if (currentRound.length > 0) {
    const last = currentRound[currentRound.length - 1];
    rounds.push({
      gameIndex: gameCounter,
      setIndex: setCounter,
      winner: undefined,
      points: [...currentRound],
      gameScoreStr: `${last.scoreSnapshot.games[PlayerId.P1]}-${
        last.scoreSnapshot.games[PlayerId.P2]
      }`,
    });
  }

  const compactRounds = rounds;

  const roundsBySet = rounds.reduce<Record<number, typeof rounds>>(
    (acc, round) => {
      if (!acc[round.setIndex]) {
        acc[round.setIndex] = [];
      }
      acc[round.setIndex].push(round);
      return acc;
    },
    {}
  );

  React.useEffect(() => {
    if (!compactScrollRef.current) {
      return;
    }

    compactScrollRef.current.scrollToEnd({ animated: true });
  }, [events.length]);

  return (
    <View style={[styles.container, isDark ? styles.containerDark : null]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isDark ? styles.titleDark : null]}>
          Timeline
        </Text>
        <View style={styles.headerActions}>
          <Text style={[styles.count, isDark ? styles.countDark : null]}>
            {events.length} pts
          </Text>
          <Pressable
            onPress={() => setIsFullHistoryOpen(true)}
            style={[styles.historyIcon, isDark ? styles.historyIconDark : null]}
          >
            <Text
              style={[
                styles.historyIconText,
                isDark ? styles.historyIconTextDark : null,
              ]}
            >
              ⤢
            </Text>
          </Pressable>
        </View>
      </View>
      {compactRounds.length === 0 ? (
        <Text style={[styles.empty, isDark ? styles.emptyDark : null]}>
          No points yet.
        </Text>
      ) : (
        <ScrollView
          ref={compactScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContent}
        >
          {compactRounds.map((round, index) => (
            <View
              key={`compact-round-${round.setIndex}-${index}`}
              style={[
                styles.roundCard,
                styles.compactRoundCard,
                isDark ? styles.roundCardDark : null,
              ]}
            >
              <View style={styles.row}>
                <Text
                  style={[
                    styles.eventType,
                    isDark ? styles.eventTypeDark : null,
                  ]}
                >
                  G{round.gameIndex + 1}
                </Text>
                <Text
                  style={[styles.snapshot, isDark ? styles.snapshotDark : null]}
                >
                  {round.gameScoreStr}
                </Text>
              </View>
              <View style={styles.pointRow}>
                {round.points.map((point) => (
                  <View key={point.id} style={styles.pointWrap}>
                    <View
                      style={[
                        styles.pointDot,
                        {
                          backgroundColor:
                            point.winnerId === PlayerId.P1
                              ? p1Theme.solid
                              : p2Theme.solid,
                        },
                      ]}
                    />
                    {point.sideSwitchAfter ? (
                      <Text style={styles.switchBadge}>↺</Text>
                    ) : null}
                  </View>
                ))}
                {round.winner ? (
                  <Text
                    style={[
                      styles.winner,
                      {
                        backgroundColor:
                          round.winner === PlayerId.P1
                            ? p1Theme.solid
                            : p2Theme.solid,
                      },
                    ]}
                  >
                    {round.winner}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={isFullHistoryOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFullHistoryOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, isDark ? styles.modalCardDark : null]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    isDark ? styles.modalTitleDark : null,
                  ]}
                >
                  Match Summary
                </Text>
                <Text style={styles.modalSubtitle}>
                  {events.length} total points
                </Text>
              </View>
              <Pressable
                onPress={() => setIsFullHistoryOpen(false)}
                style={[
                  styles.closeIconAction,
                  isDark ? styles.closeIconActionDark : null,
                ]}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={isDark ? "#E2E8F0" : "#334155"}
                />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {Object.entries(roundsBySet).map(([setIndex, setRounds]) => (
                <View key={`set-${setIndex}`} style={styles.setSection}>
                  <View style={styles.setSectionHeader}>
                    <View style={styles.setLine} />
                    <Text style={styles.setSectionTitle}>
                      Set {Number(setIndex) + 1}
                    </Text>
                    <View style={styles.setLine} />
                  </View>
                  <View style={styles.gameWrapGrid}>
                    {setRounds.map((round, index) => (
                      <View
                        key={`round-${setIndex}-${index}`}
                        style={[
                          styles.roundCard,
                          isDark ? styles.roundCardDark : null,
                        ]}
                      >
                        <View style={styles.row}>
                          <Text
                            style={[
                              styles.eventType,
                              isDark ? styles.eventTypeDark : null,
                            ]}
                          >
                            G{round.gameIndex + 1}
                          </Text>
                          <Text
                            style={[
                              styles.snapshot,
                              isDark ? styles.snapshotDark : null,
                            ]}
                          >
                            {round.gameScoreStr}
                          </Text>
                        </View>
                        <View style={styles.pointRow}>
                          {round.points.map((point) => (
                            <View key={point.id} style={styles.pointWrap}>
                              <View
                                style={[
                                  styles.pointDot,
                                  {
                                    backgroundColor:
                                      point.winnerId === PlayerId.P1
                                        ? p1Theme.solid
                                        : p2Theme.solid,
                                  },
                                ]}
                              />
                              {point.sideSwitchAfter ? (
                                <Text style={styles.switchBadge}>↺</Text>
                              ) : null}
                            </View>
                          ))}
                          {round.winner ? (
                            <Text
                              style={[
                                styles.winner,
                                {
                                  backgroundColor:
                                    round.winner === PlayerId.P1
                                      ? p1Theme.solid
                                      : p2Theme.solid,
                                },
                              ]}
                            >
                              {round.winner}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  containerDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  title: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  titleDark: {
    color: "#CBD5E1",
  },
  count: {
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 2,
    textTransform: "uppercase",
  },
  countDark: {
    backgroundColor: "#2A1F47",
    color: "#E9D5FF",
  },
  horizontalContent: {
    gap: 8,
    paddingBottom: 2,
    paddingRight: 8,
  },
  compactRoundCard: {
    minWidth: 132,
  },
  historyIcon: {
    alignItems: "center",
    borderRadius: 999,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  historyIconDark: {
    backgroundColor: "#2A1F47",
  },
  historyIconText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "900",
  },
  historyIconTextDark: {
    color: "#C4B5FD",
  },
  empty: {
    color: "#64748B",
    fontSize: 14,
  },
  emptyDark: {
    color: "#94A3B8",
  },
  modalOverlay: {
    alignItems: "stretch",
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    flex: 1,
    justifyContent: "flex-end",
    padding: 0,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: "88%",
    padding: 14,
    width: "100%",
  },
  modalCardDark: {
    backgroundColor: "#120D24",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
  },
  modalTitleDark: {
    color: "#F8FAFC",
  },
  modalSubtitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  closeAction: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  closeIconAction: {
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  closeIconActionDark: {
    backgroundColor: "#2A1F47",
  },
  modalScrollContent: {
    gap: 12,
    paddingBottom: 12,
  },
  setSection: {
    gap: 6,
  },
  setSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  setSectionTitle: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  setLine: {
    backgroundColor: "#E2E8F0",
    flex: 1,
    height: 1,
  },
  gameWrapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roundCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 134,
    padding: 8,
  },
  roundCardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  eventType: {
    color: "#0F172A",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  eventTypeDark: {
    color: "#E2E8F0",
  },
  pointRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  pointWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pointDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  switchBadge: {
    color: "#64748B",
    fontSize: 7,
    fontWeight: "900",
    position: "absolute",
    right: -4,
    top: -5,
  },
  winner: {
    borderRadius: 8,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 2,
    textAlign: "center",
    width: 42,
  },
  snapshot: {
    color: "#0F172A",
    fontFamily: "Courier",
    fontSize: 13,
    fontWeight: "700",
  },
  snapshotDark: {
    color: "#E2E8F0",
  },
});
