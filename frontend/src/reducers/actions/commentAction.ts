import type { Comment } from "../../models/comment";

export type CommentAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Comment[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "ADD_COMMENT"; payload: Comment }
  | { type: "UPDATE_COMMENT"; payload: Comment }
  | { type: "DELETE_COMMENT"; payload: { ID: string } };
