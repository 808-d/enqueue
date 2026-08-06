import Button from "@mui/material/Button";
import { catppuccin } from "../components/shared/CatppuccinMocha";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import SearchIcon from "@mui/icons-material/Search";
import { Post } from "../models/post";
import LoginIcon from "@mui/icons-material/Login";
import { useState } from "react";
import { Box, Grid, InputAdornment, Stack, TextField } from "@mui/material";
import enqueueLogo from "../assets/enqueue.svg";
function Home() {
  return (
    <Grid container spacing={1}>
      <Left />
      <Mid />
      <Grid size={{ xs: 4, md: 2 }}>{/* <Item> Right </Item> */}</Grid>
    </Grid>
  );
}

function Left() {
  return (
    <Grid size={{ xs: 3, md: 2 }}>
      <Stack spacing={2}>
        <Button variant="text" sx={{ width: "fit-content" }}>
          <img src={enqueueLogo} alt="Enqueue" style={{ width: "50px" }} />
        </Button>
        <Button
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
          Profile
        </Button>

        <Button
          startIcon={<LoginIcon />}
          sx={{
            justifyContent: "flex-start",
            bgcolor: catppuccin.maroon,
            color: catppuccin.base,
            "&:hover": {
              bgcolor: catppuccin.red,
            },
          }}
          href="/login"
        >
          Login
        </Button>
      </Stack>
    </Grid>
  );
}

function Mid() {
  const [posts, setPosts] = useState<Post[]>([]);

  return (
    <Grid size={{ xs: 4, md: 8 }}>
      <Box sx={{ display: "flex", alignItems: "flex-end" }}>
        <TextField
          placeholder="What's on your mind"
          variant="filled"
          fullWidth
          sx={{
            "& .MuiInputBase-input": {
              color: catppuccin.text,
            },
            "& .MuiInputAdornment-root": {
              color: catppuccin.subtext1,
            },
            "& .MuiFilledInput-root": {
              bgcolor: catppuccin.surface0,
              "&:hover": {
                bgcolor: catppuccin.surface1,
              },
              "&.Mui-focused": {
                bgcolor: catppuccin.surface1,
              },
              "&:after": {
                borderBottom: `2px solid ${catppuccin.mauve}`,
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: catppuccin.mauve }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </Grid>
  );
}
function Right() {}

export default Home;
