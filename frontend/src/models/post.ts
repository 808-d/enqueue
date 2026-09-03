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
  thumbnail: string | null;
  description: string | null;
  isLiked: boolean;
  isReposted: boolean;
};

// Profile post - for user profile page (no content, updateTime)
export type ProfilePost = {
  id: string;
  title: string | null;
  thumbnail: string | null;
  description: string | null;
  createTime: string | null;
  status: number;
  isLiked: boolean;
  isReposted: boolean;
};
