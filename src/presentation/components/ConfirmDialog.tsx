import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmLabel}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(2,6,23,0.55)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    maxWidth: 480,
    padding: 16,
    width: "100%",
  },
  title: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  message: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 11,
  },
  cancelButton: {
    backgroundColor: "#E2E8F0",
  },
  confirmButton: {
    backgroundColor: "#B91C1C",
  },
  cancelLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },
  confirmLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
