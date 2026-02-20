import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { MatchConfig } from "../../domain/match/entities/MatchTypes";
import {
  PLAYER_COLOR_OPTIONS,
  normalizePlayerColorKey,
} from "../../shared/playerColors";
import { PrimaryButton } from "../components/PrimaryButton";

interface SetupScreenProps {
  initialConfig: MatchConfig;
  onStartMatch: (config: MatchConfig) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  initialConfig,
  onStartMatch,
}) => {
  const isDark = useColorScheme() === "dark";
  const [config, setConfig] = useState<MatchConfig>({
    ...initialConfig,
    p1Color: initialConfig.p1Color ?? "blue",
    p2Color: initialConfig.p2Color ?? "red",
  });

  const canStart = useMemo(
    () => config.p1Name.trim().length > 0 && config.p2Name.trim().length > 0,
    [config.p1Name, config.p2Name]
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isDark ? styles.containerDark : null,
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, isDark ? styles.titleDark : null]}>
          New Match
        </Text>
        <Text style={[styles.subtitle, isDark ? styles.subtitleDark : null]}>
          Configure players and rules before starting.
        </Text>

        <View style={[styles.card, isDark ? styles.cardDark : null]}>
          <Text
            style={[
              styles.sectionTitle,
              isDark ? styles.sectionTitleDark : null,
            ]}
          >
            Players
          </Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, isDark ? styles.labelDark : null]}>
              Mode
            </Text>
            <View style={styles.segmented}>
              <PrimaryButton
                label="Singles"
                onPress={() =>
                  setConfig((prev) => ({ ...prev, mode: "singles" }))
                }
                style={[
                  styles.segment,
                  config.mode === "singles"
                    ? styles.segmentActive
                    : styles.segmentInactive,
                ]}
              />
              <PrimaryButton
                label="Doubles"
                onPress={() =>
                  setConfig((prev) => ({ ...prev, mode: "doubles" }))
                }
                style={[
                  styles.segment,
                  config.mode === "doubles"
                    ? styles.segmentActive
                    : styles.segmentInactive,
                ]}
              />
            </View>
          </View>

          <Text style={[styles.label, isDark ? styles.labelDark : null]}>
            Player 1
          </Text>
          <TextInput
            style={[styles.input, isDark ? styles.inputDark : null]}
            value={config.p1Name}
            onChangeText={(value) =>
              setConfig((prev) => ({ ...prev, p1Name: value }))
            }
            placeholder="Player 1"
            placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
          />

          {config.mode === "doubles" ? (
            <>
              <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                Player 2
              </Text>
              <TextInput
                style={[styles.input, isDark ? styles.inputDark : null]}
                value={config.p1PartnerName ?? ""}
                onChangeText={(value) =>
                  setConfig((prev) => ({ ...prev, p1PartnerName: value }))
                }
                placeholder="Player 2"
                placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
              />
            </>
          ) : null}

          <Text style={[styles.label, isDark ? styles.labelDark : null]}>
            {config.mode === "doubles" ? "Team 1 Color" : "Player 1 Color"}
          </Text>

          <View style={styles.colorPickerRow}>
            {PLAYER_COLOR_OPTIONS.map((option) => {
              const isSelected =
                normalizePlayerColorKey(config.p1Color, "blue") === option.key;

              return (
                <Pressable
                  key={`p1-${option.key}`}
                  onPress={() =>
                    setConfig((prev) => ({ ...prev, p1Color: option.key }))
                  }
                  style={[
                    styles.colorOption,
                    { backgroundColor: option.solid },
                    isSelected ? styles.colorOptionSelected : null,
                    isDark && isSelected
                      ? styles.colorOptionSelectedDark
                      : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${
                    config.mode === "doubles" ? "Team 1" : "Player 1"
                  } color ${option.label}`}
                />
              );
            })}
          </View>

          {config.mode === "doubles" ? (
            <View
              style={[
                styles.teamDivider,
                isDark ? styles.teamDividerDark : null,
              ]}
            />
          ) : null}

          <Text style={[styles.label, isDark ? styles.labelDark : null]}>
            {config.mode === "doubles" ? "Player 3" : "Player 2"}
          </Text>
          <TextInput
            style={[styles.input, isDark ? styles.inputDark : null]}
            value={config.p2Name}
            onChangeText={(value) =>
              setConfig((prev) => ({ ...prev, p2Name: value }))
            }
            placeholder={config.mode === "doubles" ? "Player 3" : "Player 2"}
            placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
          />

          {config.mode === "doubles" ? (
            <>
              <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                Player 4
              </Text>
              <TextInput
                style={[styles.input, isDark ? styles.inputDark : null]}
                value={config.p2PartnerName ?? ""}
                onChangeText={(value) =>
                  setConfig((prev) => ({ ...prev, p2PartnerName: value }))
                }
                placeholder="Player 4"
                placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
              />
            </>
          ) : null}

          <Text style={[styles.label, isDark ? styles.labelDark : null]}>
            {config.mode === "doubles" ? "Team 2 Color" : "Player 2 Color"}
          </Text>

          <View style={styles.colorPickerRow}>
            {PLAYER_COLOR_OPTIONS.map((option) => {
              const isSelected =
                normalizePlayerColorKey(config.p2Color, "red") === option.key;

              return (
                <Pressable
                  key={`p2-${option.key}`}
                  onPress={() =>
                    setConfig((prev) => ({ ...prev, p2Color: option.key }))
                  }
                  style={[
                    styles.colorOption,
                    { backgroundColor: option.solid },
                    isSelected ? styles.colorOptionSelected : null,
                    isDark && isSelected
                      ? styles.colorOptionSelectedDark
                      : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${
                    config.mode === "doubles" ? "Team 2" : "Player 2"
                  } color ${option.label}`}
                />
              );
            })}
          </View>

          {config.mode === "doubles" ? (
            <View
              style={[
                styles.teamDivider,
                isDark ? styles.teamDividerDark : null,
              ]}
            />
          ) : null}

          <Text
            style={[
              styles.sectionTitle,
              isDark ? styles.sectionTitleDark : null,
            ]}
          >
            Rules
          </Text>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, isDark ? styles.labelDark : null]}>
              Advantage scoring
            </Text>
            <Switch
              value={config.useAdvantage}
              onValueChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  useAdvantage: value,
                }))
              }
            />
          </View>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, isDark ? styles.labelDark : null]}>
              Sets to win
            </Text>
            <View style={styles.segmented}>
              {[1, 2, 3].map((value) => (
                <PrimaryButton
                  key={value}
                  label={`${value}`}
                  onPress={() =>
                    setConfig((prev) => ({
                      ...prev,
                      setsToWin: value as MatchConfig["setsToWin"],
                    }))
                  }
                  style={[
                    styles.segment,
                    config.setsToWin === value
                      ? styles.segmentActive
                      : styles.segmentInactive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, isDark ? styles.labelDark : null]}>
              Final set
            </Text>
            <View style={styles.segmented}>
              <PrimaryButton
                label="Standard"
                onPress={() =>
                  setConfig((prev) => ({ ...prev, finalSetType: "standard" }))
                }
                style={[
                  styles.segment,
                  config.finalSetType === "standard"
                    ? styles.segmentActive
                    : styles.segmentInactive,
                ]}
              />
              <PrimaryButton
                label="Super TB"
                onPress={() =>
                  setConfig((prev) => ({
                    ...prev,
                    finalSetType: "superTieBreak",
                  }))
                }
                style={[
                  styles.segment,
                  config.finalSetType === "superTieBreak"
                    ? styles.segmentActive
                    : styles.segmentInactive,
                ]}
              />
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, isDark ? styles.labelDark : null]}>
              Tie-break at
            </Text>
            <TextInput
              style={[styles.numberInput, isDark ? styles.inputDark : null]}
              value={String(config.tieBreakAt)}
              onChangeText={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  tieBreakAt: Math.max(1, Number(value) || 6),
                }))
              }
              keyboardType="number-pad"
              placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
            />
          </View>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, isDark ? styles.labelDark : null]}>
              TB points
            </Text>
            <TextInput
              style={[styles.numberInput, isDark ? styles.inputDark : null]}
              value={String(config.tieBreakPoints)}
              onChangeText={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  tieBreakPoints: Math.max(1, Number(value) || 7),
                }))
              }
              keyboardType="number-pad"
              placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
            />
          </View>
        </View>

        <PrimaryButton
          label="Start Match"
          onPress={() => onStartMatch(config)}
          disabled={!canStart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
    padding: 18,
  },
  containerDark: {
    backgroundColor: "#090714",
  },
  content: {
    alignSelf: "center",
    gap: 12,
    maxWidth: 760,
    width: "100%",
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
    color: "#475569",
    fontSize: 14,
    marginBottom: 2,
  },
  subtitleDark: {
    color: "#C4B5FD",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  labelDark: {
    color: "#E9D5FF",
  },
  sectionTitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginTop: 4,
    textTransform: "uppercase",
  },
  sectionTitleDark: {
    color: "#A78BFA",
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
  numberInput: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: "center",
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  segmented: {
    flexDirection: "row",
    gap: 6,
  },
  segment: {
    minWidth: 44,
    paddingVertical: 8,
  },
  segmentActive: {
    backgroundColor: "#0F172A",
  },
  segmentInactive: {
    backgroundColor: "#94A3B8",
  },
  colorPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
    marginTop: -1,
  },
  colorOption: {
    borderColor: "transparent",
    borderRadius: 999,
    borderWidth: 2,
    height: 22,
    width: 22,
  },
  colorOptionSelected: {
    borderColor: "#0F172A",
  },
  colorOptionSelectedDark: {
    borderColor: "#F5F3FF",
  },
  teamDivider: {
    backgroundColor: "#E2E8F0",
    height: 1,
    marginVertical: 2,
  },
  teamDividerDark: {
    backgroundColor: "#4C3D76",
  },
});
