import type { Comment } from "../../models/comment";

export type CommentState = {
  comments: Comment[];
  loading: boolean;
  error: string | null;
};
