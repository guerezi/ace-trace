import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface MatchAppBarProps {
  isDark: boolean;
  isPaused: boolean;
  isMatchOver: boolean;
  isTieBreak: boolean;
  durationLabel: string;
  onBackToDashboard: () => void;
  onTogglePause: () => void;
  onUndo: () => void;
  onOpenSettings: () => void;
}

export const MatchAppBar: React.FC<MatchAppBarProps> = ({
  isDark,
  isPaused,
  isMatchOver,
  isTieBreak,
  durationLabel,
  onBackToDashboard,
  onTogglePause,
  onUndo,
  onOpenSettings,
}) => {
  return (
    <View style={[styles.appBar, isDark ? styles.appBarDark : null]}>
      <Pressable onPress={onBackToDashboard} style={styles.iconAction}>
        <Ionicons
          name="arrow-back"
          size={20}
          color={isDark ? "#E9D5FF" : "#334155"}
        />
      </Pressable>

      <View style={[styles.timerGroup, isDark ? styles.timerGroupDark : null]}>
        <Text
          style={[
            styles.timer,
            isPaused ? styles.timerPaused : null,
            isDark ? styles.timerDark : null,
          ]}
        >
          {durationLabel}
        </Text>
        {!isMatchOver ? (
          <Pressable onPress={onTogglePause} style={styles.pauseAction}>
            <Ionicons
              name={isPaused ? "play" : "pause"}
              size={14}
              color={isDark ? "#DDD6FE" : "#475569"}
            />
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.badge, isDark ? styles.badgeDark : null]}>
        {isTieBreak ? "Tie Break" : "Regular Game"}
      </Text>

      <View style={styles.appBarSpacer} />

      <Pressable onPress={onUndo} style={styles.iconAction}>
        <Ionicons
          name="arrow-undo"
          size={20}
          color={isDark ? "#E9D5FF" : "#334155"}
        />
      </Pressable>

      <Pressable onPress={onOpenSettings} style={styles.iconAction}>
        <Ionicons
          name="settings-sharp"
          size={20}
          color={isDark ? "#E9D5FF" : "#334155"}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
