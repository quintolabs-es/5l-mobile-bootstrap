import React from "react";
import { View } from "react-native";
import LoginSlidingModal from "./LoginSlidingModal";

const LoginScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <LoginSlidingModal loginModalVisible closeLoginModal={() => {}} />
    </View>
  );
};

export default LoginScreen;

