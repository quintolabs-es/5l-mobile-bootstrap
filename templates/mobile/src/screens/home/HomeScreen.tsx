import React, { useLayoutEffect } from "react";
import { View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../App";
import HeaderAvatarButton from "../../components/HeaderAvatarButton";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderAvatarButton />
    });
  }, [navigation]);

  return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
};

export default HomeScreen;

