import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { Comment } from "../../models/comment";
import type { User } from "../../models/user";
import Avatar from "../../components/common/Avatar";

type CommentCardProps = {
  comment: Comment;
  currentUser?: User | null;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, comment: Comment) => void;
};

export default function CommentCard({
  comment,
  currentUser,
  onMenuOpen,
}: CommentCardProps) {
  const isOwner = comment.userId === currentUser?.id;

  return (
    <Card
      sx={{
        backgroundColor: "#313244",
        border: "1px solid #45475a",
        borderRadius: 2,
        color: "#cdd6f4",
      }}
    >
      <CardContent>
        <Stack
          spacing={1.5}
          sx={{
            textAlign: "left",
          }}
        >
          {/* Comment header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Avatar
                username={comment.username}
                avatar={comment.avatar}
                size={32}
              />

              <Typography
                variant="subtitle2"
                sx={{
                  color: "#cba6f7",
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                {comment.username ?? "Unknown user"}
              </Typography>
            </Box>

            {isOwner && (
              <IconButton
                size="small"
                onClick={(event) => onMenuOpen(event, comment)}
                sx={{
                  color: "#a6adc8",
                  "&:hover": {
                    backgroundColor: "#45475a",
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Comment content */}
          <Box
            sx={{
              color: "#cdd6f4",
              lineHeight: 1.7,
              textAlign: "left",

              "& p": {
                margin: "0 0 0.5rem",
              },

              "& img": {
                maxWidth: "100%",
              },

              "& a": {
                color: "#cba6f7",
              },
            }}
            dangerouslySetInnerHTML={{
              __html: comment.content ?? "",
            }}
          />

          {/* Comment time */}
          <Typography
            variant="caption"
            sx={{
              color: "#6c7086",
              textAlign: "left",
            }}
          >
            {comment.createTime
              ? new Date(comment.createTime * 1000).toLocaleString()
              : ""}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
