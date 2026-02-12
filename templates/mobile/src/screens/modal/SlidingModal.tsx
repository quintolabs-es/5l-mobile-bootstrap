import React, { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { appStylesConstants } from "../../styles/appStylesConstants";
import { appGlobalStyles } from "../../styles/appGlobalStyles";

type SlidingModalProps = Readonly<{
  visible: boolean;
  close: () => void;
  children: ReactNode;
}>;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: appStylesConstants.colors.overlay,
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: appStylesConstants.colors.surface,
    paddingTop: appStylesConstants.spacing.sm,
    borderTopLeftRadius: appStylesConstants.radii.lg,
    borderTopRightRadius: appStylesConstants.radii.lg
  },
  closeRow: {
    alignItems: "flex-end",
    paddingHorizontal: appStylesConstants.spacing.md
  }
});

const SlidingModal: React.FC<SlidingModalProps> = ({ visible, close, children }) => {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.closeRow}>
            <Pressable onPress={close} hitSlop={10}>
              <Text style={appGlobalStyles.textButtonText}>Close</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default SlidingModal;
