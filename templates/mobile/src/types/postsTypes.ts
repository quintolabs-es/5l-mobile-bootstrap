export type PostModel = {
  id: string;
  title: string;
};

export type PostsResponse = {
  viewerUserId: string | null;
  posts: PostModel[];
};
