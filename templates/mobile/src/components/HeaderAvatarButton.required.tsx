import React, { useMemo } from "react";
import { Pressable, Text } from "react-native";

import { useAuth } from "../providers/AuthProvider";
import { appGlobalStyles } from "../styles/appGlobalStyles";

const HeaderAvatarButton: React.FC = () => {
  const { currentUser } = useAuth();

  const label = useMemo(() => {
    if (!currentUser) return "⋯";
    return (currentUser.nickName?.[0] ?? "U").toUpperCase();
  }, [currentUser]);

  return (
    <Pressable style={appGlobalStyles.avatarButton}>
      <Text style={appGlobalStyles.avatarButtonText}>{label}</Text>
    </Pressable>
  );
};

export default HeaderAvatarButton;
