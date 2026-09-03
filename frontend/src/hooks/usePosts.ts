import axios from "axios";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../utils/endpoints";
import type { PostData } from "../models/postData";
import type { FeedPost } from "../models/post";
import { useAuth } from "../contexts/authContext";

export function usePosts() {
	const navigate = useNavigate();
	const { user } = useAuth();

	async function getPostsByUser(userId: string) {
		return await axios.get(`${endpoints.posts}/user/${userId}`, {
			withCredentials: true,
		});
	}

	async function getPosts(cursorTime?: string, cursorId?: string, limit = 20): Promise<FeedPost[]> {
		const params = new URLSearchParams();
		if (cursorTime) params.append("cursor_time", cursorTime);
		if (cursorId) params.append("cursor_id", cursorId);
		params.append("limit", limit.toString());


		const response = await axios.get<FeedPost[]>(`${endpoints.posts}?${params.toString()}`, {
			withCredentials: true,
		});

		return response.data;
	}

	async function getPostById(id: string): Promise<PostData> {
		const response = await axios.get<PostData>(`${endpoints.posts}/${id}`);

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
		description: string,
		thumbnailUrl: string | null,
	) {
		const response = await axios.patch(
			endpoints.posts,
			{
				id,
				title,
				content,
				status,
				description,
				thumbnailUrl,
			},
			{
				withCredentials: true,
			},
		);
		return response;
	}

	async function repost(postId: string): Promise<boolean> {
		const response = await axios.post(
			`${endpoints.posts}/repost/${postId}`,
			{},
			{
				withCredentials: true,
			},
		);
		return response.data.reposted;
	}

	async function unrepost(postId: string): Promise<boolean> {
		const response = await axios.delete(
			`${endpoints.posts}/repost/${postId}`,
			{
				withCredentials: true,
			},
		);
		return response.data.unreposted;
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
		getPosts,
		updatePostStatus,
		createPost,
		updatePost,
		repost,
		unrepost,
		getPostById,
	};
}
