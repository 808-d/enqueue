import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Box, Typography, TextField, Button } from "@mui/material";
import axios from "axios";
import { useAppTheme } from "../contexts/themeContext";
import { endpoints } from "../utils/endpoints";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { catppuccin } = useAppTheme();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!token) {
      setError("This reset link is invalid.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await axios.post(endpoints.resetPassword, {
        token,
        newPassword,
      });
      setSuccess(true);
    } catch {
      setError("This reset link is invalid or has expired.");
    } finally {
      setSaving(false);
    }
  };

  const fieldSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      color: catppuccin.text,
      "& fieldset": { borderColor: catppuccin.surface1 },
      "&:hover fieldset": { borderColor: catppuccin.mauve },
      "&.Mui-focused fieldset": { borderColor: catppuccin.mauve },
    },
    "& .MuiInputLabel-root": { color: catppuccin.subtext0 },
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: catppuccin.base,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Typography sx={{ color: catppuccin.red }}>
          This reset link is invalid or missing a token.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: catppuccin.base,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 380, width: "100%" }}>
        {success ? (
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h6"
              sx={{ color: catppuccin.text, fontWeight: 700, mb: 1 }}
            >
              Password updated
            </Typography>
            <Typography sx={{ color: catppuccin.subtext0, mb: 3 }}>
              Your password has been reset successfully.
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{
                bgcolor: catppuccin.mauve,
                "&:hover": { bgcolor: catppuccin.sapphire },
              }}
            >
              Go to login
            </Button>
          </Box>
        ) : (
          <>
            <Typography
              variant="h6"
              sx={{ color: catppuccin.text, fontWeight: 700, mb: 1 }}
            >
              Reset your password
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: catppuccin.subtext0, mb: 3 }}
            >
              Choose a new password for your account.
            </Typography>

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

            {error && (
              <Typography variant="body2" sx={{ color: catppuccin.red, mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={saving}
              sx={{
                bgcolor: catppuccin.mauve,
                "&:hover": { bgcolor: catppuccin.sapphire },
              }}
            >
              {saving ? "Updating..." : "Reset password"}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
