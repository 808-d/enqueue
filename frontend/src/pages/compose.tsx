import { useCallback, useEffect, useState } from "react";

import {
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
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
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ImageIcon from "@mui/icons-material/Image";
import EmojiPicker from "emoji-picker-react";
import ImageResize from "tiptap-extension-resize-image";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import TableChartSharpIcon from "@mui/icons-material/TableChartSharp";
import { TableKit } from "@tiptap/extension-table";
import { catppuccin } from "../theme/catppuccinMocha";
import Link from "@tiptap/extension-link";
import { useCloudinary } from "../hooks/useCloudinary";
import { usePosts } from "../hooks/usePosts";
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

const Compose = (postId: string) => {
  const [colorAnchor, setColorAnchor] = useState<null | HTMLElement>(null);

  const [highlightAnchor, setHighlightAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);

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
        table: { resizable: true },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        markdownLinks: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            // disallowed protocols
            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme,
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            // disallowed domains
            const disallowedDomains = [
              "example-phishing.com",
              "malicious-site.net",
            ];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            // all checks have passed
            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: (url) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`https://${url}`);

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = [
              "example-no-autolink.com",
              "another-no-autolink.com",
            ];
            const domain = parsedUrl.hostname;

            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
    ],

    content: "<p></p>",
  });
  const { uploadImage, uploading } = useCloudinary();
  const { updatePostStatus, updatePost } = usePosts();
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

    if (!file) return;

    const result = await uploadImage(file, "enqueue/posts");

    if (!result) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: result.url,
      })
      .run();

    event.target.value = "";
  };

  const insertTable = () => {
    editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
  };

  const [title, setTitle] = useState("No title");

  const publish = () => {
    updatePostStatus(postId, 1);
  };

  const handleUpdatePost = async (id: string, status: number) => {
    try {
      const content = editor?.getText();
      await updatePost(id, content, status);
    } catch {
      alert();
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
          }}
        >
          <Box
            component="input"
            placeholder="Post title"
            sx={{
              flex: 1,
              mr: 3,
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              sx={{
                textTransform: "none",
                color: catppuccin.text,
                borderColor: catppuccin.surface1,
              }}
              onClick={() => handleUpdatePost(postId, 2)}
            >
              Save Draft
            </Button>

            <Button
              variant="contained"
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

            {/* Block type */}
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
                          : editor.isActive("heading", { level: 6 })
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
                  editor.chain().focus().toggleHeading({ level: 5 }).run();
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
                sx={{ color: catppuccin.text }}
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
                sx={{ color: catppuccin.text }}
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
                sx={{ color: catppuccin.text }}
              >
                <FormatAlignRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Lists */}
            <Tooltip title="Bullet list">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                sx={{ color: catppuccin.text }}
              >
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Numbered list">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                sx={{ color: catppuccin.text }}
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

            {/* Quote */}
            <Tooltip title="Blockquote">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                sx={{ color: catppuccin.text }}
              >
                <FormatQuoteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Code block */}
            <Tooltip title="Code block">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                sx={{ color: catppuccin.text }}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Link */}
            <LinkWidget editor={editor} />

            {/* Image */}
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
                sx={{ color: catppuccin.text }}
              >
                <ImageIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Horizontal rule */}
            <Tooltip title="Horizontal rule">
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                sx={{ color: catppuccin.text }}
              >
                <HorizontalRuleIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* emojis */}
            <Tooltip title="Emojis">
              <IconButton
                size="small"
                onClick={(event) => setEmojiAnchor(event.currentTarget)}
              >
                😊
              </IconButton>
            </Tooltip>
            <Popover
              open={Boolean(emojiAnchor)}
              anchorEl={emojiAnchor}
              onClose={() => setEmojiAnchor(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  editor.chain().focus().insertContent(emojiData.emoji).run();

                  setEmojiAnchor(null);
                }}
              />
            </Popover>

            {/* tables */}
            <Tooltip title="Tables">
              <IconButton size="small" onClick={insertTable}>
                <TableChartSharpIcon
                  fontSize="small"
                  sx={{ color: catppuccin.text }}
                />
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
              },
            }}
          >
            <EditorContent editor={editor} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

function LinkWidget({ editor }: { editor: Editor | null }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [url, setUrl] = useState("");

  const open = Boolean(anchorEl);
  const isActive = editor?.isActive("link") ?? false;

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!editor) return;
      const previousUrl = editor.getAttributes("link").href || "";
      setUrl(previousUrl);
      setAnchorEl(event.currentTarget);
    },
    [editor],
  );

  const handleClose = () => setAnchorEl(null);

  const applyLink = () => {
    if (!editor) return;

    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    handleClose();
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyLink();
    }
  };

  if (!editor) return null;

  return (
    <>
      <Tooltip title={isActive ? "Edit link" : "Add link"}>
        <IconButton
          size="small"
          onClick={handleOpen}
          color={isActive ? "primary" : "default"}
        >
          <LinkIcon fontSize="small" sx={{ color: catppuccin.text }} />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ p: 1.5, alignItems: "center" }}
        >
          <TextField
            size="small"
            placeholder="https://example.com"
            value={url}
            autoFocus
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ minWidth: 260 }}
          />
          <Button size="small" variant="contained" onClick={applyLink}>
            Apply
          </Button>
          {isActive && (
            <Tooltip title="Remove link">
              <IconButton size="small" onClick={removeLink}>
                <LinkOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Popover>
    </>
  );
}

export default Compose;
