import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import {
  MatchState,
  PlayerId,
} from "../../../domain/match/entities/MatchTypes";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Scoreboard } from "../../components/Scoreboard";
import { TimelineCard } from "../../components/TimelineCard";

interface SpectatorScreenProps {
  state: MatchState;
  onBack: () => void;
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
};

const pointToNumeric = (value: MatchState["points"][PlayerId.P1]): number => {
  if (typeof value === "number") {
    return value;
  }
  if (value === "15") {
    return 1;
  }
  if (value === "30") {
    return 2;
  }
  if (value === "40") {
    return 3;
  }
  if (value === "Ad") {
    return 4;
  }
  return 0;
};

export const SpectatorScreen: React.FC<SpectatorScreenProps> = ({
  state,
  onBack,
}) => {
  const isDark = useColorScheme() === "dark";
  const [liveDuration, setLiveDuration] = useState(state.durationSeconds);

  useEffect(() => {
    if (state.isPaused || state.isMatchOver) {
      setLiveDuration(state.durationSeconds);
      return;
    }

    const timer = setInterval(() => {
      setLiveDuration(
        Math.max(0, Math.floor((Date.now() - state.startTime) / 1000))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [
    state.durationSeconds,
    state.isMatchOver,
    state.isPaused,
    state.startTime,
  ]);

  const currentSetScore = useMemo(() => {
    const setIndex = Math.max(0, state.currentSetIndex);
    const set = state.sets[setIndex] ?? state.sets[state.sets.length - 1];
    if (!set) {
      return "0-0";
    }

    return `${set.P1}-${set.P2}`;
  }, [state.currentSetIndex, state.sets]);

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

  const servingPlayerName =
    state.server === PlayerId.P1
      ? resolveServingPartnerIndex(PlayerId.P1) === 0
        ? state.config.p1Name
        : state.config.p1PartnerName || "Partner"
      : resolveServingPartnerIndex(PlayerId.P2) === 0
      ? state.config.p2Name
      : state.config.p2PartnerName || "Partner";

  const serveSide = useMemo(() => {
    const total =
      pointToNumeric(state.points[PlayerId.P1]) +
      pointToNumeric(state.points[PlayerId.P2]);
    return total % 2 === 0 ? "DEUCE SIDE" : "AD SIDE";
  }, [state.points]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isDark ? styles.containerDark : null,
      ]}
    >
      <View style={styles.content}>
        <View
          style={[styles.headerCard, isDark ? styles.headerCardDark : null]}
        >
          <View style={styles.topRow}>
            <Text style={[styles.title, isDark ? styles.titleDark : null]}>
              Spectator View
            </Text>
            <PrimaryButton
              label="Back"
              onPress={onBack}
              style={styles.backButton}
            />
          </View>
          <Text style={[styles.subtitle, isDark ? styles.subtitleDark : null]}>
            Read-only live score stream.
          </Text>
        </View>

        <View style={[styles.chipsCard, isDark ? styles.chipsCardDark : null]}>
          <View style={styles.chipsRow}>
            <Text
              style={[styles.timerChip, isDark ? styles.timerChipDark : null]}
            >
              {formatDuration(liveDuration)}
            </Text>
            <Text
              style={[
                styles.infoChip,
                isDark ? styles.infoChipDark : null,
                state.isPaused ? styles.pausedChip : styles.liveChip,
              ]}
            >
              {state.isPaused ? "PAUSED" : "LIVE"}
            </Text>
            <Text
              style={[styles.infoChip, isDark ? styles.infoChipDark : null]}
            >
              SET {state.currentSetIndex + 1}
            </Text>
            <Text
              style={[styles.infoChip, isDark ? styles.infoChipDark : null]}
            >
              SET SCORE {currentSetScore}
            </Text>
            <Text
              style={[styles.infoChip, isDark ? styles.infoChipDark : null]}
            >
              GAMES {state.games.P1}-{state.games.P2}
            </Text>
            <Text
              style={[styles.infoChip, isDark ? styles.infoChipDark : null]}
            >
              SERVING {servingPlayerName}
            </Text>
            <Text
              style={[styles.infoChip, isDark ? styles.infoChipDark : null]}
            >
              {serveSide}
            </Text>
          </View>
        </View>

        <Scoreboard state={state} onPoint={() => undefined} readOnly />
        <TimelineCard
          events={state.history}
          p1Color={state.config.p1Color}
          p2Color={state.config.p2Color}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F5F9",
    flexGrow: 1,
    padding: 16,
  },
  containerDark: {
    backgroundColor: "#090714",
  },
  content: {
    alignSelf: "center",
    gap: 12,
    maxWidth: 980,
    width: "100%",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  headerCardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "#0F172A",
    fontSize: 22,
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
  chipsCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  chipsCardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  timerChip: {
    backgroundColor: "#0F172A",
    borderRadius: 999,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  timerChipDark: {
    backgroundColor: "#261E44",
    color: "#F5F3FF",
  },
  infoChip: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    color: "#334155",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  infoChipDark: {
    backgroundColor: "#2A1F47",
    color: "#E9D5FF",
  },
  liveChip: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  pausedChip: {
    backgroundColor: "#FDE68A",
    color: "#92400E",
  },
  backButton: {
    backgroundColor: "#334155",
    minWidth: 80,
  },
});
