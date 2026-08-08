import Button from "@mui/material/Button";
import { catppuccin } from "../theme/catppuccinMocha";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import SearchIcon from "@mui/icons-material/Search";
import LoginIcon from "@mui/icons-material/Login";
import { useState } from "react";
import {
  CardContent,
  Box,
  Card,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import enqueueLogo from "../assets/enqueue.svg";
import type { Post } from "../models/post";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import {
  Person,
  PersonPinCircle,
  PersonPinCircleRounded,
} from "@mui/icons-material";
function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not logged in</div>;
  }
  return (
    <Grid container spacing={1}>
      <Left />
      <Mid />
      <Grid size={{ xs: 4, md: 2 }}>{/* <Item> Right </Item> */}</Grid>
    </Grid>
  );
}

function Left() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Grid size={{ xs: 3, md: 2 }}>
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
            to="/profile"
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
            Profile
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
    </Grid>
  );
}

function Mid() {
  const [posts] = useState<Post[]>([
    {
      id: crypto.randomUUID(),
      title: "Welcome to enqueue",
      content:
        "This is the first dummy post. Once the backend is ready, this list will be fetched from the API.",
      isDelete: false,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Why I switched to Rust",
      content:
        "Rust's ownership system has made me think differently about designing backend services.",
      isDelete: false,
      createTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updateTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Catppuccin everywhere",
      content:
        "From my terminal to my editor and my website, everything is Catppuccin Mocha.",
      isDelete: false,
      createTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updateTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]);

  return (
    <Grid size={{ xs: 4, md: 8 }}>
      <Stack spacing={2}>
        <TextField
          placeholder="What's on your mind?"
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

        {posts.map((post) => (
          <Card
            key={post.id}
            elevation={0}
            sx={{
              bgcolor: catppuccin.surface0,
              borderRadius: 3,
              color: catppuccin.text,
            }}
          >
            <CardContent>
              <Typography variant="caption" sx={{ color: catppuccin.subtext1 }}>
                {new Date(post.createTime).toLocaleString()}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {post.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: catppuccin.subtext0,
                }}
              >
                {post.content}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Grid>
  );
}
function Right() {}

export default Home;
