export type Post = {
  id: string;
  title: string | null;
  content: string | null;
  thumbnail: string | null;
  description: string | null;
  createTime: string | null;
  updateTime: string | null;
  status: number;
};

export type FeedPost = {
  id: string;
  title: string | null;
  username: string;
  avatar: string | null;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  score: number;
  createTime: number | null;
};
