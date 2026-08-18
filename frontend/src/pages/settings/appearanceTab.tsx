import {
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useAppTheme } from "../../contexts/themeContext";

export default function AppearanceTab() {
  const { mode, setMode, catppuccin } = useAppTheme();

  return (
    <Stack spacing={2}>
      <Typography sx={{ color: catppuccin.text, fontWeight: 600 }}>
        Theme
      </Typography>
      <Typography variant="body2" sx={{ color: catppuccin.subtext0 }}>
        Choose how mypaper looks.
      </Typography>

      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, value) => value && setMode(value)}
        sx={{
          width: "fit-content",
          "& .MuiToggleButton-root": {
            color: catppuccin.subtext0,
            borderColor: catppuccin.surface1,
            textTransform: "none",
            px: 3,
            gap: 1,
          },
          "& .Mui-selected": {
            color: `${catppuccin.base} !important`,
            backgroundColor: `${catppuccin.mauve} !important`,
          },
        }}
      >
        <ToggleButton value="dark">
          <DarkModeOutlinedIcon fontSize="small" />
          Dark
        </ToggleButton>
        <ToggleButton value="light">
          <LightModeOutlinedIcon fontSize="small" />
          Light
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
