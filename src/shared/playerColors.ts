export type PlayerColorKey =
  | "blue"
  | "red"
  | "green"
  | "orange"
  | "purple"
  | "pink"
  | "indigo"
  | "teal"
  | "cyan"
  | "amber";

export interface PlayerColorTheme {
  key: PlayerColorKey;
  label: string;
  solid: string;
  border: string;
  text: string;
  lightSurface: string;
  lightGradient: readonly [string, string, string];
  darkGradient: readonly [string, string, string];
  badgeLight: string;
  badgeDark: string;
}

export const PLAYER_COLOR_THEMES: Record<PlayerColorKey, PlayerColorTheme> = {
  blue: {
    key: "blue",
    label: "Blue",
    solid: "#2563EB",
    border: "#1D4ED8",
    text: "#1E3A8A",
    lightSurface: "#EFF6FF",
    lightGradient: ["#DBEAFE", "#EFF6FF", "#FFFFFF"],
    darkGradient: [
      "rgba(30, 58, 138, 0.52)",
      "rgba(88, 28, 135, 0.24)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(29, 78, 216, 0.12)",
    badgeDark: "rgba(147, 197, 253, 0.18)",
  },
  red: {
    key: "red",
    label: "Red",
    solid: "#DC2626",
    border: "#B91C1C",
    text: "#7F1D1D",
    lightSurface: "#FEF2F2",
    lightGradient: ["#FEE2E2", "#FEF2F2", "#FFFFFF"],
    darkGradient: [
      "rgba(127, 29, 29, 0.5)",
      "rgba(88, 28, 135, 0.24)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(220, 38, 38, 0.12)",
    badgeDark: "rgba(252, 165, 165, 0.18)",
  },
  green: {
    key: "green",
    label: "Green",
    solid: "#059669",
    border: "#047857",
    text: "#065F46",
    lightSurface: "#ECFDF5",
    lightGradient: ["#D1FAE5", "#ECFDF5", "#FFFFFF"],
    darkGradient: [
      "rgba(6, 95, 70, 0.5)",
      "rgba(16, 185, 129, 0.22)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(5, 150, 105, 0.12)",
    badgeDark: "rgba(110, 231, 183, 0.16)",
  },
  orange: {
    key: "orange",
    label: "Orange",
    solid: "#EA580C",
    border: "#C2410C",
    text: "#9A3412",
    lightSurface: "#FFF7ED",
    lightGradient: ["#FFEDD5", "#FFF7ED", "#FFFFFF"],
    darkGradient: [
      "rgba(154, 52, 18, 0.55)",
      "rgba(249, 115, 22, 0.22)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(234, 88, 12, 0.12)",
    badgeDark: "rgba(253, 186, 116, 0.16)",
  },
  purple: {
    key: "purple",
    label: "Purple",
    solid: "#9333EA",
    border: "#7E22CE",
    text: "#6B21A8",
    lightSurface: "#FAF5FF",
    lightGradient: ["#F3E8FF", "#FAF5FF", "#FFFFFF"],
    darkGradient: [
      "rgba(107, 33, 168, 0.55)",
      "rgba(168, 85, 247, 0.22)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(147, 51, 234, 0.12)",
    badgeDark: "rgba(216, 180, 254, 0.17)",
  },
  pink: {
    key: "pink",
    label: "Pink",
    solid: "#DB2777",
    border: "#BE185D",
    text: "#9D174D",
    lightSurface: "#FDF2F8",
    lightGradient: ["#FCE7F3", "#FDF2F8", "#FFFFFF"],
    darkGradient: [
      "rgba(157, 23, 77, 0.55)",
      "rgba(236, 72, 153, 0.22)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(219, 39, 119, 0.12)",
    badgeDark: "rgba(244, 114, 182, 0.18)",
  },
  indigo: {
    key: "indigo",
    label: "Indigo",
    solid: "#4F46E5",
    border: "#4338CA",
    text: "#312E81",
    lightSurface: "#EEF2FF",
    lightGradient: ["#E0E7FF", "#EEF2FF", "#FFFFFF"],
    darkGradient: [
      "rgba(49, 46, 129, 0.56)",
      "rgba(79, 70, 229, 0.24)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(79, 70, 229, 0.12)",
    badgeDark: "rgba(165, 180, 252, 0.18)",
  },
  teal: {
    key: "teal",
    label: "Teal",
    solid: "#0D9488",
    border: "#0F766E",
    text: "#134E4A",
    lightSurface: "#F0FDFA",
    lightGradient: ["#CCFBF1", "#F0FDFA", "#FFFFFF"],
    darkGradient: [
      "rgba(19, 78, 74, 0.55)",
      "rgba(13, 148, 136, 0.22)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(13, 148, 136, 0.12)",
    badgeDark: "rgba(153, 246, 228, 0.18)",
  },
  cyan: {
    key: "cyan",
    label: "Cyan",
    solid: "#0891B2",
    border: "#0E7490",
    text: "#164E63",
    lightSurface: "#ECFEFF",
    lightGradient: ["#CFFAFE", "#ECFEFF", "#FFFFFF"],
    darkGradient: [
      "rgba(22, 78, 99, 0.55)",
      "rgba(8, 145, 178, 0.22)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(8, 145, 178, 0.12)",
    badgeDark: "rgba(165, 243, 252, 0.18)",
  },
  amber: {
    key: "amber",
    label: "Amber",
    solid: "#D97706",
    border: "#B45309",
    text: "#78350F",
    lightSurface: "#FFFBEB",
    lightGradient: ["#FEF3C7", "#FFFBEB", "#FFFFFF"],
    darkGradient: [
      "rgba(120, 53, 15, 0.58)",
      "rgba(217, 119, 6, 0.24)",
      "rgba(15, 23, 42, 0.08)",
    ],
    badgeLight: "rgba(217, 119, 6, 0.14)",
    badgeDark: "rgba(253, 230, 138, 0.2)",
  },
};

export const PLAYER_COLOR_OPTIONS = Object.values(PLAYER_COLOR_THEMES);

export const normalizePlayerColorKey = (
  value: string | undefined,
  fallback: PlayerColorKey
): PlayerColorKey => {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized in PLAYER_COLOR_THEMES) {
    return normalized as PlayerColorKey;
  }

  return fallback;
};

export const resolvePlayerColorTheme = (
  value: string | undefined,
  fallback: PlayerColorKey
): PlayerColorTheme => {
  const key = normalizePlayerColorKey(value, fallback);
  return PLAYER_COLOR_THEMES[key];
};
