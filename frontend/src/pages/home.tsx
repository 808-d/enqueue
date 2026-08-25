import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import {
  CardContent,
  Card,
  Grid,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import type { Post } from "../models/post";
import { useAuth } from "../contexts/authContext";
import { Left } from "../components/shared/left";
import { Right } from "../components/shared/right";
import FilledTextField from "../components/common/filledTextField";
import { useAppTheme } from "../contexts/themeContext";
function Home() {
  const { loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container spacing={1}>
      <Left />
      <Mid />
      <Right />
    </Grid>
  );
}

function Mid() {
  const { catppuccin } = useAppTheme();
  const { user } = useAuth();

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
        {user && (
          <FilledTextField
            placeholder="What's on your mind?"
            sx={{
              "& .MuiInputAdornment-root": {
                color: catppuccin.subtext1,
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
        )}

        {posts.map((post) => (
          <Card
            key={post.ID}
            elevation={0}
            sx={{
              bgcolor: catppuccin.surface0,
              borderRadius: 3,
              color: catppuccin.text,
            }}
          >
            <CardContent>
              <Typography variant="caption" sx={{ color: catppuccin.subtext1 }}>
                {new Date(post.CreateTime!).toLocaleString()}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {post.Title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: catppuccin.subtext0,
                }}
              >
                {post.Content}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Grid>
  );
}

export default Home;
