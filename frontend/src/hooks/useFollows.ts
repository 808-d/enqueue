import axios from "axios";
import { endpoints } from "../utils/endpoints";
import type { NotiResponse } from "../models/notiResponse";

export function useFollows() {
  async function followUser(followingId: string): Promise<NotiResponse> {
    const response = await axios.post<NotiResponse>(
      endpoints.follows,
      { followingId },
      { withCredentials: true },
    );
    return response.data;
  }

  async function unfollowUser(followingId: string): Promise<void> {
    await axios.delete(endpoints.follows, {
      data: { followingId },
      withCredentials: true,
    });
  }

  async function getFollowers(userId: string) {
    return await axios.get(`${endpoints.follows}/followers/${userId}`, {
      withCredentials: true,
    });
  }

  async function getFollowing(userId: string) {
    return await axios.get(`${endpoints.follows}/following/${userId}`, {
      withCredentials: true,
    });
  }

  async function isFollowing(followingId: string): Promise<boolean> {
    const response = await axios.post<{ isFollowing: boolean }>(
      `${endpoints.follows}/is-following`,
      { followingId },
      { withCredentials: true },
    );
    return response.data.isFollowing;
  }

  async function countFollowers(userId: string): Promise<number> {
    const response = await axios.get<{ count: number }>(
      `${endpoints.follows}/count/followers/${userId}`,
      { withCredentials: true },
    );
    return response.data.count;
  }

  async function countFollowing(userId: string): Promise<number> {
    const response = await axios.get<{ count: number }>(
      `${endpoints.follows}/count/following/${userId}`,
      { withCredentials: true },
    );
    return response.data.count;
  }

  return {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing,
    countFollowers,
    countFollowing,
  };
}
