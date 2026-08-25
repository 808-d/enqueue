import type { ReactNode } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { useAppTheme } from "../../contexts/themeContext";

type CenteredScreenProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export default function CenteredScreen({ children, sx }: CenteredScreenProps) {
  const { catppuccin } = useAppTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: catppuccin.base,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
