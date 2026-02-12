import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAuth } from "../providers/AuthProvider";
import LoginSlidingModal from "../screens/login/LoginSlidingModal";
import { appGlobalStyles } from "../styles/appGlobalStyles";

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
      <Pressable onPress={onPress} style={appGlobalStyles.avatarButton}>
        <Text style={appGlobalStyles.avatarButtonText}>{label}</Text>
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
