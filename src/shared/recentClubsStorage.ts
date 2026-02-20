import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_CLUBS_KEY = "recent_clubs";

export const loadRecentClubs = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_CLUBS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
};

export const addRecentClub = async (topic: string): Promise<string[]> => {
  const normalized = topic.trim().toLowerCase();
  if (!normalized) {
    return loadRecentClubs();
  }

  const previous = await loadRecentClubs();
  const next = [
    normalized,
    ...previous.filter((club) => club !== normalized),
  ].slice(0, 6);

  try {
    await AsyncStorage.setItem(RECENT_CLUBS_KEY, JSON.stringify(next));
  } catch {
    return previous;
  }

  return next;
};

export const removeRecentClub = async (topic: string): Promise<string[]> => {
  const normalized = topic.trim().toLowerCase();
  const previous = await loadRecentClubs();
  const next = previous.filter((club) => club !== normalized);

  try {
    await AsyncStorage.setItem(RECENT_CLUBS_KEY, JSON.stringify(next));
  } catch {
    return previous;
  }

  return next;
};
