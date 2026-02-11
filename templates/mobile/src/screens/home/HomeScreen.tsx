import React, { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../App";
import HeaderAvatarButton from "../../components/HeaderAvatarButton";
import { useApiClient } from "../../providers/ApiClientProvider";
import { useLogger } from "../../providers/LoggerProvider";
import { AppError } from "../../AppError";
import { PostModel } from "../../types/postsTypes";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { getPostsAsync } = useApiClient();
  const logger = useLogger();

  const [posts, setPosts] = useState<PostModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderAvatarButton />
    });
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getPostsAsync();
        if (cancelled) return;
        setPosts(data);
      } catch (error) {
        logger.logException(new AppError("Failed to load posts", error));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getPostsAsync, logger]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <Text style={{ fontSize: 16, paddingVertical: 12 }}>{item.title}</Text>}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#eee" }} />}
          ListEmptyComponent={() => <Text style={{ color: "#666" }}>No posts yet</Text>}
        />
      )}
    </View>
  );
};

export default HomeScreen;
