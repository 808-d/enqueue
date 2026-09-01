import { Box, Button, Link, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { endpoints } from "../../utils/endpoints";
import AuthShell from "../../components/common/authShell";
import FilledTextField from "../../components/common/filledTextField";
import { useAppTheme } from "../../contexts/themeContext";

export default function AdminLogin() {
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
      window.location.href = "/admin/dashboard";
    }
  }

  return (
    <AuthShell>
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
          Admin Panel
        </Typography>
      </Box>

      <FilledTextField
        label="Username"
        onChange={(e) =>
          setLoginState((prev) => ({
            ...prev,
            username: e.target.value,
          }))
        }
      />

      <FilledTextField
        label="Password"
        type="password"
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

      <Box sx={{ textAlign: "center", mt: -1 }}>
        <Typography
          sx={{
            color: catppuccin.mauve,
            fontWeight: 600,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Forgot password ?
        </Typography>
      </Box>

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
    </AuthShell>
  );
}
