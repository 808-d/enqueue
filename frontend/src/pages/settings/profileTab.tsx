import { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Avatar,
  Typography,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import { useAuth } from "../../contexts/authContext";
import { useUsers } from "../../hooks/useUsers";
import { useToast } from "../../contexts/toastContext";
import { useCloudinary } from "../../hooks/useCloudinary";
import type { UpdateUserRequest } from "../../models/updateUserRequest";
import { useAppTheme } from "../../contexts/themeContext";
import type { SxProps, Theme } from "@mui/material";
const emptyProfileForm: UpdateUserRequest = {
  id: "",
  username: "",
  name: "",
  email: "",
  bio: null,
  avatar: null,
};

export default function ProfileTab({ fieldSx }: { fieldSx: SxProps<Theme> }) {
  const { updateUser } = useUsers();
  const { showToast } = useToast();
  const { uploadImage } = useCloudinary();
  const { user, setUser } = useAuth();
  const { catppuccin } = useAppTheme();

  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] =
    useState<UpdateUserRequest>(emptyProfileForm);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        id: user.id,
        username: user.username,
        name: user.name ?? "",
        email: user.email,
        bio: user.bio ?? null,
        avatar: user.avatar ?? null,
      });
      setAvatarPreview(user.avatar ?? null);
    }
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let avatar = profileForm.avatar;

      if (avatarFile) {
        const result = await uploadImage(avatarFile, "avatars");
        if (!result) {
          showToast("Failed to upload avatar. Please try again.", "error");
          setSaving(false);
          return;
        }
        avatar = result.url;
      }

      const response = await updateUser({ ...profileForm, avatar });

      if (response.email_change_pending) {
        showToast(
          "Profile updated. Check your inbox to confirm your new email.",
          "success",
        );
      } else {
        showToast("Profile updated successfully.", "success");
      }

      setUser(response.user);
      setAvatarFile(null);
    } catch {
      showToast("Failed to save changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box
        onClick={handleAvatarClick}
        sx={{
          position: "relative",
          width: 64,
          height: 64,
          cursor: "pointer",
          "&:hover .avatar-overlay": { opacity: 1 },
        }}
      >
        <Avatar
          src={avatarPreview ?? profileForm.avatar ?? undefined}
          sx={{ width: 64, height: 64, bgcolor: catppuccin.mauve }}
        >
          {profileForm.username?.[0]?.toUpperCase()}
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

      <TextField
        label="Username"
        value={profileForm.username}
        onChange={(e) =>
          setProfileForm((prev) => ({ ...prev, username: e.target.value }))
        }
        fullWidth
        sx={fieldSx}
      />
      <TextField
        label="Name"
        value={profileForm.name}
        onChange={(e) =>
          setProfileForm((prev) => ({ ...prev, name: e.target.value }))
        }
        fullWidth
        sx={fieldSx}
      />

      <Box>
        <TextField
          label="Email"
          value={profileForm.email}
          onChange={(e) =>
            setProfileForm((prev) => ({ ...prev, email: e.target.value }))
          }
          fullWidth
          sx={fieldSx}
        />
        {profileForm.email !== user?.email && (
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5, color: catppuccin.peach }}
          >
            We'll send a verification link to your new email before the change
            takes effect.
          </Typography>
        )}
      </Box>

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
  );
}