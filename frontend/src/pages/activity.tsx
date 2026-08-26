import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
} from "@mui/material";
import { MarkEmailRead } from "@mui/icons-material";
import { useEffect } from "react";
import { useAppTheme } from "../contexts/themeContext";
import { useNotifications } from "../contexts/notificationContext";
import { NotificationCard } from "../components/shared/notificationCard";
import { Left } from "../components/shared/left";
import { Right } from "../components/shared/right";

export function Activity() {
  const { catppuccin } = useAppTheme();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Left />
      <Grid size={{ xs: 11, md: 8 }}>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: catppuccin.base,
            color: catppuccin.text,
          }}
        >
          <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: catppuccin.text }}
              >
                Activity
              </Typography>
              {unreadCount > 0 && (
                <IconButton
                  onClick={handleMarkAllAsRead}
                  sx={{ color: catppuccin.subtext0 }}
                  aria-label="Mark all as read"
                >
                  <MarkEmailRead />
                </IconButton>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : notifications.length === 0 ? (
              <Box
                sx={{ textAlign: "center", py: 8, color: catppuccin.overlay0 }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No activity yet
                </Typography>
                <Typography variant="body2">
                  When someone follows you, likes your post, or comments, it'll
                  show up here.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `1px solid ${catppuccin.surface0}`,
                }}
              >
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Grid>
      <Right />
    </Grid>
  );
}

export default Activity;
