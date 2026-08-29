import type { Comment } from "../models/comment";
import type { CommentAction } from "./actions/commentAction";
import type { CommentState } from "./states/commentState";

export const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null,
};

export function commentReducer(
  state: CommentState,
  action: CommentAction,
): CommentState {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        comments: Array.isArray(action.payload) ? action.payload : [],
      };

    case "ADD_COMMENT":
      return {
        ...state,
        comments: [...state.comments, action.payload],
      };

    case "UPDATE_COMMENT":
      return {
        ...state,
        comments: state.comments.map((c) =>
          c.ID === action.payload.ID ? action.payload : c,
        ),
      };

    case "DELETE_COMMENT":
      return {
        ...state,
        comments: state.comments.filter((c) => c.ID !== action.payload),
      };

    default:
      return state;
  }
}
