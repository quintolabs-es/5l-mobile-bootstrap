import React, { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../App";
import HeaderAvatarButton from "../../components/HeaderAvatarButton";
import { useApiClient } from "../../providers/ApiClientProvider";
import { useLogger } from "../../providers/LoggerProvider";
import { AppError } from "../../AppError";
import { PostModel } from "../../types/postsTypes";
import { appStylesConstants } from "../../styles/appStylesConstants";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStylesConstants.colors.background,
    padding: appStylesConstants.spacing.lg
  },
  itemText: {
    fontSize: appStylesConstants.text.body,
    paddingVertical: appStylesConstants.spacing.md,
    color: appStylesConstants.colors.textPrimary
  },
  separator: {
    height: 1,
    backgroundColor: appStylesConstants.colors.separator
  },
  emptyText: {
    color: appStylesConstants.colors.textSecondary
  }
});

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
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator color={appStylesConstants.activityIndicator.color} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <Text style={styles.itemText}>{item.title}</Text>}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => <Text style={styles.emptyText}>No posts yet</Text>}
        />
      )}
    </View>
  );
};

export default HomeScreen;
