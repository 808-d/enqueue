import type { Post } from "./post";
import type { Comment } from "./comment";

export type PostData = {
  post: Post;
  comments: Comment[];
};
