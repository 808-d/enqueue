import { Box, Button, Grid, Stack } from "@mui/material";
import { useAuth } from "../../contexts/authContext";
import { Link, useSearchParams } from "react-router-dom";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import enqueueLogo from "../../assets/enqueue.svg";
import { catppuccin } from "../../theme/catppuccinMocha";
import SearchIcon from "@mui/icons-material/Search";
import { Person } from "@mui/icons-material";
import LoginIcon from "@mui/icons-material/Login";

export function Left() {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }

  return (
    <Grid size={{ xs: 0, md: 2 }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <Stack spacing={2}>
          <Button variant="text" sx={{ width: "fit-content" }}>
            <img src={enqueueLogo} alt="Enqueue" style={{ width: "50px" }} />
          </Button>
          <Button
            component={Link}
            to="/"
            startIcon={<HomeFilledIcon />}
            sx={{
              justifyContent: "flex-start",
              bgcolor: catppuccin.base,
              color: catppuccin.text,
              "&:hover": {
                bgcolor: catppuccin.surface0,
              },
            }}
          >
            Home
          </Button>

          <Button
            startIcon={<TurnedInIcon />}
            sx={{
              justifyContent: "flex-start",
              bgcolor: catppuccin.base,
              color: catppuccin.text,
              "&:hover": {
                bgcolor: catppuccin.surface0,
              },
            }}
          >
            Subscriptions
          </Button>

          <Button
            startIcon={<NotificationsIcon />}
            sx={{
              justifyContent: "flex-start",
              bgcolor: catppuccin.base,
              color: catppuccin.text,
              "&:hover": {
                bgcolor: catppuccin.surface0,
              },
            }}
          >
            Activity
          </Button>
          <Button
            startIcon={<SearchIcon />}
            sx={{
              justifyContent: "flex-start",
              bgcolor: catppuccin.base,
              color: catppuccin.text,
              "&:hover": {
                bgcolor: catppuccin.surface0,
              },
            }}
          >
            Explore
          </Button>
          {user ? (
            <Button
              component={Link}
              to={`/profile?id=${user.id}`}
              startIcon={<Person />}
              sx={{
                justifyContent: "flex-start",
                bgcolor: catppuccin.base,
                color: catppuccin.text,
                "&:hover": {
                  bgcolor: catppuccin.surface0,
                },
              }}
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
                bgcolor: catppuccin.maroon,
                color: catppuccin.base,
                "&:hover": {
                  bgcolor: catppuccin.red,
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
