import axios from "axios";
import { endpoints } from "../utils/endpoints";

export function useComments() {
  async function getComments(postId: string) {
    return await axios.get("", { withCredentials: true });
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
        id: id,
        content: content,
      },
      {
        withCredentials: true,
      },
    );
    return response.data;
  }

  async function deleteComment(id: string) {
    const response = await axios.patch(`${endpoints.comments}/${id}`, {
      withCredentials: true,
    });
    return response.data;
  }

  return {
    createComment,
    updateComment,
    deleteComment,
  };
}
