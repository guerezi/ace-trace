import React from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import {
  MatchConfig,
  MatchState,
  PlayerId,
} from "../../domain/match/entities/MatchTypes";
import { Scoreboard } from "../components/Scoreboard";
import { TimelineCard } from "../components/TimelineCard";
import {
  MatchAppBar,
  MatchSettingsModal,
  MatchWinnerOverlay,
  SwitchEndsOverlay,
} from "../components/match";

interface MatchScreenProps {
  state: MatchState;
  onScorePoint: (winner: PlayerId) => void;
  onUndo: () => void;
  onTogglePause: () => void;
  onEndMatch: () => void;
  onBackToDashboard: () => void;
  onSaveSettings: (config: MatchConfig) => void;
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const MatchScreen: React.FC<MatchScreenProps> = ({
  state,
  onScorePoint,
  onUndo,
  onTogglePause,
  onEndMatch,
  onBackToDashboard,
  onSaveSettings,
}) => {
  const isDark = useColorScheme() === "dark";
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const winnerOpacity = React.useRef(new Animated.Value(0)).current;
  const winnerScale = React.useRef(new Animated.Value(0.94)).current;
  const trophyBounce = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!state.isMatchOver) {
      winnerOpacity.setValue(0);
      winnerScale.setValue(0.94);
      trophyBounce.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(winnerOpacity, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(winnerScale, {
        damping: 12,
        mass: 0.85,
        stiffness: 180,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(trophyBounce, {
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(trophyBounce, {
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [state.isMatchOver, winnerOpacity, winnerScale, trophyBounce]);

  const trophyTranslateY = trophyBounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  return (
    <View style={[styles.container, isDark ? styles.containerDark : null]}>
      <View style={styles.content}>
        <MatchAppBar
          isDark={isDark}
          isPaused={state.isPaused}
          isMatchOver={state.isMatchOver}
          isTieBreak={state.isTieBreak}
          durationLabel={formatDuration(state.durationSeconds)}
          onBackToDashboard={onBackToDashboard}
          onTogglePause={onTogglePause}
          onUndo={onUndo}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <View style={styles.scoreboardArea}>
          <Scoreboard state={state} onPoint={onScorePoint} expandToFill />
        </View>

        <TimelineCard
          events={state.history}
          p1Color={state.config.p1Color}
          p2Color={state.config.p2Color}
        />

        {state.shouldSwitchSides && !state.isMatchOver ? (
          <SwitchEndsOverlay />
        ) : null}

        {state.isMatchOver ? (
          <MatchWinnerOverlay
            isDark={isDark}
            winnerName={
              state.winner === PlayerId.P1
                ? state.config.p1Name
                : state.config.p2Name
            }
            events={state.history}
            p1Color={state.config.p1Color}
            p2Color={state.config.p2Color}
            winnerOpacity={winnerOpacity}
            winnerScale={winnerScale}
            trophyTranslateY={trophyTranslateY}
            onUndo={onUndo}
            onEndMatch={onEndMatch}
          />
        ) : null}

        <MatchSettingsModal
          visible={isSettingsOpen}
          config={state.config}
          showEndAction={!state.isMatchOver}
          onClose={() => setIsSettingsOpen(false)}
          onEndMatch={onEndMatch}
          onSave={onSaveSettings}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F5F9",
    flex: 1,
    padding: 10,
  },
  containerDark: {
    backgroundColor: "#090714",
  },
  content: {
    alignSelf: "center",
    flex: 1,
    gap: 8,
    maxWidth: 680,
    position: "relative",
    width: "100%",
  },
  appBar: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  appBarDark: {
    backgroundColor: "#1A1330",
    borderColor: "#463B6E",
  },
  iconAction: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 34,
  },
  timerGroup: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 96,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerGroupDark: {
    backgroundColor: "#261E44",
    borderColor: "#463B6E",
  },
  appBarSpacer: {
    flex: 1,
  },
  timer: {
    color: "#0F172A",
    fontFamily: "Courier",
    fontSize: 18,
    fontWeight: "900",
  },
  pauseAction: {
    alignItems: "center",
    borderRadius: 6,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  timerPaused: {
    color: "#94A3B8",
  },
  timerDark: {
    color: "#F5F3FF",
  },
  badge: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    color: "#475569",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 8,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  badgeDark: {
    backgroundColor: "#2A1F47",
    color: "#C4B5FD",
  },
  scoreboardArea: {
    flex: 1,
    minHeight: 0,
  },
});
