import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
type PostCardProps = {
  id: string;
  title: string;
  description?: string | null;
  status: number;
  updatedAt?: string | null;
  onClick?: () => void;
  onDelete: (id: string) => void;
};

const statusMap = {
  1: { label: "Draft", color: "default" as const },
  2: { label: "Published", color: "success" as const },
  3: { label: "Hidden", color: "warning" as const },
};

export default function PostCard({
  id,
  title,
  description,
  status,
  updatedAt,
  onClick,
  onDelete,
}: PostCardProps) {
  const statusInfo = statusMap[status as keyof typeof statusMap];

  return (
    <Card
    onClick={onClick}
    sx={{
      cursor: onClick ? "pointer" : "default",
      backgroundColor: "#313244",
      color: "#cdd6f4",
      border: "1px solid #45475a",
      borderRadius: 2,
      transition: "0.2s",

      "&:hover": onClick
	? {
	  borderColor: "#cba6f7",
	  transform: "translateY(-2px)",
	}
	  : undefined,
    }}
    >
    <CardContent>
    <Stack spacing={1.5}>
    <Box
    sx={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    }}
    >
    <Typography
    variant="h6"
    sx={{
      fontWeight: 600,
      color: "#cdd6f4",
    }}
    >
    {title || "No Title"}
    </Typography>

    <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
    }}
    >
    {onDelete && (
      <IconButton
      size="small"
      onClick={(event) => {
	event.stopPropagation();
	onDelete!(id);
      }}
      sx={{
	color: "#f38ba8",
	"&:hover": {
	  backgroundColor: "rgba(243, 139, 168, 0.1)",
	},
      }}
      >
      <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    )}
    {statusInfo && (
      <Chip
      label={statusInfo.label}
      color={statusInfo.color}
      size="small"
      />
    )}
    </Box>
    </Box>
    {description && (
      <Typography
      variant="body2"
      sx={{
	color: "#a6adc8",
	display: "-webkit-box",
	WebkitLineClamp: 2,
	WebkitBoxOrient: "vertical",
	overflow: "hidden",
      }}
      >
      {description}
      </Typography>
    )}
    {updatedAt && (
      <Typography variant="caption" sx={{ color: "#6c7086" }}>
      Updated {updatedAt}
      </Typography>
    )}
    </Stack>
    </CardContent>
    </Card>
  );
}
