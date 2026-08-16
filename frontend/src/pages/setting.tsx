import { useEffect, useRef, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { catppuccin } from "../theme/catppuccinMocha";
import { useAuth } from "../contexts/authContext";
import { useUsers } from "../hooks/useUsers";
import type { UpdateUserRequest } from "../models/updateUserRequest";
import { useNavigate } from "react-router-dom";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
// ---- dummy data ----
type FollowUser = { id: string; username: string; bio?: string };

const initialFollowing: FollowUser[] = [
  { id: "1", username: "hana_dev", bio: "Building things in Go" },
  { id: "2", username: "minh.codes", bio: "Frontend enjoyer" },
];
const dummyFollowers: FollowUser[] = [
  { id: "3", username: "reader01", bio: "Just here to read" },
  { id: "4", username: "duke_fan", bio: "Big fan of mypaper" },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: catppuccin.text,
    "& fieldset": { borderColor: catppuccin.surface1 },
    "&:hover fieldset": { borderColor: catppuccin.mauve },
    "&.Mui-focused fieldset": { borderColor: catppuccin.mauve },
  },
  "& .MuiInputLabel-root": { color: catppuccin.subtext0 },
};

export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const { updateUser } = useUsers();
  const { user } = useAuth();
  const navigate = useNavigate();
  // profile state
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState<UpdateUserRequest>({
    id: "",
    username: "",
    name: "",
    email: "",
    bio: null,
    avatarUrl: null,
  });
  // sync the data from context
  useEffect(() => {
    if (user) {
      setProfileForm({
        id: user.id,
        username: user.username,
        name: user.name ?? "",
        email: user.email,
        bio: user.bio ?? null,
        avatarUrl: user.avatarUrl ?? null,
      });
    }
  }, [user]);
  // avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profileForm.avatarUrl ?? null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };
  // appearance state
  const [mode, setMode] = useState<"dark" | "light">("dark");

  // follow state
  const [subTab, setSubTab] = useState(0);
  const [following, setFollowing] = useState(initialFollowing);
  const list = subTab === 0 ? following : dummyFollowers;

  // menu state
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuTargetId, setMenuTargetId] = useState<string | null>(null);
  const menuOpen = Boolean(menuAnchor);

  // change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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

  const handleBlock = () => {
    closeMenu();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await updateUser(profileForm);
      if (response) {
        navigate("/");
      }
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      // await axios.patch(endpoints.changePassword, { currentPassword, newPassword }, { withCredentials: true });
      await new Promise((r) => setTimeout(r, 500));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError("Current password is incorrect.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <Box sx={{ mx: 0, py: 4, px: 2 }}>
      <Typography
        variant="h5"
        sx={{ color: catppuccin.text, fontWeight: 700, mb: 3 }}
      >
        Settings
      </Typography>

      <Stack direction="row" spacing={4}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          orientation="vertical"
          sx={{
            minWidth: 180,
            borderRight: `1px solid ${catppuccin.surface0}`,
            "& .MuiTab-root": {
              color: catppuccin.subtext0,
              textTransform: "none",
              fontWeight: 600,
              alignItems: "flex-start",
              justifyContent: "flex-start",
              minHeight: 44,
              pl: 1,
            },
            "& .Mui-selected": { color: `${catppuccin.mauve} !important` },
            "& .MuiTabs-indicator": {
              backgroundColor: catppuccin.mauve,
              left: 0,
              right: "auto",
              width: 2,
            },
          }}
        >
          <Tab
            icon={<PersonOutlineIcon fontSize="small" />}
            iconPosition="start"
            label="Profile"
          />
          <Tab
            icon={<PaletteOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Appearance"
          />
          <Tab
            icon={<GroupOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Following"
          />
          <Tab
            icon={<LockOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Security"
          />
        </Tabs>

        <Box
          sx={{
            maxWidth: "900px",
            flex: 1,
            minWidth: "600px",
            margin: "auto !important",
          }}
        >
          {/* ---- Profile tab ---- */}
          {tab === 0 && (
            <>
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    onClick={handleAvatarClick}
                    sx={{
                      position: "relative",
                      width: 64,
                      height: 64,
                      cursor: "pointer",
                      "&:hover .avatar-overlay": {
                        opacity: 1,
                      },
                    }}
                  >
                    <Avatar
                      src={avatarPreview ?? undefined}
                      sx={{ width: 64, height: 64, bgcolor: catppuccin.mauve }}
                    >
                      {profileForm.username[0]?.toUpperCase()}
                    </Avatar>

                    <Box
                      className="avatar-overlay"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        bgcolor: "rgba(17, 17, 27, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.2s ease",
                      }}
                    >
                      <CameraAltOutlinedIcon
                        sx={{ color: catppuccin.text, fontSize: 22 }}
                      />
                    </Box>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                    />
                  </Box>
                </Stack>

                <TextField
                  label="Username"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="Email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="Bio"
                  value={profileForm.bio ?? ""}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  fullWidth
                  multiline
                  rows={3}
                  sx={fieldSx}
                />
                <Box>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    sx={{
                      bgcolor: catppuccin.mauve,
                      "&:hover": { bgcolor: catppuccin.sapphire },
                    }}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </Box>
              </Stack>
              <Snackbar
                open={Boolean(error)}
                autoHideDuration={4000}
                onClose={() => setError("")}
              >
                <Alert
                  severity="error"
                  variant="filled"
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              </Snackbar>
            </>
          )}

          {/* ---- Appearance tab ---- */}
          {tab === 1 && (
            <Stack spacing={2}>
              <Typography sx={{ color: catppuccin.text, fontWeight: 600 }}>
                Theme
              </Typography>
              <Typography variant="body2" sx={{ color: catppuccin.subtext0 }}>
                Choose how mypaper looks.
              </Typography>

              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, value) => value && setMode(value)}
                sx={{
                  width: "fit-content",
                  "& .MuiToggleButton-root": {
                    color: catppuccin.subtext0,
                    borderColor: catppuccin.surface1,
                    textTransform: "none",
                    px: 3,
                    gap: 1,
                  },
                  "& .Mui-selected": {
                    color: `${catppuccin.base} !important`,
                    backgroundColor: `${catppuccin.mauve} !important`,
                  },
                }}
              >
                <ToggleButton value="dark">
                  <DarkModeOutlinedIcon fontSize="small" />
                  Dark
                </ToggleButton>
                <ToggleButton value="light">
                  <LightModeOutlinedIcon fontSize="small" />
                  Light
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          )}

          {/* ---- Following tab ---- */}
          {tab === 2 && (
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
                  "& .Mui-selected": {
                    color: `${catppuccin.mauve} !important`,
                  },
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

                {list.map((user) => (
                  <Stack
                    key={user.id}
                    direction="row"
                    spacing={2}
                    sx={{
                      alignItems: "center",
                      p: 1.5,
                      borderRadius: 2,
                      "&:hover": { bgcolor: catppuccin.surface0 },
                    }}
                  >
                    <Avatar sx={{ bgcolor: catppuccin.mauve }}>
                      {user.username[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{ color: catppuccin.text, fontWeight: 600 }}
                      >
                        {user.username}
                      </Typography>
                      {user.bio && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: catppuccin.subtext0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user.bio}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => openMenu(e, user.id)}
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
                  <MenuItem
                    onClick={handleUnfollow}
                    sx={{ color: catppuccin.text }}
                  >
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
          )}

          {/* ---- Security tab ---- */}
          {tab === 3 && (
            <Stack spacing={2} sx={{ maxWidth: 400 }}>
              <Typography sx={{ color: catppuccin.text, fontWeight: 600 }}>
                Change password
              </Typography>
              <Typography variant="body2" sx={{ color: catppuccin.subtext0 }}>
                You'll need your current password to set a new one.
              </Typography>

              <TextField
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                sx={fieldSx}
              />

              {passwordError && (
                <Typography variant="body2" sx={{ color: catppuccin.red }}>
                  {passwordError}
                </Typography>
              )}
              {passwordSuccess && (
                <Typography variant="body2" sx={{ color: catppuccin.green }}>
                  Password updated successfully.
                </Typography>
              )}

              <Box>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  sx={{
                    bgcolor: catppuccin.mauve,
                    "&:hover": { bgcolor: catppuccin.sapphire },
                  }}
                >
                  {passwordSaving ? "Updating..." : "Update password"}
                </Button>
              </Box>
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
