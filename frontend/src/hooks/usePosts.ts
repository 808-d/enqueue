import axios from "axios";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../utils/endpoints";

export function usePosts() {
  const navigate = useNavigate();

  function getPostsByUser(userId: string) {
    // ...
  }

  async function updatePostStatus(id: string, status: number) {
    await axios.patch(endpoints.posts, {
      id,
      status,
    });
  }
  async function updatePost(id: string, content: string, status: number) {
    await axios.patch(endpoints.posts, {
      id,
      content,
      status,
    });
  }

  async function createPost() {
    try {
      const response = await axios.post(
        endpoints.posts,
        {},
        {
          withCredentials: true,
        },
      );

      const post = response.data;

      navigate(`/compose?id=${post.ID}`);
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  }

  return {
    getPostsByUser,
    updatePostStatus,
    createPost,
    updatePost,
  };
}
