import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlayerColorKey, normalizePlayerColorKey } from "./playerColors";

const buildPreferredColorKey = (uid: string) =>
    `ace-trace:user-preferences:${uid}:preferred-color`;

export const loadPreferredColor = async (
    uid: string
): Promise<PlayerColorKey | null> => {
    const normalizedUid = uid.trim();
    if (!normalizedUid) {
        return null;
    }

    try {
        const value = await AsyncStorage.getItem(buildPreferredColorKey(normalizedUid));
        if (!value) {
            return null;
        }

        return normalizePlayerColorKey(value, "blue");
    } catch {
        return null;
    }
};

export const savePreferredColor = async (
    uid: string,
    color: PlayerColorKey
): Promise<void> => {
    const normalizedUid = uid.trim();
    if (!normalizedUid) {
        return;
    }

    await AsyncStorage.setItem(buildPreferredColorKey(normalizedUid), color);
};
