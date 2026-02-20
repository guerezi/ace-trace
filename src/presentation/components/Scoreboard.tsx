import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { MatchState, PlayerId } from "../../domain/match/entities/MatchTypes";
import { resolvePlayerColorTheme } from "../../shared/playerColors";

interface ScoreboardProps {
  state: MatchState;
  onPoint: (winner: PlayerId) => void;
  readOnly?: boolean;
  expandToFill?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  state,
  onPoint,
  readOnly = false,
  expandToFill = false,
}) => {
  const isDark = useColorScheme() === "dark";
  const p1Point = state.points[PlayerId.P1];
  const p2Point = state.points[PlayerId.P2];
  const p1Theme = resolvePlayerColorTheme(state.config.p1Color, "blue");
  const p2Theme = resolvePlayerColorTheme(state.config.p2Color, "red");
  const completedSets = state.sets.slice(0, state.currentSetIndex);
  const completedSetsSummary =
    completedSets.length > 0
      ? completedSets
          .map((set) => `${set[PlayerId.P1]}-${set[PlayerId.P2]}`)
          .join(" · ")
      : "No completed sets";
  const isDisabled = state.isMatchOver || state.isPaused || readOnly;

  const completedGamesBeforeCurrentSet = state.sets
    .slice(0, state.currentSetIndex)
    .reduce((total, set) => total + set[PlayerId.P1] + set[PlayerId.P2], 0);
  const completedGamesInCurrentSet =
    state.games[PlayerId.P1] + state.games[PlayerId.P2];
  const currentGameNumber =
    completedGamesBeforeCurrentSet + completedGamesInCurrentSet + 1;

  const resolveServingPartnerIndex = (team: PlayerId): 0 | 1 => {
    if (state.config.mode !== "doubles") {
      return 0;
    }

    const turns =
      team === PlayerId.P1
        ? Math.ceil(currentGameNumber / 2)
        : Math.floor(currentGameNumber / 2);

    const normalizedTurns = Math.max(1, turns);
    return normalizedTurns % 2 === 1 ? 0 : 1;
  };

  const p1ServingPartnerIndex = resolveServingPartnerIndex(PlayerId.P1);
  const p2ServingPartnerIndex = resolveServingPartnerIndex(PlayerId.P2);
  const p1ServingName =
    p1ServingPartnerIndex === 0
      ? state.config.p1Name
      : state.config.p1PartnerName || "Partner";
  const p2ServingName =
    p2ServingPartnerIndex === 0
      ? state.config.p2Name
      : state.config.p2PartnerName || "Partner";

  const toNumericPoint = (value: MatchState["points"][PlayerId.P1]): number => {
    if (typeof value === "number") return value;
    if (value === "15") return 1;
    if (value === "30") return 2;
    if (value === "40") return 3;
    if (value === "Ad") return 4;
    return 0;
  };

  const serveSide =
    (toNumericPoint(state.points[PlayerId.P1]) +
      toNumericPoint(state.points[PlayerId.P2])) %
      2 ===
    0
      ? "Right (Deuce)"
      : "Left (Ad)";

  const serverServeSide = serveSide.includes("Deuce") ? "Deuce" : "Ad";

  return (
    <View
      style={[
        styles.container,
        expandToFill ? styles.containerFill : null,
        isDark ? styles.containerDark : null,
      ]}
    >
      <View
        style={[
          styles.setsHistoryRow,
          isDark ? styles.setsHistoryRowDark : null,
        ]}
      >
        <View
          style={[
            styles.currentSetPill,
            isDark ? styles.currentSetPillDark : null,
          ]}
        >
          <Text style={[styles.setTitle, isDark ? styles.setTitleDark : null]}>
            Set {state.currentSetIndex + 1}
          </Text>
          <View style={styles.gamesRow}>
            <Text style={[styles.gamesValue, { color: p1Theme.border }]}>
              {state.games[PlayerId.P1]}
            </Text>
            <Text
              style={[
                styles.gamesDivider,
                isDark ? styles.gamesDividerDark : null,
              ]}
            >
              -
            </Text>
            <Text style={[styles.gamesValue, { color: p2Theme.border }]}>
              {state.games[PlayerId.P2]}
            </Text>
          </View>
        </View>

        <View style={styles.historySummaryWrap}>
          <Text
            style={[
              styles.historySummaryLabel,
              isDark ? styles.historySummaryLabelDark : null,
            ]}
          >
            Set History
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.historySummaryValue,
              isDark ? styles.historySummaryValueDark : null,
            ]}
          >
            {completedSetsSummary}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.cardsContainer,
          expandToFill ? styles.cardsContainerFill : null,
        ]}
      >
        <Pressable
          style={[
            styles.card,
            expandToFill ? styles.cardFill : null,
            { backgroundColor: p1Theme.lightSurface },
            isDark ? styles.cardDark : null,
            isDisabled ? styles.cardDisabled : null,
          ]}
          onPress={() => onPoint(PlayerId.P1)}
          disabled={isDisabled}
        >
          <LinearGradient
            colors={isDark ? p1Theme.darkGradient : p1Theme.lightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
            pointerEvents="none"
          />
          <View
            style={[styles.sideAccent, { backgroundColor: p1Theme.border }]}
          />
          <Text
            style={[styles.cardGhost, isDark ? styles.cardGhostDark : null]}
          >
            P1
          </Text>
          <View style={styles.playerNameRow}>
            <Text
              style={[
                styles.playerName,
                { color: isDark ? "#F5F3FF" : p1Theme.text },
              ]}
            >
              {state.config.p1Name}
            </Text>
            {state.server === PlayerId.P1 && p1ServingPartnerIndex === 0 ? (
              <View
                style={[styles.serveDot, { backgroundColor: p1Theme.solid }]}
              />
            ) : null}
          </View>
          {state.config.mode === "doubles" ? (
            <View style={styles.partnerRow}>
              <Text
                style={[
                  styles.partnerName,
                  isDark ? styles.partnerNameDark : null,
                ]}
              >
                {state.config.p1PartnerName || "Partner"}
              </Text>
              {state.server === PlayerId.P1 && p1ServingPartnerIndex === 1 ? (
                <View
                  style={[styles.serveDot, { backgroundColor: p1Theme.solid }]}
                />
              ) : null}
            </View>
          ) : null}
          <Text
            style={[
              styles.pointValue,
              { color: isDark ? "#FFFFFF" : p1Theme.border },
            ]}
          >
            {String(p1Point)}
          </Text>
          {state.server === PlayerId.P1 ? (
            <Text
              style={[
                styles.servingPill,
                {
                  backgroundColor: isDark
                    ? p1Theme.badgeDark
                    : p1Theme.badgeLight,
                  color: isDark ? "#E2E8F0" : p1Theme.text,
                },
              ]}
            >
              Serving · {p1ServingName} · {serverServeSide}
            </Text>
          ) : null}
        </Pressable>

        <Pressable
          style={[
            styles.card,
            expandToFill ? styles.cardFill : null,
            { backgroundColor: p2Theme.lightSurface },
            isDark ? styles.cardDark : null,
            isDisabled ? styles.cardDisabled : null,
          ]}
          onPress={() => onPoint(PlayerId.P2)}
          disabled={isDisabled}
        >
          <LinearGradient
            colors={isDark ? p2Theme.darkGradient : p2Theme.lightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
            pointerEvents="none"
          />
          <View
            style={[styles.sideAccent, { backgroundColor: p2Theme.border }]}
          />
          <Text
            style={[styles.cardGhost, isDark ? styles.cardGhostDark : null]}
          >
            P2
          </Text>
          <View style={styles.playerNameRow}>
            <Text
              style={[
                styles.playerName,
                { color: isDark ? "#F5F3FF" : p2Theme.text },
              ]}
            >
              {state.config.p2Name}
            </Text>
            {state.server === PlayerId.P2 && p2ServingPartnerIndex === 0 ? (
              <View
                style={[styles.serveDot, { backgroundColor: p2Theme.solid }]}
              />
            ) : null}
          </View>
          {state.config.mode === "doubles" ? (
            <View style={styles.partnerRow}>
              <Text
                style={[
                  styles.partnerName,
                  isDark ? styles.partnerNameDark : null,
                ]}
              >
                {state.config.p2PartnerName || "Partner"}
              </Text>
              {state.server === PlayerId.P2 && p2ServingPartnerIndex === 1 ? (
                <View
                  style={[styles.serveDot, { backgroundColor: p2Theme.solid }]}
                />
              ) : null}
            </View>
          ) : null}
          <Text
            style={[
              styles.pointValue,
              { color: isDark ? "#FFFFFF" : p2Theme.border },
            ]}
          >
            {String(p2Point)}
          </Text>
          {state.server === PlayerId.P2 ? (
            <Text
              style={[
                styles.servingPill,
                {
                  backgroundColor: isDark
                    ? p2Theme.badgeDark
                    : p2Theme.badgeLight,
                  color: isDark ? "#E2E8F0" : p2Theme.text,
                },
              ]}
            >
              Serving · {p2ServingName} · {serverServeSide}
            </Text>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  containerFill: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: "#0C0A18",
  },
  setsHistoryRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    minHeight: 64,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  setsHistoryRowDark: {
    backgroundColor: "#1B1630",
    borderColor: "#463B6E",
  },
  historySummaryWrap: {
    flex: 1,
    minWidth: 0,
  },
  historySummaryLabel: {
    color: "#334155",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  historySummaryLabelDark: {
    color: "#CBD5E1",
  },
  historySummaryValue: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  historySummaryValueDark: {
    color: "#DDD6FE",
  },
  currentSetPill: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  currentSetPillDark: {
    backgroundColor: "#261E44",
    borderColor: "#554584",
  },
  setTitle: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  setTitleDark: {
    color: "#DDD6FE",
  },
  gamesRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  gamesValue: {
    fontSize: 36,
    fontWeight: "900",
  },
  gamesDivider: {
    color: "#94A3B8",
    fontSize: 24,
    fontWeight: "900",
    marginHorizontal: 8,
  },
  gamesDividerDark: {
    color: "#64748B",
  },
  cardsContainer: {
    gap: 10,
  },
  cardsContainerFill: {
    flex: 1,
  },
  card: {
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 180,
    overflow: "hidden",
    padding: 16,
    position: "relative",
  },
  cardFill: {
    flex: 1,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  sideAccent: {
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 8,
  },
  cardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  p1Border: {
    borderLeftWidth: 5,
  },
  p2Border: {
    borderLeftWidth: 5,
  },
  cardDisabled: {
    opacity: 0.75,
  },
  cardGhost: {
    color: "#0F172A",
    fontSize: 64,
    fontWeight: "900",
    opacity: 0.05,
    position: "absolute",
    right: 8,
    top: 4,
  },
  cardGhostDark: {
    color: "#E9D5FF",
    opacity: 0.06,
  },
  playerNameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  partnerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  playerName: {
    fontSize: 23,
    fontWeight: "800",
  },
  partnerName: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: -2,
  },
  partnerNameDark: {
    color: "#C4B5FD",
  },
  serveDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  pointValue: {
    fontSize: 84,
    fontWeight: "900",
    lineHeight: 90,
  },
  servingPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 8,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
});
