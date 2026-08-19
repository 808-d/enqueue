import { useState } from "react";
import { Stack, Typography, TextField, Button, Box } from "@mui/material";
import { useAppTheme } from "../../contexts/themeContext";
import type { SxProps, Theme } from "@mui/material";
import axios from "axios";
import { endpoints } from "../../utils/endpoints";
import { useAuth } from "../../contexts/authContext";

export default function SecurityTab({ fieldSx }: { fieldSx: SxProps<Theme> }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const { catppuccin } = useAppTheme();

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
      await axios.patch(
        endpoints.changePassword,
        { currentPassword, newPassword },
        { withCredentials: true },
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
    } catch {
      setPasswordError("Current password is incorrect.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
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
  );
}
