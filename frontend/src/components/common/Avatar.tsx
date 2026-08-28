import { useAppTheme } from "../../contexts/themeContext";
import { Box } from "@mui/material";

type AvatarProps = {
  username?: string | null;
  avatar?: string | null;
  size?: number;
  className?: string;
  sx?: object;
};

const ACCENT_COLORS = [
  "rosewater",
  "flamingo",
  "pink",
  "mauve",
  "red",
  "maroon",
  "peach",
  "yellow",
  "green",
  "teal",
  "sky",
  "sapphire",
  "blue",
  "lavender",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Avatar({ username, avatar, size = 40, className, sx }: AvatarProps) {
  const { catppuccin } = useAppTheme();

  const initial = username?.charAt(0).toUpperCase() ?? "?";
  const colorKey = ACCENT_COLORS[hashString(username ?? "") % ACCENT_COLORS.length];
  const bgColor = catppuccin[colorKey as keyof typeof catppuccin];

  if (avatar) {
    return (
      <Box
        className={className}
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          ...sx,
        }}
      >
        <img
          src={avatar}
          alt={username ?? "User avatar"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color: catppuccin.base,
        backgroundColor: bgColor,
        flexShrink: 0,
        ...sx,
      }}
    >
      {initial}
    </Box>
  );
}