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
import { Left } from "../components/shared/left";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useAppTheme } from "../contexts/themeContext";
import { Link } from "react-router-dom";
import type { ProfileData } from "../models/proifleData";
import { useUsers } from "../hooks/useUsers";
import { useFollows } from "../hooks/useFollows";
export function Profile() {
  const { catppuccin } = useAppTheme();
  const { user } = useAuth();
  const { createPost, getPostsByUser, updatePostStatus } = usePosts();
  const {
    followUser,
    unfollowUser,
    isFollowing: checkIsFollowing,
    countFollowers,
    countFollowing,
  } = useFollows();
  const { getUserById } = useUsers();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");
  const [value, setValue] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<ProfileData>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [createAnchorEl, setCreateAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const hasLoaded = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !user || user.id === userId) return;
    const loadFollowStatus = async () => {
      try {
        const following = await checkIsFollowing(userId);
        setIsFollowing(following);
      } catch {
        setIsFollowing(false);
      }
    };
    loadFollowStatus();
  }, [userId, user]);

  useEffect(() => {
    if (!userId) return;
    const loadCounts = async () => {
      try {
        const [followers, following] = await Promise.all([
          countFollowers(userId),
          countFollowing(userId),
        ]);
        setFollowersCount(followers);
        setFollowingCount(following);
      } catch {
        setFollowersCount(0);
        setFollowingCount(0);
      }
    };
    loadCounts();
  }, [userId]);
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: string | number,
  ) => {
    setValue(typeof newValue === "number" ? newValue : Number(newValue));
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
    if (!userId || hasLoaded.current) return;
    hasLoaded.current = true;
    const getUser = async () => {
      const response = await getUserById(userId);
      setProfile(response.data);
    };
    const loadPosts = async () => {
      const response = await getPostsByUser(userId);
      setPosts(response.data || []);
    };
    getUser();
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

  const isOwnProfile = user.id == userId;

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Left />
      <Grid size={{ xs: 11, md: 8 }}>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: catppuccin.base,
            color: catppuccin.text,
          }}
        >
          {/* Profile */}
          <Box
            sx={{
              maxWidth: 700,
              mx: "auto",
              px: 3,
            }}
          >
            {/* Avatar + Name / Username */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                mt: 2,
              }}
            >
              <Avatar
                src={profile?.Avatar ?? undefined}
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: catppuccin.mauve,
                  color: catppuccin.base,
                  fontSize: 42,
                  fontWeight: 700,
                  border: `4px solid ${catppuccin.base}`,
                  flexShrink: 0,
                }}
              >
                {profile?.Username.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: catppuccin.text,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {profile?.Username}
                </Typography>
                <Typography
                  sx={{
                    color: catppuccin.subtext0,
                    mt: 0.25,
                    fontSize: "0.95rem",
                  }}
                >
                  @{profile?.Username}
                </Typography>
              </Box>
            </Box>

            {/* Bio */}
            {profile?.Bio && (
              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 600,
                  color: catppuccin.subtext1,
                  lineHeight: 1.7,
                  fontSize: "1rem",
                  textAlign: "left",
                }}
              >
                {profile?.Bio}
              </Typography>
            )}

            {/* Joined date */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 2,
                color: catppuccin.subtext0,
              }}
            >
              <CalendarMonthIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">Joined July 2026</Typography>
            </Box>

            {/* Stats */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 3,
              }}
            >
              {[
                { label: "Posts", value: postsByStatus.published.length },
                { label: "Followers", value: followersCount },
                { label: "Following", value: followingCount },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 0.75,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: catppuccin.mantle,
                    cursor: "default",
                    "&:hover": { bgcolor: catppuccin.surface0 },
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: catppuccin.subtext0 }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* function buttons */}
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={1}>
                {isOwnProfile ? (
                  <>
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
                          fontWeight: 600,
                          borderRadius: 2,
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: catppuccin.pink,
                            boxShadow: "none",
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
                              borderRadius: 2,
                              minWidth: 220,
                            },
                          },
                        }}
                      >
                        <MenuItem
                          onClick={() => {
                            handleCreateClose();
                            // navigate("/create/post");
                          }}
                          sx={{ py: 1.25 }}
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
                          sx={{ py: 1.25 }}
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
                        component={Link}
                        to="/settings"
                        fullWidth
                        variant="outlined"
                        size="large"
                        sx={{
                          borderColor: catppuccin.surface1,
                          color: catppuccin.text,
                          textTransform: "none",
                          fontWeight: 600,
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
                  </>
                ) : (
                  <>
                    <Grid size="grow">
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={async () => {
                          if (loading || !userId) return;
                          setLoading(true);
                          try {
                            if (isFollowing) {
                              await unfollowUser(userId);
                            } else {
                              await followUser(userId);
                            }
                            setIsFollowing((prev) => !prev);
                          } catch {
                            setError(true);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        sx={{
                          bgcolor: isFollowing
                            ? catppuccin.surface1
                            : catppuccin.mauve,
                          color: catppuccin.base,
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: isFollowing
                              ? catppuccin.surface2
                              : catppuccin.pink,
                            boxShadow: "none",
                          },
                        }}
                      >
                        {isFollowing ? "Following" : "Follow"}
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
                  </>
                )}
              </Grid>
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
                <Box sx={{ borderBottom: `1px solid ${catppuccin.surface0}` }}>
                  <TabList
                    onChange={handleChange}
                    aria-label="profile content tabs"
                    sx={{
                      minHeight: 44,
                      "& .MuiTab-root": {
                        color: catppuccin.subtext0,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        minHeight: 44,
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: catppuccin.mauve,
                        height: 2,
                      },
                      "& .Mui-selected": {
                        color: `${catppuccin.text} !important`,
                      },
                    }}
                  >
                    <Tab label="Posts" value={1} />
                    <Tab label="Reposts" value={2} />
                    <Tab label="Liked" value={3} />
                    <Tab label="Drafts" value={4} />
                  </TabList>
                </Box>
                <TabPanel value={1} sx={{ px: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      p: 0,
                    }}
                  >
                    {postsByStatus.published.length === 0 && (
                      <Typography
                        sx={{
                          color: catppuccin.overlay0,
                          py: 4,
                          textAlign: "center",
                        }}
                      >
                        No posts published yet.
                      </Typography>
                    )}
                    {postsByStatus.published.map((post) => (
                      <PostCard
                        key={post.ID}
                        id={post.ID}
                        title={post.Title || "No title"}
                        description={post.Description}
                        status={post.Status}
                        updatedAt={post.UpdateTime}
                        onClick={() => navigate(`/read?id=${post.ID}`)}
                        onDelete={() => updatePostStatus(post.ID)}
                      />
                    ))}
                  </Box>
                </TabPanel>
                <TabPanel value={2} sx={{ px: 0 }}>
                  <Typography
                    sx={{
                      color: catppuccin.overlay0,
                      py: 4,
                      textAlign: "center",
                    }}
                  >
                    Reposts
                  </Typography>
                </TabPanel>
                <TabPanel value={3} sx={{ px: 0 }}>
                  <Typography
                    sx={{
                      color: catppuccin.overlay0,
                      py: 4,
                      textAlign: "center",
                    }}
                  >
                    Liked
                  </Typography>
                </TabPanel>
                <TabPanel value={4} sx={{ px: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      p: 0,
                    }}
                  >
                    {postsByStatus.drafts.length === 0 && (
                      <Typography
                        sx={{
                          color: catppuccin.overlay0,
                          py: 4,
                          textAlign: "center",
                        }}
                      >
                        No drafts yet.
                      </Typography>
                    )}
                    {postsByStatus.drafts.map((post) => (
                      <PostCard
                        key={post.ID}
                        id={post.ID}
                        title={(post.Title ??= "No title")}
                        description={post.Description}
                        status={post.Status}
                        updatedAt={post.UpdateTime}
                        onDelete={(id) => updatePostStatus(id)}
                      />
                    ))}
                  </Box>
                </TabPanel>
              </TabContext>
            </Box>
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
