import {
  Button,
  IconButton,
  Popover,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { useCallback, useState } from "react";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { Editor } from "@tiptap/react";
import { useAppTheme } from "../../contexts/themeContext";

export function LinkWidget({ editor }: { editor: Editor | null }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [url, setUrl] = useState("");
  const { catppuccin } = useAppTheme();

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
