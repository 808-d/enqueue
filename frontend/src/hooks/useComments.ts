import axios from "axios";
import { endpoints } from "../utils/endpoints";
import type { Comment } from "../models/comment";

export interface CommentsPageResult {
  comments: Comment[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export function useComments() {
  async function getComments(postId: string, page = 1, pageSize = 20): Promise<CommentsPageResult> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());

    const response = await axios.get<CommentsPageResult>(`${endpoints.comments}/post/${postId}?${params.toString()}`, {
      withCredentials: true,
    });

    return response.data;
  }

  async function createComment(
    postId: string,
    content: string,
    replyTo?: string,
  ) {
    const response = await axios.post(
      endpoints.comments,
      {
        PostId: postId,
        Content: content,
        ReplyTo: replyTo,
      },
      {
        withCredentials: true,
      },
    );

    return response.data;
  }

  async function updateComment(id: string, content: string) {
    const response = await axios.patch(
      endpoints.comments,
      {
        postId: id,
        content: content,
      },
      {
        withCredentials: true,
      },
    );
    return response.data;
  }

  async function deleteComment(id: string) {
    const response = await axios.patch(`${endpoints.comments}/${id}`, null, {
      withCredentials: true,
    });
    return response.data;
  }

  return {
    getComments,
    createComment,
    updateComment,
    deleteComment,
  };
}
