import React, { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type SlidingModalProps = Readonly<{
  visible: boolean;
  close: () => void;
  children: ReactNode;
}>;

const SlidingModal: React.FC<SlidingModalProps> = ({ visible, close, children }) => {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#fff", paddingTop: 8, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <View style={{ alignItems: "flex-end", paddingHorizontal: 12 }}>
            <Pressable onPress={close} hitSlop={10}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Close</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default SlidingModal;

