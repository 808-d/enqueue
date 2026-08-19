import { useState } from "react";
import { Box, Tabs, Tab, Typography, Stack, Grid } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import ProfileTab from "./profileTab";
import AppearanceTab from "./appearanceTab";
import FollowingTab from "./followingTab";
import SecurityTab from "./securityTab";
import { Left } from "../../components/shared/left";
import { useAppTheme } from "../../contexts/themeContext";
export default function Settings() {
  const [tab, setTab] = useState(0);
  const { catppuccin } = useAppTheme();
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      color: catppuccin.text,
      "& fieldset": { borderColor: catppuccin.surface1 },
      "&:hover fieldset": { borderColor: catppuccin.mauve },
      "&.Mui-focused fieldset": { borderColor: catppuccin.mauve },
    },
    "& .MuiInputLabel-root": { color: catppuccin.subtext0 },
  };
  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Left />
      <Grid size={{ xs: 11, md: 10 }}>
        <Box sx={{ mx: 0, py: 4, px: 2 }}>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ color: catppuccin.text, fontWeight: 700, mb: 3 }}
            >
              Settings
            </Typography>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: "auto" }}>
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  orientation="vertical"
                  sx={{
                    minWidth: 180,
                    borderRight: `1px solid ${catppuccin.surface0}`,
                    "& .MuiTab-root": {
                      color: catppuccin.subtext0,
                      textTransform: "none",
                      fontWeight: 600,
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      minHeight: 44,
                      pl: 1,
                    },
                    "& .Mui-selected": {
                      color: `${catppuccin.mauve} !important`,
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: catppuccin.mauve,
                      left: 0,
                      right: "auto",
                      width: 2,
                    },
                  }}
                >
                  <Tab
                    icon={<PersonOutlineIcon fontSize="small" />}
                    iconPosition="start"
                    label="Profile"
                  />
                  <Tab
                    icon={<PaletteOutlinedIcon fontSize="small" />}
                    iconPosition="start"
                    label="Appearance"
                  />
                  <Tab
                    icon={<GroupOutlinedIcon fontSize="small" />}
                    iconPosition="start"
                    label="Following"
                  />
                  <Tab
                    icon={<LockOutlinedIcon fontSize="small" />}
                    iconPosition="start"
                    label="Security"
                  />
                </Tabs>
              </Grid>

              <Grid size="grow">
                <Box sx={{ maxWidth: "900px" }}>
                  {tab === 0 && <ProfileTab fieldSx={fieldSx} />}
                  {tab === 1 && <AppearanceTab />}
                  {tab === 2 && <FollowingTab />}
                  {tab === 3 && <SecurityTab fieldSx={fieldSx} />}
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}
