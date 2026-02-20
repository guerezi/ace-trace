import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";

interface LandingScreenProps {
  recentClubs: string[];
  userEmail: string | null;
  isAuthenticated: boolean;
  onConnectClub: (topic: string) => void;
  onRemoveRecentClub: (topic: string) => void;
  onOffline: () => void;
  onAuth: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  recentClubs,
  userEmail,
  isAuthenticated,
  onConnectClub,
  onRemoveRecentClub,
  onOffline,
  onAuth,
}) => {
  const isDark = useColorScheme() === "dark";
  const [topicDraft, setTopicDraft] = React.useState("");

  const submitTopic = () => {
    const value = topicDraft.trim();
    if (!value) {
      return;
    }

    onConnectClub(value);
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : null]}>
      <Pressable onPress={onAuth} style={styles.authAction}>
        {isAuthenticated ? (
          <Text
            style={[
              styles.authActionText,
              isDark ? styles.authActionTextDark : null,
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

      <View style={styles.content}>
        <View style={styles.heroWrap}>
          <Text style={[styles.title, isDark ? styles.titleDark : null]}>
            AceTrace Live
          </Text>
          <Text style={[styles.subtitle, isDark ? styles.subtitleDark : null]}>
            Join a club to watch matches, or play offline.
          </Text>
        </View>

        <View style={[styles.card, isDark ? styles.cardDark : null]}>
          <TextInput
            value={topicDraft}
            onChangeText={setTopicDraft}
            placeholder="Enter club ID (e.g. btc)"
            placeholderTextColor={isDark ? "#A78BFA" : "#64748B"}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={submitTopic}
            style={[styles.input, isDark ? styles.inputDark : null]}
          />

          <Pressable
            onPress={submitTopic}
            disabled={!topicDraft.trim()}
            style={[
              styles.primaryAction,
              !topicDraft.trim() ? styles.primaryActionDisabled : null,
            ]}
          >
            <Text style={styles.primaryActionText}>Go to Club</Text>
          </Pressable>

          <View style={styles.separatorRow}>
            <View
              style={[styles.separator, isDark ? styles.separatorDark : null]}
            />
            <Text
              style={[
                styles.separatorLabel,
                isDark ? styles.separatorLabelDark : null,
              ]}
            >
              OR
            </Text>
            <View
              style={[styles.separator, isDark ? styles.separatorDark : null]}
            />
          </View>

          <Pressable
            onPress={onOffline}
            style={[
              styles.secondaryAction,
              isDark ? styles.secondaryActionDark : null,
            ]}
          >
            <Text
              style={[
                styles.secondaryActionText,
                isDark ? styles.secondaryActionTextDark : null,
              ]}
            >
              Play Offline
            </Text>
          </Pressable>
        </View>

        {recentClubs.length > 0 ? (
          <View style={styles.recentsWrap}>
            <Text
              style={[
                styles.recentsTitle,
                isDark ? styles.recentsTitleDark : null,
              ]}
            >
              Recent Clubs
            </Text>
            <View style={styles.recentsGrid}>
              {recentClubs.map((club) => (
                <Pressable
                  key={club}
                  onPress={() => onConnectClub(club)}
                  style={[
                    styles.recentClubCard,
                    isDark ? styles.recentClubCardDark : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.recentClubText,
                      isDark ? styles.recentClubTextDark : null,
                    ]}
                  >
                    {club.toUpperCase()}
                  </Text>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      onRemoveRecentClub(club);
                    }}
                    style={styles.removeRecentButton}
                  >
                    <Ionicons
                      name="close"
                      size={12}
                      color={isDark ? "#DDD6FE" : "#64748B"}
                    />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F5F9",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  containerDark: {
    backgroundColor: "#090714",
  },
  authAction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    top: 16,
    width: 34,
  },
  authActionText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900",
  },
  authActionTextDark: {
    color: "#E9D5FF",
  },
  content: {
    alignSelf: "center",
    gap: 14,
    maxWidth: 460,
    width: "100%",
  },
  heroWrap: {
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: "#0F172A",
    fontSize: 34,
    fontWeight: "900",
  },
  titleDark: {
    color: "#F5F3FF",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
  subtitleDark: {
    color: "#C4B5FD",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  cardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputDark: {
    backgroundColor: "#261E44",
    borderColor: "#554584",
    color: "#F5F3FF",
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingVertical: 13,
  },
  primaryActionDisabled: {
    opacity: 0.5,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  separatorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  separator: {
    backgroundColor: "#E2E8F0",
    flex: 1,
    height: 1,
  },
  separatorDark: {
    backgroundColor: "#4C3D76",
  },
  separatorLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  separatorLabelDark: {
    color: "#A78BFA",
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    paddingVertical: 12,
  },
  secondaryActionDark: {
    backgroundColor: "#2A1F47",
  },
  secondaryActionText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  secondaryActionTextDark: {
    color: "#DDD6FE",
  },
  recentsWrap: {
    gap: 8,
  },
  recentsTitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  recentsTitleDark: {
    color: "#A78BFA",
  },
  recentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recentClubCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  recentClubCardDark: {
    backgroundColor: "#1A1330",
    borderColor: "#4C3D76",
  },
  recentClubText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },
  recentClubTextDark: {
    color: "#E9D5FF",
  },
  removeRecentButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
});
