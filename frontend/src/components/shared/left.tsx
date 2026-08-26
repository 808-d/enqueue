import { Box, Button, Grid, Stack, Badge, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { useAuth } from "../../contexts/authContext";
import { Link, useLocation } from "react-router-dom";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import enqueueLogo from "../../assets/enqueue.svg";
import SearchIcon from "@mui/icons-material/Search";
import { Person } from "@mui/icons-material";
import LoginIcon from "@mui/icons-material/Login";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAppTheme } from "../../contexts/themeContext";
import { useNotifications } from "../../contexts/notificationContext";
import { useState } from "react";

export function Left() {
  const { user, loading, logout } = useAuth();
  const { catppuccin } = useAppTheme();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (loading) {
    return null;
  }

  const navButtonSx = (path: string) => {
    const isActive = location.pathname === path;
    return {
      justifyContent: { xs: "center", sm: "center", md: "flex-start" },
      bgcolor: isActive ? catppuccin.surface0 : "transparent",
      color: isActive ? catppuccin.mauve : catppuccin.text,
      borderRadius: 3,
      minWidth: 0,
      px: { xs: 1.5, md: 2 },
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
        mr: { xs: 0, sm: 0, md: 1.5 },
      },
    };
  };

  const labelSx = {
    display: { xs: "none", sm: "none", md: "inline" },
  };

  const navItems = (
    <>
      <Button
        component={Link}
        to="/"
        startIcon={<HomeFilledIcon />}
        sx={navButtonSx("/")}
      >
        <Box component="span" sx={labelSx}>
          Home
        </Box>
      </Button>

      {user && (
        <>
          <Button
            startIcon={<TurnedInIcon />}
            sx={navButtonSx("/subscriptions")}
          >
            <Box component="span" sx={labelSx}>
              Subscriptions
            </Box>
          </Button>

          <Badge badgeContent={unreadCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 10, minWidth: 16, height: 16 } }}>
            <Button
              component={Link}
              to="/activity"
              startIcon={<NotificationsIcon />}
              sx={navButtonSx("/activity")}
            >
              <Box component="span" sx={labelSx}>
                Activity
              </Box>
            </Button>
          </Badge>
        </>
      )}

      <Button startIcon={<SearchIcon />} sx={navButtonSx("/explore")}>
        <Box component="span" sx={labelSx}>
          Explore
        </Box>
      </Button>

      {user && (
        <Button
          startIcon={<SettingsIcon />}
          component={Link}
          to="/settings"
          sx={navButtonSx("/settings")}
        >
          <Box component="span" sx={labelSx}>
            Settings
          </Box>
        </Button>
      )}

      {user ? (
        <>
          <Button
            startIcon={<Person />}
            sx={{ ...navButtonSx("/profile"), mt: { xs: 0, sm: 1 } }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Box component="span" sx={labelSx}>
              {user.username}
            </Box>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            sx={{ mt: 1 }}
          >
            <MenuItem
              component={Link}
              to={`/profile?id=${user.id}`}
              onClick={() => setAnchorEl(null)}
            >
              <ListItemIcon>
                <Person sx={{ color: catppuccin.text }} />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await logout();
              }}
            >
              <ListItemIcon>
                <LogoutIcon sx={{ color: catppuccin.red }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button
          component={Link}
          to="/login"
          startIcon={<LoginIcon />}
          sx={{
            justifyContent: { xs: "center", sm: "center", md: "flex-start" },
            bgcolor: catppuccin.mauve,
            color: catppuccin.base,
            borderRadius: 3,
            minWidth: 0,
            px: { xs: 1.5, md: 2 },
            py: 1,
            fontWeight: 700,
            textTransform: "none",
            mt: { xs: 0, sm: 1 },
            "&:hover": {
              bgcolor: catppuccin.pink,
            },
          }}
        >
          <Box component="span" sx={labelSx}>
            Login
          </Box>
        </Button>
      )}
    </>
  );

  return (
    <>
      {/* xs: horizontal bottom nav */}
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: catppuccin.base,
          borderTop: `1px solid ${catppuccin.surface0}`,
          justifyContent: "space-around",
          alignItems: "center",
          py: 1,
          zIndex: 10,
        }}
      >
        {navItems}
      </Box>

      {/* sm+: vertical rail (icon-only at sm, full at md+) */}
      <Grid
        size={{ xs: 0, sm: 1, md: 2 }}
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            height: "100vh",
            px: { sm: 1, md: 2 },
            py: 3,
          }}
        >
          <Stack spacing={0.5}>
            <Button
              component={Link}
              to="/"
              variant="text"
              sx={{ width: "fit-content", mb: 2, p: 0, minWidth: 0 }}
            >
              <img src={enqueueLogo} alt="Enqueue" style={{ width: "50px" }} />
            </Button>

            {navItems}
          </Stack>
        </Box>
      </Grid>
    </>
  );
}
