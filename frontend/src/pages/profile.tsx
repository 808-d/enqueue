import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useAuth } from "../contexts/authContext";
import { Right } from "../components/shared/right";
import { catppuccin } from "../theme/catppuccinMocha";
import { Left } from "../components/shared/left";
import { useEffect, useMemo, useState } from "react";
import NotesIcon from "@mui/icons-material/Notes";
import ShortTextIcon from "@mui/icons-material/ShortText";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { usePosts } from "../hooks/usePosts";
import { Alert } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Post } from "../models/post";
import PostCard from "../components/shared/postCard";
export function Profile() {
  const { user } = useAuth();
  const { createPost, getPostsByUser, updatePostStatus } = usePosts();
  const [error, setError] = useState(false);
  const [createAnchorEl, setCreateAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");
  const [value, setValue] = useState("1");
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const createMenuOpen = Boolean(createAnchorEl);

  const handleCreateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateAnchorEl(event.currentTarget);
  };

  const handleCreateClose = () => {
    setCreateAnchorEl(null);
  };

  const handleCreate = async () => {
    try {
      await createPost();
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const loadPosts = async () => {
      const response = await getPostsByUser(userId);
      setPosts(response.data);
    };

    loadPosts();
  }, [userId]);

  const postsByStatus = useMemo(() => {
    return {
      drafts: posts.filter((post) => post.Status === 1),
      published: posts.filter((post) => post.Status === 2),
      hidden: posts.filter((post) => post.Status === 3),
    };
  }, [posts]);
  if (!user) {
    return null;
  }

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Left />
      <Grid size={{ xs: 12, md: 8 }}>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: catppuccin.base,
            color: catppuccin.text,
            px: 3,
            py: 4,
          }}
        >
          {/* Profile */}
          <Box
            sx={{
              maxWidth: 700,
              mx: "auto",
            }}
          >
            {/* Avatar + Username */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: catppuccin.text,
                  }}
                >
                  {user.username}
                </Typography>
                <Typography
                  sx={{
                    color: catppuccin.subtext0,
                    mt: 0.25,
                  }}
                >
                  @{user.username}
                </Typography>
              </Box>
              <Avatar
                src={user.avatarUrl ?? undefined}
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: catppuccin.mauve,
                  color: catppuccin.base,
                  fontSize: 42,
                  fontWeight: 700,
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
            {/* User information */}
            <Box sx={{ mt: 2 }}>
              {user.bio && (
                <Typography
                  sx={{
                    mt: 2,
                    maxWidth: 600,
                    color: catppuccin.subtext1,
                    lineHeight: 1.6,
                  }}
                >
                  {user.bio}
                </Typography>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 2,
                  color: catppuccin.subtext0,
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: 18 }} />

                <Typography variant="body2">Joined July 2026</Typography>
              </Box>

              {/* Stats */}
              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  mt: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>42</Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: catppuccin.subtext0 }}
                  >
                    Posts
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 700 }}>128</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: catppuccin.subtext0 }}
                  >
                    Followers
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 700 }}>83</Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: catppuccin.subtext0 }}
                  >
                    Following
                  </Typography>
                </Box>
              </Box>
              {/* function buttons */}
              <Box>
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Button
                      variant="contained"
                      endIcon={<KeyboardArrowDownIcon />}
                      fullWidth
                      size="large"
                      onClick={handleCreateClick}
                      sx={{
                        bgcolor: catppuccin.mauve,
                        color: catppuccin.base,
                        textTransform: "none",
                        borderRadius: 2,
                        "&:hover": {
                          bgcolor: catppuccin.surface0,
                          color: catppuccin.mauve,
                        },
                      }}
                    >
                      Create
                    </Button>

                    <Menu
                      anchorEl={createAnchorEl}
                      open={createMenuOpen}
                      onClose={handleCreateClose}
                      slotProps={{
                        paper: {
                          sx: {
                            mt: 1,
                            bgcolor: catppuccin.mantle,
                            color: catppuccin.text,
                            border: `1px solid ${catppuccin.surface0}`,
                          },
                        },
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          handleCreateClose();
                          // navigate("/create/post");
                        }}
                      >
                        <ListItemIcon>
                          <NotesIcon sx={{ color: catppuccin.mauve }} />
                        </ListItemIcon>

                        <ListItemText
                          primary="Create Post"
                          secondary="Write a full post"
                          slotProps={{
                            secondary: {
                              sx: {
                                color: catppuccin.subtext0,
                              },
                            },
                          }}
                          onClick={handleCreate}
                        />
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          handleCreateClose();
                          // navigate("/create/brief");
                        }}
                      >
                        <ListItemIcon>
                          <ShortTextIcon sx={{ color: catppuccin.blue }} />
                        </ListItemIcon>

                        <ListItemText
                          primary="Create Brief"
                          secondary="What's on your mind?"
                          slotProps={{
                            secondary: {
                              sx: {
                                color: catppuccin.subtext0,
                              },
                            },
                          }}
                        />
                      </MenuItem>
                    </Menu>
                  </Grid>

                  <Grid size="grow">
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: catppuccin.surface1,
                        color: catppuccin.text,
                        textTransform: "none",
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: catppuccin.mauve,
                          bgcolor: catppuccin.surface0,
                        },
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Grid>

                  <Grid>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        minWidth: 48,
                        px: 1,
                        borderColor: catppuccin.surface1,
                        color: catppuccin.text,
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: catppuccin.mauve,
                          bgcolor: catppuccin.surface0,
                        },
                      }}
                    >
                      <MoreHorizIcon />
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <Divider
              sx={{
                borderColor: catppuccin.surface0,
                my: 3,
              }}
            />

            {/* Posts */}
            <Box>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList
                    onChange={handleChange}
                    aria-label="lab API tabs example"
                    sx={{
                      "& .MuiTab-root": {
                        color: catppuccin.text,
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: catppuccin.mauve,
                      },
                      "& .Mui-selected": {
                        color: catppuccin.mauve,
                      },
                    }}
                  >
                    <Tab label="Posts" value="1" />
                    <Tab label="Reposts" value="2" />
                    <Tab label="Liked" value="3" />
                    <Tab label="Drafts" value="4" />
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      p: 0,
                    }}
                  >
                    {postsByStatus.published.map((post) => (
                      <PostCard
                        key={post.ID}
                        id={post.ID}
                        title={post.Title || "No title"}
                        description={post.Description}
                        status={post.Status}
                        updatedAt={post.UpdateTime}
                        onClick={() => navigate(`/compose?id=${post.ID}`)}
                        onDelete={() => updatePostStatus(post.ID)}
                      />
                    ))}
                  </Box>
                </TabPanel>
                <TabPanel value="2">Reposts</TabPanel>
                <TabPanel value="3">Liked</TabPanel>
                <TabPanel value="4">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      p: 0,
                    }}
                  >
                    {postsByStatus.drafts.map((post) => (
                      <PostCard
                        key={post.ID}
                        id={post.ID}
                        title={(post.Title ??= "No title")}
                        description={post.Description}
                        status={post.Status}
                        updatedAt={post.UpdateTime}
                        onClick={() => navigate(`/compose?id=${post.ID}`)}
                        onDelete={(id) => updatePostStatus(id)}
                      />
                    ))}
                  </Box>
                </TabPanel>
              </TabContext>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            ></Box>
          </Box>
        </Box>
      </Grid>
      <Right />
      <Snackbar
        open={error}
        autoHideDuration={4000}
        onClose={() => setError(false)}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setError(false)}
        >
          Failed to create post
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default Profile;
