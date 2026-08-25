import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import axios from "axios";
import { endpoints } from "../utils/endpoints";
import { useAuth } from "../contexts/authContext";
import { useAppTheme } from "../contexts/themeContext";
import CenteredScreen from "../components/common/centeredScreen";

type Status = "loading" | "success" | "error";

export default function VerifyEmailChange() {
  const [searchParams] = useSearchParams();
  const { catppuccin } = useAppTheme();

  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const hasVerified = useRef(false);
  const { refreshUser } = useAuth();
  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    axios
      .get(`${endpoints.verifyEmailChange}?token=${token}`, {
        withCredentials: true,
      })
      .then(async () => {
        await refreshUser(); // pull the now-updated email into context
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <CenteredScreen sx={{ px: 2 }}>
      <Box sx={{ maxWidth: 420, textAlign: "center" }}>
        {status === "loading" && (
          <>
            <CircularProgress sx={{ color: catppuccin.mauve, mb: 3 }} />
            <Typography sx={{ color: catppuccin.text }}>
              Confirming your new email...
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 56, color: catppuccin.green, mb: 2 }}
            />
            <Typography
              variant="h6"
              sx={{ color: catppuccin.text, fontWeight: 700, mb: 1 }}
            >
              Email updated
            </Typography>
            <Typography sx={{ color: catppuccin.subtext0, mb: 3 }}>
              Your account email has been changed successfully.
            </Typography>
            <Button
              component={Link}
              to="/settings"
              variant="contained"
              sx={{
                bgcolor: catppuccin.mauve,
                "&:hover": { bgcolor: catppuccin.sapphire },
              }}
            >
              Back to settings
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorOutlineIcon
              sx={{ fontSize: 56, color: catppuccin.red, mb: 2 }}
            />
            <Typography
              variant="h6"
              sx={{ color: catppuccin.text, fontWeight: 700, mb: 1 }}
            >
              Link invalid or expired
            </Typography>
            <Typography sx={{ color: catppuccin.subtext0, mb: 3 }}>
              This verification link is no longer valid. Request a new email
              change from your settings.
            </Typography>
            <Button
              component={Link}
              to="/settings"
              variant="outlined"
              sx={{ color: catppuccin.text, borderColor: catppuccin.surface1 }}
            >
              Go to settings
            </Button>
          </>
        )}
      </Box>
    </CenteredScreen>
  );
}
