import axios from "axios";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../utils/endpoints";
import type { Post } from "../models/post";

export function usePosts() {
  const navigate = useNavigate();

  async function getPostsByUser(userId: string) {
    return await axios.get(`${endpoints.posts}/p/${userId}`, {
      withCredentials: true,
    });
  }

  async function getPostById(id: string): Promise<Post> {
    const response = await axios.get<Post>(`${endpoints.posts}/${id}`);

    return response.data;
  }

  async function updatePostStatus(id: string) {
    await axios.patch(
      `${endpoints.posts}/${id}`,
      {
        id,
      },
      {
        withCredentials: true,
      },
    );
  }

  async function updatePost(
    id: string,
    title: string,
    content: string,
    status: number,
  ) {
    const response = await axios.patch(
      endpoints.posts,
      {
        id,
        title,
        content,
        status,
      },
      {
        withCredentials: true,
      },
    );
    return response;
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
    getPostById,
  };
}
