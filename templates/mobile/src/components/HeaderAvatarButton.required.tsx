import React, { useMemo } from "react";
import { Pressable, Text } from "react-native";

import { useAuth } from "../providers/AuthProvider";

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

  const label = useMemo(() => {
    if (!currentUser) return "⋯";
    return (currentUser.nickName?.[0] ?? "U").toUpperCase();
  }, [currentUser]);

  return (
    <Pressable style={circleStyle}>
      <Text style={{ color: "#fff", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
};

export default HeaderAvatarButton;

