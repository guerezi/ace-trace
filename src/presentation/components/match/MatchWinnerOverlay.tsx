import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { HistoryEvent } from "../../../domain/match/entities/MatchTypes";
import { PrimaryButton } from "../PrimaryButton";
import { TimelineCard } from "../TimelineCard";

interface MatchWinnerOverlayProps {
  isDark: boolean;
  winnerName: string;
  events: HistoryEvent[];
  p1Color?: string;
  p2Color?: string;
  winnerOpacity: Animated.Value;
  winnerScale: Animated.Value;
  trophyTranslateY: Animated.AnimatedInterpolation<number>;
  onUndo: () => void;
  onEndMatch: () => void;
}

export const MatchWinnerOverlay: React.FC<MatchWinnerOverlayProps> = ({
  isDark,
  winnerName,
  events,
  p1Color,
  p2Color,
  winnerOpacity,
  winnerScale,
  trophyTranslateY,
  onUndo,
  onEndMatch,
}) => {
  return (
    <Animated.View
      style={[
        styles.winnerOverlay,
        isDark ? styles.winnerOverlayDark : null,
        { opacity: winnerOpacity },
      ]}
    >
      <Animated.View
        style={[
          styles.winnerCard,
          isDark ? styles.winnerCardDark : null,
          { transform: [{ scale: winnerScale }] },
        ]}
      >
        <Animated.Text
          style={[
            styles.trophy,
            { transform: [{ translateY: trophyTranslateY }] },
          ]}
        >
          🏆
        </Animated.Text>
        <Text
          style={[styles.winnerTitle, isDark ? styles.winnerTitleDark : null]}
        >
          Match Over
        </Text>
        <Text
          style={[styles.winnerName, isDark ? styles.winnerNameDark : null]}
        >
          Winner: {winnerName}
        </Text>
        <View style={styles.winnerTimelineWrap}>
          <TimelineCard events={events} p1Color={p1Color} p2Color={p2Color} />
        </View>
        <View style={styles.winnerActions}>
          <Pressable
            onPress={onUndo}
            style={[
              styles.winnerSecondaryAction,
              isDark ? styles.winnerSecondaryActionDark : null,
            ]}
          >
            <Text
              style={[
                styles.winnerSecondaryText,
                isDark ? styles.winnerSecondaryTextDark : null,
              ]}
            >
              Undo Last Point
            </Text>
          </Pressable>
          <PrimaryButton
            label="Start New Match"
            onPress={onEndMatch}
            style={styles.winnerPrimaryAction}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  winnerCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    maxWidth: 460,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    width: "94%",
  },
  winnerCardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#615091",
  },
  winnerTitle: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  winnerTitleDark: {
    color: "#F5F3FF",
  },
  winnerName: {
    color: "#334155",
    fontSize: 18,
    fontWeight: "700",
  },
  winnerNameDark: {
    color: "#DDD6FE",
  },
  winnerTimelineWrap: {
    marginTop: 2,
    maxHeight: 240,
    width: "100%",
  },
  winnerOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 40,
  },
  winnerOverlayDark: {
    backgroundColor: "rgba(9, 7, 20, 0.9)",
  },
  trophy: {
    fontSize: 64,
    marginBottom: 2,
  },
  winnerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    width: "100%",
  },
  winnerSecondaryAction: {
    alignItems: "center",
    borderColor: "#CBD5E1",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
  },
  winnerSecondaryActionDark: {
    borderColor: "#6D5FA1",
  },
  winnerSecondaryText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  winnerSecondaryTextDark: {
    color: "#E9D5FF",
  },
  winnerPrimaryAction: {
    flex: 1,
    minHeight: 40,
  },
});
