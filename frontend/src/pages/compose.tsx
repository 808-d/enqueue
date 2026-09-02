import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  Tooltip,
} from "@mui/material";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import ImageResize from "tiptap-extension-resize-image";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import { TableKit } from "@tiptap/extension-table";
import Link from "@tiptap/extension-link";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ImageIcon from "@mui/icons-material/Image";
import TableChartSharpIcon from "@mui/icons-material/TableChartSharp";

import { useCloudinary } from "../hooks/useCloudinary";
import { usePosts } from "../hooks/usePosts";
import { useSearchParams, useNavigate } from "react-router-dom";

import enqueueLogo from "../assets/enqueue.svg";

import type { Post } from "../models/post";

import { LinkWidget } from "../components/shared/linkWidget";
import EmojiPickerPopover from "../components/common/emojiPickerPopover";
import { useAppTheme } from "../contexts/themeContext";

const colors = [
  "#cba6f7",
  "#f38ba8",
  "#fab387",
  "#f9e2af",
  "#a6e3a1",
  "#94e2d5",
  "#89dceb",
  "#89b4fa",
  "#f5c2e7",
  "#cdd6f4",
];

const highlights = [
  "#f38ba8",
  "#fab387",
  "#f9e2af",
  "#a6e3a1",
  "#94e2d5",
  "#89b4fa",
  "#cba6f7",
];

