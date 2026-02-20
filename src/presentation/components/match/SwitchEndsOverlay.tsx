import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const SwitchEndsOverlay: React.FC = () => {
  return (
    <View style={styles.switchOverlay} pointerEvents="none">
      <View style={styles.switchAlert}>
        <Text style={styles.switchAlertText}>↺ Switch Ends</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  switchOverlay: {
    alignItems: "center",
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -16 }],
    zIndex: 35,
  },
  switchAlert: {
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderColor: "#FCD34D",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  switchAlertText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
