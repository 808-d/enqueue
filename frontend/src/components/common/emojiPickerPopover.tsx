import { useState, type ReactNode } from "react";
import { IconButton, Popover, Tooltip } from "@mui/material";
import type { Editor } from "@tiptap/react";
import EmojiPicker from "emoji-picker-react";
import { useAppTheme } from "../../contexts/themeContext";

type EmojiPickerPopoverProps = {
  editor: Editor | null;
  icon: ReactNode;
  title?: string;
};

export default function EmojiPickerPopover({
  editor,
  icon,
  title = "Emoji",
}: EmojiPickerPopoverProps) {
  const { catppuccin } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title={title}>
        <IconButton
          size="small"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{ color: anchorEl ? catppuccin.mauve : undefined }}
        >
          {icon}
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <EmojiPicker
          onEmojiClick={(emojiData) => {
            editor?.chain().focus().insertContent(emojiData.emoji).run();

            setAnchorEl(null);
          }}
        />
      </Popover>
    </>
  );
}
