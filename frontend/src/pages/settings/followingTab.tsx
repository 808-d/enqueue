import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { useAppTheme } from "../../contexts/themeContext";
import Avatar from "../../components/common/Avatar";

type FollowUser = { id: string; username: string; bio?: string; avatar?: string | null };

const initialFollowing: FollowUser[] = [
  { id: "1", username: "hana_dev", bio: "Building things in Go" },
  { id: "2", username: "minh.codes", bio: "Frontend enjoyer" },
];
const dummyFollowers: FollowUser[] = [
  { id: "3", username: "reader01", bio: "Just here to read" },
  { id: "4", username: "duke_fan", bio: "Big fan of mypaper" },
];

export default function FollowingTab() {
  const [subTab, setSubTab] = useState(0);
  const [following, setFollowing] = useState(initialFollowing);
  const list = subTab === 0 ? following : dummyFollowers;
  const { catppuccin } = useAppTheme();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuTargetId, setMenuTargetId] = useState<string | null>(null);
  const menuOpen = Boolean(menuAnchor);

  const openMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuTargetId(id);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTargetId(null);
  };
  const handleUnfollow = () => {
    if (menuTargetId) {
      setFollowing((prev) => prev.filter((u) => u.id !== menuTargetId));
    }
    closeMenu();
  };
  const handleBlock = () => closeMenu();

  return (
    <Box>
      <Tabs
        value={subTab}
        onChange={(_, v) => setSubTab(v)}
        sx={{
          mb: 2,
          minHeight: 36,
          "& .MuiTab-root": {
            color: catppuccin.subtext0,
            textTransform: "none",
            minHeight: 36,
            fontSize: "0.875rem",
          },
          "& .Mui-selected": { color: `${catppuccin.mauve} !important` },
          "& .MuiTabs-indicator": { backgroundColor: catppuccin.mauve },
        }}
      >
        <Tab label={`Following (${following.length})`} />
        <Tab label={`Followers (${dummyFollowers.length})`} />
      </Tabs>

      <Stack spacing={1}>
        {list.length === 0 && (
          <Typography
            variant="body2"
            sx={{ color: catppuccin.overlay0, py: 2 }}
          >
            {subTab === 0
              ? "You're not following anyone yet."
              : "No followers yet."}
          </Typography>
        )}

        {list.map((followUser) => (
          <Stack
            key={followUser.id}
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              p: 1.5,
              borderRadius: 2,
              "&:hover": { bgcolor: catppuccin.surface0 },
            }}
          >
            <Avatar username={followUser.username} avatar={followUser.avatar ?? null} size={40} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: catppuccin.text, fontWeight: 600 }}>
                {followUser.username}
              </Typography>
              {followUser.bio && (
                <Typography
                  variant="body2"
                  sx={{
                    color: catppuccin.subtext0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {followUser.bio}
                </Typography>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={(e) => openMenu(e, followUser.id)}
              sx={{ color: catppuccin.subtext0 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}
        slotProps={{
          paper: {
            sx: {
              bgcolor: catppuccin.base,
              border: `1px solid ${catppuccin.surface0}`,
            },
          },
        }}
      >
        {subTab === 0 && (
          <MenuItem onClick={handleUnfollow} sx={{ color: catppuccin.text }}>
            <ListItemIcon>
              <PersonRemoveOutlinedIcon
                fontSize="small"
                sx={{ color: catppuccin.red }}
              />
            </ListItemIcon>
            <ListItemText>Unfollow</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleBlock} sx={{ color: catppuccin.red }}>
          <ListItemIcon>
            <BlockOutlinedIcon
              fontSize="small"
              sx={{ color: catppuccin.red }}
            />
          </ListItemIcon>
          <ListItemText>Block user</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
