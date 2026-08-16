import { useEffect, useReducer, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Chip,
  Divider,
  IconButton,
  Stack,
  Card,
  CardContent,
  MenuItem,
  Menu,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import type { Post } from "../models/post";
import CommentEditor from "../components/shared/commentEditor";
import type { Comment } from "../models/comment";
import { useComments } from "../hooks/useComments";
import { useAuth } from "../contexts/authContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { commentReducer, initialState } from "../reducers/commentReducer";
import CommentCard from "../components/shared/commentCard";

export default function Read() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const postId = searchParams.get("id");

  const { getPostById } = usePosts();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const { createComment, updateComment, deleteComment } = useComments();
  const { user } = useAuth();

  const [state, dispatch] = useReducer(commentReducer, initialState);

  const [commentMenuAnchor, setCommentMenuAnchor] =
    useState<null | HTMLElement>(null);

  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

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
    if (!postId) {
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        dispatch({ type: "FETCH_START" });
        const response = await getPostById(postId);

        if (response) {
          setPost(response.post);
          dispatch({ type: "FETCH_SUCCESS", payload: response.comments });
        }
      } catch (err) {
        console.error("Failed to get post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);
  const handleCreateComment = async (content: string) => {
    if (!postId) return;
    try {
      const comment = await createComment(postId, content);
      dispatch({ type: "ADD_COMMENT", payload: comment });
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
      const response = await updateComment(ID, content);

      dispatch({ type: "UPDATE_COMMENT", payload: response });

      setSelectedComment(null);
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const handleDeleteComment = async (ID: string) => {
    try {
      const response = await deleteComment(ID);

      dispatch({ type: "DELETE_COMMENT", payload: response });

      setSelectedComment(null);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };
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
          {post.Title || "No Title"}
        </Typography>

        {/* Description */}
        {post.Description && (
          <Typography
            variant="h6"
            sx={{
              color: "#a6adc8",
              fontWeight: 400,
              mb: 2,
            }}
          >
            {post.Description}
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

          {post.UpdateTime && (
            <Typography variant="caption" sx={{ color: "#6c7086" }}>
              Updated {post.UpdateTime}
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
            __html: post.Content ?? "",
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
            {state.comments.length === 0 ? (
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
                  key={comment.ID}
                  sx={{
                    backgroundColor: "#313244",
                    border: "1px solid #45475a",
                    borderRadius: 2,
                    color: "#cdd6f4",
                  }}
                >
                  <CommentCard
                    key={comment.ID}
                    comment={comment}
                    currentUserId={user?.id}
                    onMenuOpen={handleCommentMenuOpen}
                  />
                </Card>
              ))
            )}
            <Menu
              anchorEl={commentMenuAnchor}
              open={Boolean(commentMenuAnchor)}
              onClose={handleCommentMenuClose}
            >
              <MenuItem
                onClick={() => {
                  if (selectedComment) {
                    handleEditComment(selectedComment);
                  }

                  handleCommentMenuClose();
                }}
              >
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Edit
              </MenuItem>

              <MenuItem
                onClick={() => {
                  if (selectedComment) {
                    handleDeleteComment(selectedComment.ID);
                  }

                  handleCommentMenuClose();
                }}
                sx={{
                  color: "#f38ba8",
                }}
              >
                <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </Menu>
          </Stack>

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
              content={editingComment?.Content ?? ""}
              onSubmit={async (content) => {
                if (editingComment) {
                  handleUpdateComment(editingComment.ID, content);
                } else {
                  handleCreateComment(content);
                }
              }}
              onCancel={() => {}}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
