import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	IconButton,
	Modal,
	Snackbar,
	Stack,
	Typography,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import RepeatIcon from "@mui/icons-material/Repeat";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor } from "@tiptap/react";

import CommentEditor from "./commentEditor";
import { useComments } from "../../hooks/useComments";
import { useLikes } from "../../hooks/useLikes";
import { usePosts } from "../../hooks/usePosts";

import EditDeleteMenu from "../common/editDeleteMenu";
import { commentEditorExtensions } from "../common/commentEditorExtensions";
import { useAppTheme } from "../../contexts/themeContext";

type PostCardProps = {
	id: string;
	title: string;
	description?: string | null;
	thumbnail?: string | null;
	status: number;
	updatedAt?: string | null;

	likes?: number;
	comments?: number;
	reposts?: number;

	onClick?: () => void;
	onDelete: (id: string) => void;
};

const statusMap = {
	1: {
		label: "Draft",
		color: "default" as const,
	},
	2: {
		label: "Published",
		color: "success" as const,
	},
	3: {
		label: "Hidden",
		color: "warning" as const,
	},
};

export default function PostCard({
	id,
	title,
	description,
	thumbnail,
	status,
	updatedAt,
	likes = 0,
	comments = 0,
	reposts = 0,
	onClick,
	onDelete,
}: PostCardProps) {
	const { catppuccin } = useAppTheme();
	const navigate = useNavigate();

	const statusInfo = statusMap[status as keyof typeof statusMap];

	const { likePost, unlikePost, getLikeStatus } = useLikes();

	const { repost, unrepost } = usePosts();

	const { createComment, updateComment, deleteComment } = useComments();

	const [likeCount, setLikeCount] = useState(likes);
	const [repostCount, setRepostCount] = useState(reposts);

	const [isLiked, setIsLiked] = useState(false);
	const [isReposted, setIsReposted] = useState(false);

	const [open, setOpen] = useState(false);

	const [menuAnchor, setMenuAnchor] =
		useState<null | HTMLElement>(null);

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success" as "success" | "error",
	});

	const menuOpen = Boolean(menuAnchor);

	const editor = useEditor({
		extensions: commentEditorExtensions,
		content: "",
	});

	/*
	 * Get current like status.
	 */
	useEffect(() => {
		if (status === 1) {
			return;
		}

		const loadLikeStatus = async () => {
			try {
				const data = await getLikeStatus(id);

				if (data?.liked !== undefined) {
					setIsLiked(data.liked);
				}

				if (data?.likeCount !== undefined) {
					setLikeCount(data.likeCount);
				}
			} catch (err) {
				console.error(
					"Failed to get like status:",
					err,
				);
			}
		};

		loadLikeStatus();
	}, [id, status, getLikeStatus]);

	/*
	 * Like / unlike.
	 */
	const handleLike = async (
		event: React.MouseEvent,
	) => {
		event.stopPropagation();

		try {
			if (isLiked) {
				await unlikePost(id);

				setIsLiked(false);
				setLikeCount((prev) => Math.max(0, prev - 1));
			} else {
				await likePost(id);

				setIsLiked(true);
				setLikeCount((prev) => prev + 1);
			}
		} catch (err) {
			console.error(
				"Failed to update like:",
				err,
			);
		}
	};

	/*
	 * Repost / unrepost.
	 */
	const handleRepost = async (
		event: React.MouseEvent,
	) => {
		event.stopPropagation();

		try {
			if (isReposted) {
				await unrepost(id);

				setIsReposted(false);
				setRepostCount((prev) =>
					Math.max(0, prev - 1),
				);
			} else {
				await repost(id);

				setIsReposted(true);
				setRepostCount((prev) => prev + 1);
			}
		} catch (err) {
			console.error(
				"Failed to update repost:",
				err,
			);
		}
	};

	/*
	 * Card navigation.
	 */
	const handleCardClick = () => {
		if (onClick) {
			onClick();
			return;
		}

		if (status === 1) {
			navigate(`/compose?id=${id}`);
			return;
		}

		if (status === 2) {
			navigate(`/read?id=${id}`);
		}
	};

	/*
	 * More menu.
	 */
	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
	) => {
		event.stopPropagation();
		setMenuAnchor(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
	};

	/*
	 * Comment modal.
	 */
	const handleOpen = (
		event?: React.MouseEvent,
	) => {
		event?.stopPropagation();
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	/*
	 * Create comment.
	 */
	const handleCreateComment = async (
		postId: string,
		comment: string,
		replyTo?: string,
	) => {
		if (!postId.trim()) {
			console.error("Post ID is required");
			return;
		}

		if (!comment.trim()) {
			console.error("Comment cannot be empty");
			return;
		}

		try {
			await createComment(
				postId,
				comment,
				replyTo,
			);

			setSnackbar({
				open: true,
				message: "Comment created",
				severity: "success",
			});

			handleClose();
		} catch (error) {
			console.error(
				"Failed to create comment:",
				error,
			);

			setSnackbar({
				open: true,
				message: "Failed to create comment",
				severity: "error",
			});
		}
	};

	/*
	 * Update comment.
	 */
	const handleUpdateComment = async (
		commentId: string,
		comment: string,
	) => {
		if (!commentId.trim()) {
			console.error("Comment ID is required");
			return;
		}

		if (!comment.trim()) {
			console.error("Comment cannot be empty");
			return;
		}

		try {
			await updateComment(
				commentId,
				comment,
			);
		} catch (error) {
			console.error(
				"Failed to update comment:",
				error,
			);
		}
	};

	/*
	 * Delete comment.
	 */
	const handleDeleteComment = async (
		commentId: string,
	) => {
		if (!commentId.trim()) {
			console.error("Comment ID is required");
			return;
		}

		try {
			await deleteComment(commentId);
		} catch (error) {
			console.error(
				"Failed to delete comment:",
				error,
			);
		}
	};

	if (!editor) {
		return null;
	}

	return (
		<>
			<Card
				onClick={handleCardClick}
				sx={{
					cursor:
						onClick ||
							status === 1 ||
							status === 2
							? "pointer"
							: "default",

					backgroundColor:
						catppuccin.surface0,

					color: catppuccin.text,

					border: `1px solid ${catppuccin.surface1}`,

					borderRadius: 2,

					transition: "0.2s",

					marginTop: "16px",

					"&:hover":
						onClick ||
							status === 1 ||
							status === 2
							? {
								borderColor:
									catppuccin.mauve,

								transform:
									"translateY(-2px)",
							}
							: undefined,
				}}
			>
				<CardContent>
					<Stack spacing={1.5}>

						{/* Header */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent:
									"space-between",
								gap: 2,
							}}
						>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 600,
									color: catppuccin.text,
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
								{title || "No Title"}
							</Typography>

							<Box
								sx={{
									display: "flex",
									flexDirection:
										"column",
									alignItems:
										"center",
									flexShrink: 0,
								}}
							>
								<IconButton
									size="small"
									onClick={
										handleMenuOpen
									}
									sx={{
										color:
											catppuccin.subtext0,

										"&:hover": {
											backgroundColor:
												catppuccin.surface1,
										},
									}}
								>
									<MoreVertIcon fontSize="small" />
								</IconButton>

								<EditDeleteMenu
									anchorEl={
										menuAnchor
									}
									open={menuOpen}
									onClose={
										handleMenuClose
									}
									onClick={(event) =>
										event.stopPropagation()
									}
									onEdit={() => {
										setMenuAnchor(null);

										navigate(
											`/compose?id=${id}`,
										);
									}}
									onDelete={() => {
										setMenuAnchor(null);

										onDelete(id);
									}}
								/>

								{statusInfo && (
									<Chip
										label={
											statusInfo.label
										}
										color={
											statusInfo.color
										}
										size="small"
									/>
								)}
							</Box>
						</Box>

						{/* Description */}
						{description && (
							<Typography
								variant="body2"
								sx={{
									color:
										catppuccin.subtext0,

									display:
										"-webkit-box",

									WebkitLineClamp: 2,

									WebkitBoxOrient:
										"vertical",

									overflow: "hidden",
								}}
							>
								{description}
							</Typography>
						)}

						{thumbnail && (
							<Typography
								sx={{ mt: 1 }}
							>
								<img
									src={thumbnail}
									alt="Post thumbnail"
									sx={{ width: 100, height: 100, borderRadius: 2 }}
								/>
							</Typography>
						)}

						{/* Engagement */}
						{status !== 1 && (
							<Box
								sx={{
									display: "flex",
									alignItems:
										"center",
									gap: 1,
									color:
										catppuccin.subtext0,
								}}
							>
								{/* Like */}
								<IconButton
									size="small"
									onClick={
										handleLike
									}
									sx={{
										display: "flex",
										alignItems:
											"center",
										gap: 0.5,

										color: isLiked
											? catppuccin.red
											: catppuccin.subtext0,
									}}
								>
									{isLiked ? (
										<FavoriteIcon fontSize="small" />
									) : (
										<FavoriteBorderIcon fontSize="small" />
									)}

									<Typography variant="body2">
										{likeCount}
									</Typography>
								</IconButton>

								{/* Comments */}
								<IconButton
									size="small"
									onClick={
										handleOpen
									}
									sx={{
										display: "flex",
										alignItems:
											"center",
										gap: 0.5,

										color:
											catppuccin.subtext0,
									}}
								>
									<ChatBubbleOutlineIcon fontSize="small" />

									<Typography variant="body2">
										{comments}
									</Typography>
								</IconButton>

								{/* Repost */}
								<IconButton
									size="small"
									onClick={
										handleRepost
									}
									sx={{
										display: "flex",
										alignItems:
											"center",
										gap: 0.5,

										color: isReposted
											? catppuccin.green
											: catppuccin.subtext0,
									}}
								>
									<RepeatIcon fontSize="small" />

									<Typography variant="body2">
										{repostCount}
									</Typography>
								</IconButton>
							</Box>
						)}

						{/* Updated */}
						{updatedAt && (
							<Typography
								variant="caption"
								sx={{
									color:
										catppuccin.overlay0,
								}}
							>
								Updated {updatedAt}
							</Typography>
						)}
					</Stack>
				</CardContent>
			</Card>

			{/* Comment Modal */}
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="comment-modal-title"
			>
				<Box
					sx={{
						position:
							"absolute",
						top: "50%",
						left: "50%",
						transform:
							"translate(-50%, -50%)",

						width: 600,
						maxWidth: "90vw",

						bgcolor:
							catppuccin.base,

						border: `1px solid ${catppuccin.surface1}`,

						borderRadius: 2,

						color:
							catppuccin.text,

						boxShadow: 24,

						p: 3,
					}}
				>
					<Typography
						id="comment-modal-title"
						variant="h6"
						sx={{
							mb: 2,
							color:
								catppuccin.text,
							fontWeight: 600,
						}}
					>
						Write a comment
					</Typography>

					<CommentEditor
						onSubmit={(comment) =>
							handleCreateComment(
								id,
								comment,
							)
						}
						onCancel={
							handleClose
						}
					/>
				</Box>
			</Modal>

			{/* Snackbar */}
			<Snackbar
				open={
					snackbar.open
				}
				autoHideDuration={
					3000
				}
				onClose={() =>
					setSnackbar(
						(prev) => ({
							...prev,
							open: false,
						}),
					)
				}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
			>
				<Alert
					severity={
						snackbar.severity
					}
					variant="filled"
					onClose={() =>
						setSnackbar(
							(prev) => ({
								...prev,
								open: false,
							}),
						)
					}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}
