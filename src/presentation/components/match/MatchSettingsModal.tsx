import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { MatchConfig } from "../../../domain/match/entities/MatchTypes";
import {
  PLAYER_COLOR_OPTIONS,
  normalizePlayerColorKey,
} from "../../../shared/playerColors";
import { PrimaryButton } from "../PrimaryButton";

interface MatchSettingsModalProps {
  visible: boolean;
  config: MatchConfig;
  onClose: () => void;
  onSave: (config: MatchConfig) => void;
  onEndMatch?: () => void;
  showEndAction?: boolean;
}

export const MatchSettingsModal: React.FC<MatchSettingsModalProps> = ({
  visible,
  config,
  onClose,
  onSave,
  onEndMatch,
  showEndAction = true,
}) => {
  const isDark = useColorScheme() === "dark";
  const [draft, setDraft] = useState<MatchConfig>({
    ...config,
    p1Color: config.p1Color ?? "blue",
    p2Color: config.p2Color ?? "red",
  });

  useEffect(() => {
    if (visible) {
      setDraft({
        ...config,
        p1Color: config.p1Color ?? "blue",
        p2Color: config.p2Color ?? "red",
      });
    }
  }, [config, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, isDark ? styles.sheetDark : null]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isDark ? styles.titleDark : null]}>
              Match Settings
            </Text>
            <Pressable
              onPress={onClose}
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

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
          >
            <View style={[styles.section, isDark ? styles.sectionDark : null]}>
              <Text
                style={[
                  styles.sectionTitle,
                  isDark ? styles.sectionTitleDark : null,
                ]}
              >
                Players
              </Text>
              <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                Player 1
              </Text>
              <TextInput
                value={draft.p1Name}
                onChangeText={(value) =>
                  setDraft((prev) => ({ ...prev, p1Name: value }))
                }
                style={[styles.input, isDark ? styles.inputDark : null]}
                placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
              />

              {draft.mode === "doubles" ? (
                <>
                  <Text
                    style={[styles.label, isDark ? styles.labelDark : null]}
                  >
                    Player 2
                  </Text>
                  <TextInput
                    value={draft.p1PartnerName ?? ""}
                    onChangeText={(value) =>
                      setDraft((prev) => ({ ...prev, p1PartnerName: value }))
                    }
                    style={[styles.input, isDark ? styles.inputDark : null]}
                    placeholder="Player 2"
                    placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
                  />
                </>
              ) : null}

              <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                {draft.mode === "doubles" ? "Team 1 Color" : "Player 1 Color"}
              </Text>
              <View style={styles.colorPickerRow}>
                {PLAYER_COLOR_OPTIONS.map((option) => {
                  const isSelected =
                    normalizePlayerColorKey(draft.p1Color, "blue") ===
                    option.key;

                  return (
                    <Pressable
                      key={`settings-p1-${option.key}`}
                      onPress={() =>
                        setDraft((prev) => ({ ...prev, p1Color: option.key }))
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
                        draft.mode === "doubles" ? "Team 1" : "Player 1"
                      } color ${option.label}`}
                    />
                  );
                })}
              </View>

              {draft.mode === "doubles" ? (
                <View
                  style={[
                    styles.teamDivider,
                    isDark ? styles.teamDividerDark : null,
                  ]}
                />
              ) : null}

              <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                {draft.mode === "doubles" ? "Player 3" : "Player 2"}
              </Text>
              <TextInput
                value={draft.p2Name}
                onChangeText={(value) =>
                  setDraft((prev) => ({ ...prev, p2Name: value }))
                }
                style={[styles.input, isDark ? styles.inputDark : null]}
                placeholder={draft.mode === "doubles" ? "Player 3" : "Player 2"}
                placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
              />

              {draft.mode === "doubles" ? (
                <>
                  <Text
                    style={[styles.label, isDark ? styles.labelDark : null]}
                  >
                    Player 4
                  </Text>
                  <TextInput
                    value={draft.p2PartnerName ?? ""}
                    onChangeText={(value) =>
                      setDraft((prev) => ({ ...prev, p2PartnerName: value }))
                    }
                    style={[styles.input, isDark ? styles.inputDark : null]}
                    placeholder="Player 4"
                    placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
                  />
                </>
              ) : null}

              <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                {draft.mode === "doubles" ? "Team 2 Color" : "Player 2 Color"}
              </Text>
              <View style={styles.colorPickerRow}>
                {PLAYER_COLOR_OPTIONS.map((option) => {
                  const isSelected =
                    normalizePlayerColorKey(draft.p2Color, "red") ===
                    option.key;

                  return (
                    <Pressable
                      key={`settings-p2-${option.key}`}
                      onPress={() =>
                        setDraft((prev) => ({ ...prev, p2Color: option.key }))
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
                        draft.mode === "doubles" ? "Team 2" : "Player 2"
                      } color ${option.label}`}
                    />
                  );
                })}
              </View>

              {draft.mode === "doubles" ? (
                <View
                  style={[
                    styles.teamDivider,
                    isDark ? styles.teamDividerDark : null,
                  ]}
                />
              ) : null}
            </View>

            <View style={[styles.section, isDark ? styles.sectionDark : null]}>
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
                  Sets to Win
                </Text>
                <View style={styles.segmented}>
                  {[1, 2, 3].map((value) => (
                    <PrimaryButton
                      key={value}
                      label={`${value}`}
                      onPress={() =>
                        setDraft((prev) => ({
                          ...prev,
                          setsToWin: value as MatchConfig["setsToWin"],
                        }))
                      }
                      style={[
                        styles.segment,
                        draft.setsToWin === value
                          ? styles.segmentActive
                          : styles.segmentInactive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                  Advantage
                </Text>
                <Switch
                  value={draft.useAdvantage}
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, useAdvantage: value }))
                  }
                />
              </View>

              <View style={styles.rowBetween}>
                <Text style={[styles.label, isDark ? styles.labelDark : null]}>
                  Final Set Super TB
                </Text>
                <Switch
                  value={draft.finalSetType === "superTieBreak"}
                  onValueChange={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      finalSetType: value ? "superTieBreak" : "standard",
                    }))
                  }
                />
              </View>

              <View style={styles.numberGrid}>
                <View style={styles.numberField}>
                  <Text
                    style={[
                      styles.numberLabel,
                      isDark ? styles.numberLabelDark : null,
                    ]}
                  >
                    Tie-Break At
                  </Text>
                  <TextInput
                    value={String(draft.tieBreakAt)}
                    onChangeText={(value) =>
                      setDraft((prev) => ({
                        ...prev,
                        tieBreakAt: Math.max(1, Number(value) || 6),
                      }))
                    }
                    keyboardType="number-pad"
                    style={[
                      styles.numberInput,
                      isDark ? styles.numberInputDark : null,
                    ]}
                    placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
                  />
                </View>

                <View style={styles.numberField}>
                  <Text
                    style={[
                      styles.numberLabel,
                      isDark ? styles.numberLabelDark : null,
                    ]}
                  >
                    TB Points
                  </Text>
                  <TextInput
                    value={String(draft.tieBreakPoints)}
                    onChangeText={(value) =>
                      setDraft((prev) => ({
                        ...prev,
                        tieBreakPoints: Math.max(1, Number(value) || 7),
                      }))
                    }
                    keyboardType="number-pad"
                    style={[
                      styles.numberInput,
                      isDark ? styles.numberInputDark : null,
                    ]}
                    placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {showEndAction && onEndMatch ? (
            <PrimaryButton
              label="End Match"
              onPress={() => {
                onClose();
                onEndMatch();
              }}
              style={styles.endAction}
            />
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton
              label="Cancel"
              onPress={onClose}
              style={styles.cancelAction}
            />
            <PrimaryButton
              label="Apply"
              onPress={() => {
                onSave(draft);
                onClose();
              }}
              style={styles.applyAction}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.45)",
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    gap: 10,
    maxWidth: 560,
    padding: 14,
    width: "100%",
  },
  sheetDark: {
    backgroundColor: "#1A1330",
  },
  body: {
    maxHeight: 430,
  },
  bodyContent: {
    gap: 12,
  },
  section: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  sectionDark: {
    backgroundColor: "#261E44",
    borderColor: "#554584",
  },
  sectionTitle: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sectionTitleDark: {
    color: "#C4B5FD",
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
  },
  titleDark: {
    color: "#F5F3FF",
  },
  close: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },
  closeDark: {
    color: "#DDD6FE",
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
    backgroundColor: "#2A1F47",
    borderColor: "#6D5FA1",
    color: "#F5F3FF",
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  segmented: {
    flexDirection: "row",
    gap: 6,
  },
  segment: {
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  segmentActive: {
    backgroundColor: "#0F172A",
  },
  segmentInactive: {
    backgroundColor: "#94A3B8",
  },
  numberGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  numberField: {
    flex: 1,
  },
  numberLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  numberLabelDark: {
    color: "#DDD6FE",
  },
  numberInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 9,
    textAlign: "center",
  },
  numberInputDark: {
    backgroundColor: "#2A1F47",
    borderColor: "#6D5FA1",
    color: "#F5F3FF",
  },
  colorPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 2,
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
    backgroundColor: "#D9E2EC",
    height: 1,
    marginVertical: 2,
  },
  teamDividerDark: {
    backgroundColor: "#4C3D76",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  endAction: {
    backgroundColor: "#B91C1C",
    marginTop: 10,
  },
  cancelAction: {
    backgroundColor: "#64748B",
    flex: 1,
  },
  applyAction: {
    backgroundColor: "#0F172A",
    flex: 1,
  },
});
