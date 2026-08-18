import { Box, Button, Grid, Stack } from "@mui/material";
import { useAuth } from "../../contexts/authContext";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import enqueueLogo from "../../assets/enqueue.svg";
import SearchIcon from "@mui/icons-material/Search";
import { Person } from "@mui/icons-material";
import LoginIcon from "@mui/icons-material/Login";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAppTheme } from "../../contexts/themeContext";

export function Left() {
  const { user, loading } = useAuth();
  const { catppuccin } = useAppTheme();
  const location = useLocation();

  if (loading) {
    return null;
  }

  const navButtonSx = (path: string) => {
    const isActive = location.pathname === path;
    return {
      justifyContent: "flex-start",
      bgcolor: isActive ? catppuccin.surface0 : "transparent",
      color: isActive ? catppuccin.mauve : catppuccin.text,
      borderRadius: 3,
      px: 2,
      py: 1,
      fontSize: "1rem",
      fontWeight: isActive ? 700 : 500,
      textTransform: "none",
      transition: "background-color 0.15s ease, color 0.15s ease",
      "&:hover": {
        bgcolor: catppuccin.surface0,
        color: catppuccin.mauve,
      },
      "& .MuiButton-startIcon": {
        mr: 1.5,
      },
    };
  };

  return (
    <Grid size={{ xs: 0, md: 2 }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          height: "100vh",
          px: 2,
          py: 3,
        }}
      >
        <Stack spacing={0.5}>
          <Button
            variant="text"
            sx={{ width: "fit-content", mb: 2, p: 0, minWidth: 0 }}
          >
            <img src={enqueueLogo} alt="Enqueue" style={{ width: "50px" }} />
          </Button>

          <Button
            component={Link}
            to="/"
            startIcon={<HomeFilledIcon />}
            sx={navButtonSx("/")}
          >
            Home
          </Button>

          <Button
            startIcon={<TurnedInIcon />}
            sx={navButtonSx("/subscriptions")}
          >
            Subscriptions
          </Button>

          <Button
            startIcon={<NotificationsIcon />}
            sx={navButtonSx("/activity")}
          >
            Activity
          </Button>

          <Button startIcon={<SearchIcon />} sx={navButtonSx("/explore")}>
            Explore
          </Button>

          <Button
            startIcon={<SettingsIcon />}
            component={Link}
            to="/settings"
            sx={navButtonSx("/settings")}
          >
            Settings
          </Button>

          {user ? (
            <Button
              component={Link}
              to={`/profile?id=${user.id}`}
              startIcon={<Person />}
              sx={{ ...navButtonSx(`/profile`), mt: 1 }}
            >
              {user.username}
            </Button>
          ) : (
            <Button
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
              sx={{
                justifyContent: "flex-start",
                bgcolor: catppuccin.mauve,
                color: catppuccin.base,
                borderRadius: 3,
                px: 2,
                py: 1,
                fontWeight: 700,
                textTransform: "none",
                mt: 1,
                "&:hover": {
                  bgcolor: catppuccin.pink,
                },
              }}
            >
              Login
            </Button>
          )}
        </Stack>
      </Box>
    </Grid>
  );
}
