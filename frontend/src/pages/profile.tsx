import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import RepeatIcon from "@mui/icons-material/Repeat";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useAuth } from "../contexts/authContext";
import { Right } from "../components/shared/right";
import { catppuccin } from "../theme/catppuccinMocha";
import { Left } from "../components/shared/left";
import { useState } from "react";
import NotesIcon from "@mui/icons-material/Notes";
import ShortTextIcon from "@mui/icons-material/ShortText";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
export function Profile() {
  const { user } = useAuth();
  const [createAnchorEl, setCreateAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const createMenuOpen = Boolean(createAnchorEl);

  const handleCreateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateAnchorEl(event.currentTarget);
  };

  const handleCreateClose = () => {
    setCreateAnchorEl(null);
  };
  const posts = [
    {
      id: 1,
      type: "post",
      content:
        "Just finished implementing email verification in Enqueue. The authentication flow is finally starting to come together!",
      time: "2h",
      likes: 12,
      comments: 3,
      reposts: 2,
    },
    {
      id: 2,
      type: "repost",
      content:
        "A good database schema can make the rest of your application dramatically easier to reason about.",
      time: "5h",
      likes: 31,
      comments: 6,
      reposts: 11,
    },
    {
      id: 3,
      type: "post",
      content:
        "PostgreSQL + Go + React has been a really fun stack to work with.",
      time: "1d",
      likes: 24,
      comments: 5,
      reposts: 4,
    },
  ];

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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Posts
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {posts.map((post) => (
                <Paper
                  key={post.id}
                  elevation={0}
                  sx={{
                    bgcolor: catppuccin.mantle,
                    color: catppuccin.text,
                    borderRadius: 2,
                    p: 2.5,
                  }}
                >
                  {/* Repost indicator */}
                  {post.type === "repost" && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        mb: 1.5,
                        color: catppuccin.subtext0,
                      }}
                    >
                      <RepeatIcon sx={{ fontSize: 17 }} />

                      <Typography variant="caption">
                        {user.username} reposted
                      </Typography>
                    </Box>
                  )}

                  {/* Post header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Avatar
                        src={user.avatarUrl ?? undefined}
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: catppuccin.mauve,
                          color: catppuccin.base,
                          fontWeight: 700,
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>

                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            lineHeight: 1.2,
                          }}
                        >
                          {user.username}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: catppuccin.subtext0,
                          }}
                        >
                          @{user.username} · {post.time}
                        </Typography>
                      </Box>
                    </Box>

                    <IconButton
                      size="small"
                      sx={{
                        color: catppuccin.subtext1,
                      }}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  </Box>

                  {/* Content */}
                  <Typography
                    sx={{
                      mt: 2,
                      lineHeight: 1.7,
                    }}
                  >
                    {post.content}
                  </Typography>

                  <Divider
                    sx={{
                      my: 2,
                      borderColor: catppuccin.surface0,
                    }}
                  />

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      startIcon={<FavoriteBorderIcon />}
                      sx={{
                        color: catppuccin.subtext1,
                        textTransform: "none",
                        "&:hover": {
                          color: catppuccin.red,
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      {post.likes}
                    </Button>

                    <Button
                      startIcon={<ChatBubbleOutlineIcon />}
                      sx={{
                        color: catppuccin.subtext1,
                        textTransform: "none",
                        "&:hover": {
                          color: catppuccin.blue,
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      {post.comments}
                    </Button>

                    <Button
                      startIcon={<RepeatIcon />}
                      sx={{
                        color: catppuccin.subtext1,
                        textTransform: "none",
                        "&:hover": {
                          color: catppuccin.green,
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      {post.reposts}
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      </Grid>
      <Right />
    </Grid>
  );
}

export default Profile;
