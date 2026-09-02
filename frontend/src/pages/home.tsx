import SearchIcon from "@mui/icons-material/Search";
import {
	Grid,
	InputAdornment,
	Stack,
	Box,
	Button,
	CircularProgress,
	Divider,
	Typography,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/authContext";
import { Left } from "../components/shared/left";
import { Right } from "../components/shared/right";
import FilledTextField from "../components/common/filledTextField";
import { useAppTheme } from "../contexts/themeContext";
import { usePosts } from "../hooks/usePosts";
import PostCard from "../components/shared/postCard";
import type { FeedPost } from "../models/post";

function Home() {
	const { loading } = useAuth();
	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<Grid container spacing={1}>
			<Left />
			<Mid />
			<Right />
		</Grid>
	);
}

function Mid() {
	const { catppuccin } = useAppTheme();
	const { user } = useAuth();
	const { getPosts } = usePosts();

	const [posts, setPosts] = useState<FeedPost[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [cursorTime, setCursorTime] = useState<string | null>(null);
	const [cursorId, setCursorId] = useState<string | null>(null);

	const loadPosts = useCallback(
		async (isInitial = false) => {
			if (loading || (!hasMore && !isInitial)) return;

			setLoading(true);
			try {
				const newPosts = await getPosts(
					cursorTime ?? undefined,
					cursorId ?? undefined,
					20,
				);
				if (isInitial) {
					setPosts(newPosts);
				} else {
					setPosts((prev) => [...prev, ...newPosts]);
				}

				if (newPosts.length < 20) {
					setHasMore(false);
				} else {
					const lastPost = newPosts[newPosts.length - 1];
					setCursorTime(lastPost.createTime?.toString() ?? null);
					setCursorId(lastPost.id);
				}
			} catch (error) {
				console.error("Failed to load posts:", error);
			} finally {
				setLoading(false);
			}
		},
		[getPosts, cursorTime, cursorId, hasMore, loading],
	);

	useEffect(() => {
		loadPosts(true);
	}, []);

	const handleLoadMore = () => {
		loadPosts(false);
	};

	return (
		<Grid size={{ xs: 12, sm: 8, md: 8 }}>
			<Stack>
				{user && (
					<FilledTextField
						placeholder="What's on your mind?"
						sx={{
							"& .MuiInputAdornment-root": {
								color: catppuccin.subtext1,
							},
						}}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: catppuccin.mauve }} />
									</InputAdornment>
								),
							},
						}}
					/>
				)}
				<Box sx={{ width: "60%", margin: "auto" }}>
					{posts.length > 0 && <Divider />}
					{posts.map((post) => (
						<PostCard
							key={post.id}
							id={post.id}
							title={post.title || "No Title"}
							description={post.description}
							status={2}
							likes={post.likesCount}
							comments={post.commentsCount}
							reposts={post.repostsCount}
							thumbnail={post.thumbnail}
							onDelete={() => {
								setPosts((prev) => prev.filter((p) => p.id !== post.id));
							}}
						/>
					))}
				</Box>
				{hasMore && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
						<Button
							variant="outlined"
							onClick={handleLoadMore}
							disabled={loading}
							startIcon={loading ? <CircularProgress size={20} /> : null}
							sx={{ color: catppuccin.text }}
						>
							{loading ? "Loading..." : "Load More"}
						</Button>
					</Box>
				)}
				{!hasMore && posts.length > 0 && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
						<Typography variant="body2" sx={{ color: catppuccin.subtext1 }}>
							No more posts
						</Typography>
					</Box>
				)}
				{posts.length === 0 && !loading && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
						<Typography variant="body1" sx={{ color: catppuccin.subtext1 }}>
							No posts yet. Be the first to post!
						</Typography>
					</Box>
				)}
			</Stack>
		</Grid>
	);
}

export default Home;
