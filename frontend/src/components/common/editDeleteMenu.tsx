import { Menu, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

type EditDeleteMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export default function EditDeleteMenu({
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
  onClick,
}: EditDeleteMenuProps) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose} onClick={onClick}>
      <MenuItem onClick={onEdit}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} />
        Edit
      </MenuItem>

      <MenuItem onClick={onDelete} sx={{ color: "#f38ba8" }}>
        <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
        Delete
      </MenuItem>
    </Menu>
  );
}
