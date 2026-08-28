import axios from "axios";
import { endpoints } from "../utils/endpoints";

export function useLikes() {
  async function likePost(postId: string) {
    const response = await axios.post(
      `${endpoints.posts}/like/${postId}`,
      {},
      { withCredentials: true },
    );
    return response.data;
  }

  async function unlikePost(postId: string) {
    const response = await axios.delete(`${endpoints.posts}/like/${postId}`, {
      withCredentials: true,
    });
    return response.data;
  }

  async function getLikeStatus(postId: string) {
    const response = await axios.get(`${endpoints.posts}/like/${postId}`, {
      withCredentials: true,
    });
    return response.data;
  }

  return {
    likePost,
    unlikePost,
    getLikeStatus,
  };
}