const Compose = () => {
  const { catppuccin } = useAppTheme();

  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [highlightAnchor, setHighlightAnchor] = useState<HTMLElement | null>(
    null,
  );

  const [searchParams] = useSearchParams();
  const postId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const { uploadImage } = useCloudinary();
  const { updatePost, getPostById } = usePosts();

  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),

      Underline,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      TextStyle,

      Color,

      Highlight.configure({
        multicolor: true,
      }),

      ImageResize.configure({
        minWidth: 50,
        maxWidth: 990,
        inline: true,
      }),

      Emoji.configure({
        emojis: gitHubEmojis,
        enableEmoticons: true,
      }),

      TableKit.configure({
        table: {
          resizable: true,
        },
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        markdownLinks: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],

        isAllowedUri: (url, ctx) => {
          try {
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            const disallowedProtocols = ["ftp", "file", "mailto"];

            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme,
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            return true;
          } catch {
            return false;
          }
        },
      }),
    ],
    content: "",
  });

  // Fetch existing post when editing.
  const pendingContentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!postId) {
      return;
    }

    let cancelled = false;

    const fetchPost = async () => {
      try {
        const response = await getPostById(postId);

        if (cancelled) {
          return;
        }

        if (response?.post) {
          const post = response.post;

          setTitle(post.title ?? "");
          setDescription(post.description ?? "");
          setThumbnailUrl(post.thumbnail ?? null);

          if (post.content) {
            if (editor) {
              editor.commands.setContent(post.content);
            } else {
              pendingContentRef.current = post.content;
            }
          }
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to get post:", err);
      }
    };

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [postId, getPostById]);

  // Apply pending content when editor becomes ready
  useEffect(() => {
    if (editor && pendingContentRef.current) {
      editor.commands.setContent(pendingContentRef.current);
      pendingContentRef.current = null;
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const toggleColorMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorAnchor(event.currentTarget);
  };

  const toggleHighlightMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHighlightAnchor(event.currentTarget);
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const result = await uploadImage(file, "enqueue/posts");

      if (!result) {
        return;
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: result.url,
        })
        .run();
    } finally {
      event.target.value = "";
    }
  };

  const handleThumbnail = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const result = await uploadImage(file, "enqueue/posts");

      if (!result) {
        return;
      }

      setThumbnailUrl(result.url);
    } finally {
      event.target.value = "";
    }
  };

  const insertTable = () => {
    editor.commands.insertTable({
      rows: 3,
      cols: 3,
      withHeaderRow: true,
    });
  };

  const handleUpdatePost = async (id: string, status: number) => {
    try {
      const content = editor.getHTML();

      const nextTitle = title.trim() || "No title";

      await updatePost(
        id,
        nextTitle,
        content,
        status,
        description,
        thumbnailUrl,
      );

      setSnackbar({
        open: true,
        message:
          status === 1
            ? "Draft saved successfully"
            : "Post published successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to update post:", err);

      setSnackbar({
        open: true,
        message:
          status === 1 ? "Failed to save draft" : "Failed to publish post",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: catppuccin.base,
        color: catppuccin.text,
        py: 4,
      }}
    >
      {/* Logo */}
      <Button
        variant="text"
        onClick={() => navigate("/")}
        sx={{
          textTransform: "none",
          width: "fit-content",
          float: "left",
        }}
      >
        <img
          src={enqueueLogo}
          alt="Enqueue"
          style={{
            width: "50px",
          }}
        />
      </Button>

      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          px: 3,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            gap: 3,
          }}
        >
          <Box
            component="input"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 0,
              bgcolor: "transparent",
              border: "none",
              outline: "none",
              color: catppuccin.text,
              fontSize: "2rem",
              fontWeight: 800,

              "&::placeholder": {
                color: catppuccin.overlay0,
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              disabled={!postId}
              onClick={() => {
                if (postId) {
                  handleUpdatePost(postId, 1);
                }
              }}
              sx={{
                textTransform: "none",
                color: catppuccin.text,
                borderColor: catppuccin.surface1,
              }}
            >
              Save
            </Button>

            <Button
              variant="contained"
              disabled={!postId}
              onClick={() => {
                if (postId) {
                  handleUpdatePost(postId, 2);
                }
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: catppuccin.mauve,
                color: catppuccin.base,

                "&:hover": {
                  bgcolor: catppuccin.pink,
                },
              }}
            >
              Publish
            </Button>
          </Box>
        </Box>

        {/* Post metadata */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "220px 1fr",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Thumbnail */}
          <Box>
            <TypographyLabel color={catppuccin.subtext0}>
              Thumbnail
            </TypographyLabel>

            {thumbnailUrl ? (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  overflow: "hidden",
                  borderRadius: 2,
                  border: `1px solid ${catppuccin.surface1}`,
                  bgcolor: catppuccin.surface0,
                }}
              >
                <Box
                  component="img"
                  src={thumbnailUrl}
                  alt="Post thumbnail"
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                />

                <Button
                  component="label"
                  size="small"
                  variant="contained"
                  sx={{
                    position: "absolute",
                    right: 8,
                    bottom: 8,
                    textTransform: "none",
                    bgcolor: catppuccin.base,
                    color: catppuccin.text,

                    "&:hover": {
                      bgcolor: catppuccin.surface1,
                    },
                  }}
                >
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleThumbnail}
                  />
                </Button>
              </Box>
            ) : (
              <Button
                component="label"
                variant="outlined"
                sx={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  textTransform: "none",
                  color: catppuccin.text,
                  borderColor: catppuccin.surface1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <ImageIcon />

                <Box>Add thumbnail</Box>

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleThumbnail}
                />
              </Button>
            )}
          </Box>

          {/* Description */}
          <Box>
            <TypographyLabel color={catppuccin.subtext0}>
              Description
            </TypographyLabel>

            <Box
              component="textarea"
              placeholder="Write a short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              sx={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                p: 1.5,
                border: `1px solid ${catppuccin.surface1}`,
                borderRadius: 2,
                outline: "none",
                bgcolor: catppuccin.surface0,
                color: catppuccin.text,
                fontFamily: "inherit",
                fontSize: "0.95rem",
                lineHeight: 1.5,

                "&::placeholder": {
                  color: catppuccin.overlay0,
                },

                "&:focus": {
                  borderColor: catppuccin.mauve,
                },
              }}
            />
          </Box>
        </Box>

        {/* Editor */}
        <Box
          sx={{
            bgcolor: catppuccin.mantle,
            border: `1px solid ${catppuccin.surface0}`,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.25,
              px: 1.5,
              py: 1,
              bgcolor: catppuccin.base,
              borderBottom: `1px solid ${catppuccin.surface0}`,
            }}
          >
            {/* Undo */}
            <Tooltip title="Undo">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().undo().run()}
                sx={{
                  color: catppuccin.text,
                }}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Redo */}
            <Tooltip title="Redo">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().redo().run()}
                sx={{
                  color: catppuccin.text,
                }}
              >
                <RedoIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 1,
                borderColor: catppuccin.surface1,
              }}
            />

            {/* Heading */}
            <Select
              size="small"
              value={
                editor.isActive("heading", { level: 1 })
                  ? "h1"
                  : editor.isActive("heading", { level: 2 })
                    ? "h2"
                    : editor.isActive("heading", { level: 3 })
                      ? "h3"
                      : editor.isActive("heading", { level: 4 })
                        ? "h4"
                        : editor.isActive("heading", { level: 5 })
                          ? "h5"
                          : editor.isActive("heading", {
                                level: 6,
                              })
                            ? "h6"
                            : "paragraph"
              }
              onChange={(event) => {
                const value = event.target.value;

                if (value === "paragraph") {
                  editor.chain().focus().setParagraph().run();
                }

                if (value === "h1") {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                }

                if (value === "h2") {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                }

                if (value === "h3") {
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                }

                if (value === "h4") {
                  editor.chain().focus().toggleHeading({ level: 4 }).run();
                }

                if (value === "h5") {
                  editor.chain().focus().toggleHeading({ level: 5 }).run();
                }

                if (value === "h6") {
                  editor.chain().focus().toggleHeading({ level: 6 }).run();
                }
              }}
              sx={{
                minWidth: 120,
                color: catppuccin.text,

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: catppuccin.surface1,
                },

                "& .MuiSvgIcon-root": {
                  color: catppuccin.text,
                },
              }}
            >
              <MenuItem value="paragraph">Paragraph</MenuItem>

              <MenuItem value="h1">Heading 1</MenuItem>

              <MenuItem value="h2">Heading 2</MenuItem>

              <MenuItem value="h3">Heading 3</MenuItem>

              <MenuItem value="h4">Heading 4</MenuItem>

              <MenuItem value="h5">Heading 5</MenuItem>

              <MenuItem value="h6">Heading 6</MenuItem>
            </Select>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 1,
                borderColor: catppuccin.surface1,
              }}
            />

            {/* Bold */}
            <Tooltip title="Bold">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleBold().run()}
                sx={{
                  color: editor.isActive("bold")
                    ? catppuccin.mauve
                    : catppuccin.text,
                }}
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Italic */}
            <Tooltip title="Italic">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                sx={{
                  color: editor.isActive("italic")
                    ? catppuccin.mauve
                    : catppuccin.text,
                }}
              >
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Underline */}
            <Tooltip title="Underline">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                sx={{
                  color: editor.isActive("underline")
                    ? catppuccin.mauve
                    : catppuccin.text,
                }}
              >
                <FormatUnderlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Strike */}
            <Tooltip title="Strikethrough">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                sx={{
                  color: editor.isActive("strike")
                    ? catppuccin.mauve
                    : catppuccin.text,
                }}
              >
                <StrikethroughSIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Text color */}
            <Tooltip title="Text color">
              <IconButton
                size="small"
                onClick={toggleColorMenu}
                sx={{
                  color: catppuccin.mauve,
                }}
              >
                <FormatColorTextIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={colorAnchor}
              open={Boolean(colorAnchor)}
              onClose={() => setColorAnchor(null)}
              sx={{
                "& .MuiPaper-root": {
                  bgcolor: catppuccin.mantle,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  p: 1.5,
                  width: 180,
                }}
              >
                {colors.map((color) => (
                  <Box
                    key={color}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();

                      setColorAnchor(null);
                    }}
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      bgcolor: color,
                      cursor: "pointer",
                      border: `2px solid ${catppuccin.surface1}`,

                      "&:hover": {
                        transform: "scale(1.15)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Menu>

            {/* Highlight */}
            <Tooltip title="Highlight">
              <IconButton
                size="small"
                onClick={toggleHighlightMenu}
                sx={{
                  color: catppuccin.yellow,
                }}
              >
                <FormatColorFillIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={highlightAnchor}
              open={Boolean(highlightAnchor)}
              onClose={() => setHighlightAnchor(null)}
              sx={{
                "& .MuiPaper-root": {
                  bgcolor: catppuccin.mantle,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  p: 1.5,
                  width: 180,
                }}
              >
                {highlights.map((color) => (
                  <Box
                    key={color}
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color }).run();

                      setHighlightAnchor(null);
                    }}
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: 1,
                      bgcolor: color,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Box>
            </Menu>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 1,
                borderColor: catppuccin.surface1,
              }}
            />

            {/* Alignment */}
            <Tooltip title="Align left">
              <IconButton
                size="small"
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                sx={{
                  color: catppuccin.text,
                }}
              >
                <FormatAlignLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Align center">
              <IconButton
                size="small"
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                sx={{
                  color: catppuccin.text,
                }}
              >
                <FormatAlignCenterIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Align right">
              <IconButton
                size="small"
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                sx={{
                  color: catppuccin.text,
                }}
              >
                <FormatAlignRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Lists */}
            <Tooltip title="Bullet list">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                sx={{
                  color: catppuccin.text,
                }}
              >
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Numbered list">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                sx={{
                  color: catppuccin.text,
                }}
              >
                <FormatListNumberedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 1,
                borderColor: catppuccin.surface1,
              }}
            />

            {/* Blockquote */}
            <Tooltip title="Blockquote">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                sx={{
                  color: catppuccin.text,
                }}
              >
                <FormatQuoteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Code block */}
            <Tooltip title="Code block">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                sx={{
                  color: catppuccin.text,
                }}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Link */}
            <LinkWidget editor={editor} />

            {/* Editor image upload */}
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              hidden
              onChange={handleImage}
            />

            <Tooltip title="Image">
              <IconButton
                size="small"
                component="label"
                htmlFor="image-upload"
                sx={{
                  color: catppuccin.text,
                }}
              >
                <ImageIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Horizontal rule */}
            <Tooltip title="Horizontal rule">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                sx={{
                  color: catppuccin.text,
                }}
              >
                <HorizontalRuleIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Emoji */}
            <EmojiPickerPopover editor={editor} title="Emojis" icon="😊" />

            {/* Table */}
            <Tooltip title="Tables">
              <IconButton
                size="small"
                onClick={insertTable}
                sx={{
                  color: catppuccin.text,
                }}
              >
                <TableChartSharpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Writing area */}
          <Box
            sx={{
              px: 5,
              py: 4,

              "& .tiptap": {
                minHeight: 650,
                outline: "none",
                color: catppuccin.text,
                fontSize: "1.05rem",
                lineHeight: 1.8,

                "& p": {
                  margin: "0 0 1rem",
                },

                "& h1": {
                  fontSize: "2.3rem",
                  lineHeight: 1.2,
                  margin: "1.5rem 0 1rem",
                },

                "& h2": {
                  fontSize: "1.8rem",
                  lineHeight: 1.3,
                  margin: "1.5rem 0 1rem",
                },

                "& h3": {
                  fontSize: "1.4rem",
                  lineHeight: 1.4,
                  margin: "1.25rem 0 0.75rem",
                },

                "& ul, & ol": {
                  paddingLeft: "1.5rem",
                },

                "& blockquote": {
                  borderLeft: `3px solid ${catppuccin.mauve}`,
                  paddingLeft: "1rem",
                  marginLeft: 0,
                  color: catppuccin.subtext0,
                },

                "& code": {
                  backgroundColor: catppuccin.surface0,
                  color: catppuccin.pink,
                  padding: "2px 5px",
                  borderRadius: 1,
                },

                "& pre": {
                  backgroundColor: catppuccin.crust,
                  padding: "1rem",
                  borderRadius: 2,
                  overflowX: "auto",
                },

                "& hr": {
                  border: 0,
                  borderTop: `1px solid ${catppuccin.surface1}`,
                  margin: "2rem 0",
                },

                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                },
              },
            }}
          >
            <EditorContent editor={editor} />
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((prev) => ({
              ...prev,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const TypographyLabel = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <Box
    sx={{
      mb: 1,
      fontSize: "0.875rem",
      fontWeight: 600,
      color,
    }}
  >
    {children}
  </Box>
);

export default Compose;
