import { useState } from "react";

import {
  Box,
  Button,
  IconButton,
  Popover,
  Stack,
  Tooltip,
} from "@mui/material";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import UnderlineIcon from "@mui/icons-material/FormatUnderlined";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import Link from "@tiptap/extension-link";

import EmojiPicker from "emoji-picker-react";

import { catppuccin } from "../../theme/catppuccinMocha";

type CommentEditorProps = {
  onSubmit: (comment: string) => void;
  onCancel?: () => void;
};

export default function CommentEditor({
  onSubmit,
  onCancel,
}: CommentEditorProps) {
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLButtonElement | null>(
    null,
  );

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

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;

    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
      })
      .run();
  };

  const addImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Temporary local URL.
    // Replace this with your S3/R2 upload later.
    const url = URL.createObjectURL(file);

    editor
      .chain()
      .focus()
      .setImage({
        src: url,
      })
      .run();

    event.target.value = "";
  };

  const handleSubmit = () => {
    if (editor.isEmpty) {
      return;
    }

    onSubmit(editor.getHTML());

    editor.commands.clearContent();
    setEmojiAnchor(null);
  };

  const handleCancel = () => {
    editor.commands.clearContent();
    setEmojiAnchor(null);
    onCancel?.();
  };

  return (
    <Stack spacing={0}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          flexWrap: "wrap",

          border: `1px solid ${catppuccin.surface1}`,
          borderBottom: "none",

          borderRadius: "8px 8px 0 0",

          p: 0.5,

          backgroundColor: catppuccin.mantle,
        }}
      >
        {/* Bold */}
        <Tooltip title="Bold">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            sx={{
              color: editor.isActive("bold")
                ? catppuccin.mauve
                : catppuccin.subtext1,
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
                : catppuccin.subtext1,
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
                : catppuccin.subtext1,
            }}
          >
            <UnderlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Link */}
        <Tooltip title="Link">
          <IconButton
            size="small"
            onClick={addLink}
            sx={{
              color: editor.isActive("link")
                ? catppuccin.mauve
                : catppuccin.subtext1,
            }}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Image */}
        <Tooltip title="Image">
          <IconButton
            component="label"
            size="small"
            sx={{
              color: catppuccin.subtext1,
            }}
          >
            <ImageIcon fontSize="small" />

            <input hidden type="file" accept="image/*" onChange={addImage} />
          </IconButton>
        </Tooltip>

        {/* Emoji */}
        <Tooltip title="Emoji">
          <IconButton
            size="small"
            onClick={(event) => {
              setEmojiAnchor(event.currentTarget);
            }}
            sx={{
              color: emojiAnchor ? catppuccin.mauve : catppuccin.subtext1,
            }}
          >
            <EmojiEmotionsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Emoji picker */}
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

      {/* Editor */}
      <Box
        sx={{
          minHeight: 180,
          maxHeight: 350,
          overflowY: "auto",

          border: `1px solid ${catppuccin.surface1}`,
          borderRadius: "0 0 8px 8px",

          backgroundColor: catppuccin.crust,

          "& .tiptap": {
            minHeight: 180,
            outline: "none",
            padding: "12px 14px",

            color: catppuccin.text,

            fontSize: "0.95rem",
            lineHeight: 1.6,
          },

          "& .tiptap p": {
            margin: 0,
          },

          "& .tiptap p + p": {
            marginTop: "0.75rem",
          },

          "& .tiptap a": {
            color: catppuccin.mauve,
            textDecoration: "underline",
          },

          "& .tiptap img": {
            maxWidth: "100%",
            height: "auto",
            borderRadius: 1,
          },

          "& .tiptap img.ProseMirror-selectednode": {
            outline: `2px solid ${catppuccin.mauve}`,
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          mt: 2,
        }}
      >
        <Button
          onClick={handleCancel}
          sx={{
            color: catppuccin.subtext1,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={editor.isEmpty}
          sx={{
            backgroundColor: catppuccin.mauve,
            color: catppuccin.base,

            "&:hover": {
              backgroundColor: catppuccin.mauve,
              opacity: 0.9,
            },
          }}
        >
          Comment
        </Button>
      </Box>
    </Stack>
  );
}
