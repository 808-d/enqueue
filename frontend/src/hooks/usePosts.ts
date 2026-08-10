import axios from "axios";
import { endpoints } from "../utils/endpoints";

export function usePosts() {
  function getPostsByUser(userId: string) {}

  function updatePostStatus(id: string, status: number) {
    return async () => {
      await axios.post(endpoints.posts, {
        id,
        status,
      });
    };
  }

  function createPost(userId: string) {
    return async () => {
      await axios.post(endpoints.posts);
    };
  }

  return { getPostsByUser, updatePostStatus, createPost };
}
