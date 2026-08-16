import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Modal,
  Stack,
  Typography,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import RepeatIcon from "@mui/icons-material/Repeat";

import { useState } from "react";

import { catppuccin } from "../../theme/catppuccinMocha";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import Link from "@tiptap/extension-link";

import CommentEditor from "./commentEditor";
import { useComments } from "../../hooks/useComments";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import { Menu, MenuItem } from "@mui/material";
type PostCardProps = {
  id: string;
  title: string;
  description?: string | null;
  status: number;
  updatedAt?: string | null;

  likes?: number;
  comments?: number;
  reposts?: number;

  onClick?: () => void;
  onDelete: (id: string) => void;
};

const statusMap = {
  1: { label: "Draft", color: "default" as const },
  2: { label: "Published", color: "success" as const },
  3: { label: "Hidden", color: "warning" as const },
};

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "90vw",
  bgcolor: catppuccin.base,
  border: `1px solid ${catppuccin.surface1}`,
  borderRadius: 2,
  color: catppuccin.text,
  boxShadow: 24,
  p: 3,
};

export default function PostCard({
  id,
  title,
  description,
  status,
  updatedAt,
  likes = 0,
  comments = 0,
  reposts = 0,
  onClick,
  onDelete,
}: PostCardProps) {
  const statusInfo = statusMap[status as keyof typeof statusMap];

  const [open, setOpen] = useState(false);
  const { createComment, updateComment, deleteComment } = useComments();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,

      Underline,

      Image,

      Emoji.configure({
        emojis: gitHubEmojis,
        enableEmoticons: true,
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
      }),
    ],

    content: "",
  });

  const handleCreateComment = async (
    id: string,
    comment: string,
    replyTo?: string,
  ) => {
    if (!id.trim()) {
      console.error("Post ID is required");
      return;
    }

    if (!comment.trim()) {
      console.error("Comment cannot be empty");
      return;
    }

    try {
      await createComment(id, comment, replyTo);
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleUpdateComment = async (id: string, comment: string) => {
    if (!id.trim()) {
      console.error("Comment ID is required");
      return;
    }

    if (!comment.trim()) {
      console.error("Comment cannot be empty");
      return;
    }

    try {
      await updateComment(id, comment);
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!id.trim()) {
      console.error("Comment ID is required");
      return;
    }

    try {
      await deleteComment(id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };
  if (!editor) {
    return null;
  }

  return (
    <>
      <Card
        onClick={onClick}
        sx={{
          cursor: onClick ? "pointer" : "default",
          backgroundColor: "#313244",
          color: "#cdd6f4",
          border: "1px solid #45475a",
          borderRadius: 2,
          transition: "0.2s",

          "&:hover": onClick
            ? {
                borderColor: "#cba6f7",
                transform: "translateY(-2px)",
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
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#cdd6f4",
                }}
              >
                {title || "No Title"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{
                    color: "#a6adc8",
                    "&:hover": {
                      backgroundColor: "#45475a",
                    },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={menuAnchor}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null);
                      onClick?.();
                    }}
                  >
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Edit
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null);
                      onDelete(id);
                    }}
                    sx={{
                      color: "#f38ba8",
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                  </MenuItem>
                </Menu>

                {statusInfo && (
                  <Chip
                    label={statusInfo.label}
                    color={statusInfo.color}
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
                  color: "#a6adc8",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </Typography>
            )}

            {/* Engagement */}
            {status !== 1 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: "#a6adc8",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <FavoriteBorderIcon fontSize="small" />

                  <Typography variant="body2">{likes}</Typography>
                </Box>

                <IconButton
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "#a6adc8",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpen();
                  }}
                >
                  <ChatBubbleOutlineIcon fontSize="small" />

                  <Typography variant="body2">{comments}</Typography>
                </IconButton>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <RepeatIcon fontSize="small" />

                  <Typography variant="body2">{reposts}</Typography>
                </Box>
              </Box>
            )}

            {/* Updated */}
            {updatedAt && (
              <Typography
                variant="caption"
                sx={{
                  color: "#6c7086",
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
        <Box sx={style}>
          <Typography
            id="comment-modal-title"
            variant="h6"
            sx={{
              mb: 2,
              color: catppuccin.text,
              fontWeight: 600,
            }}
          >
            Write a comment
          </Typography>

          <CommentEditor
            onSubmit={(comment) => {
              handleCreateComment?.(id, comment);
              handleClose();
            }}
            onCancel={handleClose}
          />
        </Box>
      </Modal>
    </>
  );
}
