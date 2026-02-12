import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAuth } from "../providers/AuthProvider";
import LoginSlidingModal from "../screens/login/LoginSlidingModal";

const circleStyle = {
  width: 34,
  height: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#111"
} as const;

const HeaderAvatarButton: React.FC = () => {
  const { currentUser } = useAuth();
  const [loginVisible, setLoginVisible] = useState(false);

  const isSignedIn = !!currentUser;

  const label = useMemo(() => {
    if (isSignedIn) {
      return (currentUser?.nickName?.[0] ?? "U").toUpperCase();
    }
    return "⋯";
  }, [currentUser, isSignedIn]);

  const onPress = () => {
    if (isSignedIn) {
      return;
    }
    setLoginVisible(true);
  };

  return (
    <View>
      <Pressable onPress={onPress} style={circleStyle}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>{label}</Text>
      </Pressable>
      <LoginSlidingModal
        loginModalVisible={loginVisible}
        closeLoginModal={() => setLoginVisible(false)}
        displayExplainingMessage
      />
    </View>
  );
};

export default HeaderAvatarButton;
