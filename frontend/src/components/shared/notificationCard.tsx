import { Avatar, Box, Typography } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import type { NotiResponse } from "../../models/notiResponse";
import { useAppTheme } from "../../contexts/themeContext";
import { useNavigate } from "react-router-dom";

interface NotificationCardProps {
  notification: NotiResponse;
  onClick?: () => void;
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const { catppuccin } = useAppTheme();
  const navigate = useNavigate();

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "follow":
        return "👤";
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      default:
        return "🔔";
    }
  };

  const getEntityPath = () => {
    switch (notification.type) {
      case "follow":
        return `/profile?id=${notification.entityId}`;
      case "like":
      case "comment":
        return `/read?id=${notification.entityId}`;
      default:
        return "#";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      navigate(getEntityPath());
    }
  };

  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : "";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        px: 3,
        py: 2,
        borderBottom: `1px solid ${catppuccin.surface0}`,
        cursor: "pointer",
        bgcolor: notification.readAt ? "transparent" : catppuccin.mantle,
        "&:hover": {
          bgcolor: catppuccin.surface0,
        },
      }}
      onClick={handleClick}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: catppuccin.mauve,
          color: catppuccin.base,
          fontSize: 18,
        }}
      >
        {getNotificationIcon()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: notification.readAt ? 400 : 600,
            color: catppuccin.text,
            lineHeight: 1.4,
          }}
        >
          {notification.message}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: catppuccin.subtext0,
            mt: 0.5,
            display: "block",
          }}
        >
          {timeAgo}
        </Typography>
      </Box>
      {!notification.readAt && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: catppuccin.mauve,
            mt: 1,
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  );
}