import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { endpoints } from "../utils/endpoints";
import { useAppTheme } from "../contexts/themeContext";
export default function Login() {
  const { catppuccin } = useAppTheme();

  const [loginState, setLoginState] = useState({
    username: "",
    password: "",
  });

  async function login() {
    const response = await axios.post(
      endpoints.login,
      {
        username: loginState.username,
        password: loginState.password,
      },
      {
        withCredentials: true,
      },
    );
    if (response.status === 200) {
      window.location.href = "/";
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: catppuccin.base,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            bgcolor: catppuccin.mantle,
            border: `1px solid ${catppuccin.surface1}`,
            borderRadius: 3,
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box
                sx={{
                  textAlign: "center",
                  mt: 2,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: catppuccin.subtext1,
                    mt: 1,
                  }}
                >
                  Welcome back.
                </Typography>
              </Box>

              <TextField
                label="Username"
                variant="filled"
                fullWidth
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: catppuccin.subtext1,
                    },
                  },
                }}
                sx={{
                  "& .MuiFilledInput-root": {
                    bgcolor: catppuccin.surface0,
                    color: catppuccin.text,

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
                onChange={(e) =>
                  setLoginState((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />

              <TextField
                label="Password"
                type="password"
                variant="filled"
                fullWidth
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: catppuccin.subtext1,
                    },
                  },
                }}
                sx={{
                  "& .MuiFilledInput-root": {
                    bgcolor: catppuccin.surface0,
                    color: catppuccin.text,

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
                onChange={(e) =>
                  setLoginState((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />

              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: catppuccin.mauve,
                  color: catppuccin.base,
                  py: 1.25,
                  fontWeight: 700,

                  "&:hover": {
                    bgcolor: catppuccin.pink,
                  },
                }}
                onClick={login}
              >
                Sign In
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{
                  color: catppuccin.subtext1,
                }}
              >
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  underline="hover"
                  sx={{
                    color: catppuccin.mauve,
                    fontWeight: 600,
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
