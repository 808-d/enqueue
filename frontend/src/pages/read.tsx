import { useEffect, useReducer, useRef, useState, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
  Card,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import type { Post } from "../models/post";
import CommentEditor from "../components/shared/commentEditor";
import type { Comment } from "../models/comment";
import { useComments } from "../hooks/useComments";
import { useLikes } from "../hooks/useLikes";
import { useAuth } from "../contexts/authContext";
import { commentReducer, initialState } from "../reducers/commentReducer";
import CommentCard from "../components/shared/commentCard";
import EditDeleteMenu from "../components/common/editDeleteMenu";
import { endpoints } from "../utils/endpoints";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function Read() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const postId = searchParams.get("id");
  const { getPostById } = usePosts();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const { createComment, updateComment, deleteComment } = useComments();
  const { likePost, unlikePost, getLikeStatus } = useLikes();
  const { user } = useAuth();
  const { getComments } = useComments();
  const [state, dispatch] = useReducer(commentReducer, initialState);

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [commentMenuAnchor, setCommentMenuAnchor] =
    useState<null | HTMLElement>(null);

  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const [commentPage, setCommentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const wsConnectedRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const handleCommentMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    comment: Comment,
  ) => {
    event.stopPropagation();
    setCommentMenuAnchor(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleCommentMenuClose = () => {
    setCommentMenuAnchor(null);
    setSelectedComment(null);
  };

  useEffect(() => {
    if (!postId || postId === "") {
      setLoading(false);
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true; // set BEFORE the async call

    const fetchPost = async () => {
      try {
        dispatch({ type: "FETCH_START" });
        const response = await getPostById(postId);

        if (response) {
          setPost(response.post);

          // Fetch first page of comments with pagination info
          const commentsResult = await getComments(postId, 1, 10);
          dispatch({ type: "FETCH_SUCCESS", payload: commentsResult.comments });
          setCommentPage(commentsResult.currentPage);
          setCommentTotalPages(commentsResult.totalPages);

          // Fetch like status
          getLikeStatus(postId!).then((data) => {
            if (data.liked !== undefined) {
              setIsLiked(data.liked);
              setLikeCount(data.likeCount);
            }
          });
        }
      } catch (err) {
        console.error("Failed to get post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (!postId || wsConnectedRef.current) return;

    const wsUrl = endpoints.postHub(postId);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to post hub");
      wsConnectedRef.current = true;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "comment_created" && data.comment) {
          dispatch({ type: "ADD_COMMENT", payload: data.comment });
        } else if (data.type === "comment_updated" && data.comment) {
          dispatch({ type: "UPDATE_COMMENT", payload: data.comment });
        } else if (data.type === "comment_deleted" && data.commentId) {
          dispatch({ type: "DELETE_COMMENT", payload: data.commentId });
        }
      } catch (err) {
        console.error("Failed to parse websocket message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("Disconnected from post hub");
      wsConnectedRef.current = false;
    };

    return () => {
      ws.close();
    };
  }, [postId]);

  const handleCreateComment = async (content: string) => {
    if (!postId) return;
    try {
      await createComment(postId, content);
    } catch (err) {
      console.error("Failed to create comment:", err);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    handleCommentMenuClose();
  };

  const handleUpdateComment = async (ID: string, content: string) => {
    try {
      await updateComment(ID, content);
      setSelectedComment(null);
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const handleDeleteComment = async (ID: string) => {
    try {
      await deleteComment(ID);
      setSelectedComment(null);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleLike = async () => {
    if (!postId) return;
    if (isLiked) {
      try {
        await unlikePost(postId);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      } catch (err) {
        console.error("Failed to unlike post:", err);
      }
    } else {
      try {
        await likePost(postId);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      } catch (err) {
        console.error("Failed to like post:", err);
      }
    }
  };

  const goToPage = useCallback(
    async (page: number) => {
      if (
        postId === undefined ||
        postId === null ||
        postId === "" ||
        commentsLoading ||
        page < 1 ||
        page > commentTotalPages
      )
        return;
      setCommentsLoading(true);
      try {
        const result = await getComments(postId, page, 10);
        dispatch({ type: "FETCH_SUCCESS", payload: result.comments });
        setCommentPage(result.currentPage);
        setCommentTotalPages(result.totalPages);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setCommentsLoading(false);
      }
    },
    [postId, getComments, commentsLoading, commentTotalPages],
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1e1e2e",
        }}
      >
        <CircularProgress sx={{ color: "#cba6f7" }} />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#1e1e2e",
          color: "#cdd6f4",
          p: 4,
        }}
      >
        <Typography variant="h5">Post not found</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#1e1e2e",
        color: "#cdd6f4",
      }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Back button */}
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: "#cdd6f4",
            mb: 3,
            "&:hover": {
              backgroundColor: "#313244",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "#cdd6f4",
            mb: 1.5,
          }}
        >
          {post.title || "No Title"}
        </Typography>

        {/* Description */}
        {post.description && (
          <Typography
            variant="h6"
            sx={{
              color: "#a6adc8",
              fontWeight: 400,
              mb: 2,
            }}
          >
            {post.description}
          </Typography>
        )}

        {/* Metadata */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Chip
            label="Published"
            size="small"
            sx={{
              color: "#a6e3a1",
              backgroundColor: "#313244",
            }}
          />

          <IconButton
            sx={{
              color: isLiked ? "#f38ba8" : "#a6adc8",
              "&:hover": {
                backgroundColor: "#313244",
              },
            }}
            onClick={handleLike}
          >
            {isLiked ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </IconButton>
          <Typography variant="body2" sx={{ color: "#a6adc8", ml: 0.5 }}>
            {likeCount}
          </Typography>

          {post.updateTime && (
            <Typography variant="caption" sx={{ color: "#6c7086" }}>
              Updated {post.updateTime}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: "#45475a", mb: 4 }} />

        {/* Tiptap content */}
        <Box
          className="post-content"
          sx={{
            color: "#cdd6f4",
            fontSize: "1.05rem",
            lineHeight: 1.8,

            "& p": {
              margin: "0 0 1rem",
            },

            "& h1": {
              fontSize: "2rem",
              margin: "2rem 0 1rem",
            },

            "& h2": {
              fontSize: "1.6rem",
              margin: "1.75rem 0 1rem",
            },

            "& h3": {
              fontSize: "1.3rem",
              margin: "1.5rem 0 0.75rem",
            },

            "& a": {
              color: "#cba6f7",
            },

            "& blockquote": {
              borderLeft: "3px solid #cba6f7",
              margin: "1.5rem 0",
              paddingLeft: "1rem",
              color: "#a6adc8",
            },

            "& pre": {
              backgroundColor: "#181825",
              padding: "1rem",
              borderRadius: 1,
              overflowX: "auto",
            },

            "& code": {
              backgroundColor: "#313244",
              padding: "2px 5px",
              borderRadius: 1,
            },

            "& img": {
              maxWidth: "100%",
              borderRadius: 2,
            },

            "& ul, & ol": {
              paddingLeft: "2rem",
            },
          }}
          dangerouslySetInnerHTML={{
            __html: post.content ?? "",
          }}
        />
        <Divider
          sx={{
            borderColor: "#45475a",
            my: 5,
          }}
        />

        {/* Comments */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: "#cdd6f4",
              fontWeight: 600,
              mb: 3,
            }}
          >
            Comments
          </Typography>

          {/* Existing comments */}
          <Stack spacing={2}>
            {(state?.comments?.length ?? 0) === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  color: "#6c7086",
                }}
              >
                No comments yet.
              </Typography>
            ) : (
              state.comments.map((comment) => (
                <Card
                  key={comment.id}
                  sx={{
                    backgroundColor: "#313244",
                    border: "1px solid #45475a",
                    borderRadius: 2,
                    color: "#cdd6f4",
                  }}
                >
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    currentUser={user}
                    onMenuOpen={handleCommentMenuOpen}
                  />
                </Card>
              ))
            )}
            <EditDeleteMenu
              anchorEl={commentMenuAnchor}
              open={Boolean(commentMenuAnchor)}
              onClose={handleCommentMenuClose}
              onEdit={() => {
                if (selectedComment) {
                  handleEditComment(selectedComment);
                }
              }}
              onDelete={() => {
                if (selectedComment) {
                  handleDeleteComment(selectedComment.id);
                }

                handleCommentMenuClose();
              }}
            />
          </Stack>

          {commentTotalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant={commentPage === 1 ? "contained" : "outlined"}
                onClick={() => goToPage(commentPage - 1)}
                disabled={commentsLoading || commentPage === 1}
                sx={{ color: "#cdd6f4", borderColor: "#45475a", minWidth: 80 }}
              >
                Previous
              </Button>
              {Array.from({ length: commentTotalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={commentPage === pageNum ? "contained" : "outlined"}
                    onClick={() => goToPage(pageNum)}
                    disabled={commentsLoading || commentPage === pageNum}
                    sx={{
                      color: "#cdd6f4",
                      borderColor: "#45475a",
                      minWidth: 40,
                    }}
                  >
                    {pageNum}
                  </Button>
                ),
              )}
              <Button
                variant={
                  commentPage === commentTotalPages ? "contained" : "outlined"
                }
                onClick={() => goToPage(commentPage + 1)}
                disabled={commentsLoading || commentPage === commentTotalPages}
                sx={{ color: "#cdd6f4", borderColor: "#45475a", minWidth: 80 }}
              >
                Next
              </Button>
            </Box>
          )}

          {/* New comment */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#cdd6f4",
                mb: 1.5,
              }}
            >
              Write a comment
            </Typography>

            <CommentEditor
              content={editingComment?.content ?? ""}
              onSubmit={async (content) => {
                if (editingComment) {
                  await handleUpdateComment(editingComment.id, content);
                  setEditingComment(null);
                } else {
                  handleCreateComment(content);
                }
              }}
              onCancel={() => setEditingComment(null)}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
