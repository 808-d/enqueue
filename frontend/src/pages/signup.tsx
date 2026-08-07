import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Link,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { catppuccin } from "../utils/catppuccinMocha";
import { useState } from "react";
import axios from "axios";
import { endpoints } from "../utils/endpoints";

export default function Signup() {
  const [signUpState, setSignUpState] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [toast, setToast] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });
  const signUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(endpoints.signup, {
        username: signUpState.username,
        email: signUpState.email,
        password: signUpState.password,
      });

      setToast({
        open: true,
        severity: "success",
        message: "Account created! Please check your email to verify it.",
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setToast({
          open: true,
          severity: "error",
          message:
            err.response?.data && err.response.data.trim() !== ""
              ? err.response.data
              : "Request failed",
        });
      } else {
        setToast({
          open: true,
          severity: "error",
          message: "An unexpected error occurred.",
        });
      }
    }
  };

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
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: catppuccin.text,
                  }}
                >
                  enqueue
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color: catppuccin.subtext1,
                  }}
                >
                  Create your account.
                </Typography>
              </Box>
              <Box component="form" onSubmit={signUp}>
                <Stack spacing={2}>
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
                    required
                    sx={textFieldStyle}
                    value={signUpState.username}
                    onChange={(e) =>
                      setSignUpState({
                        ...signUpState,
                        username: e.target.value,
                      })
                    }
                  />

                  <TextField
                    label="Email"
                    type="email"
                    variant="filled"
                    fullWidth
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: catppuccin.subtext1,
                        },
                      },
                    }}
                    required
                    sx={textFieldStyle}
                    value={signUpState.email}
                    onChange={(e) =>
                      setSignUpState({ ...signUpState, email: e.target.value })
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
                    required
                    sx={textFieldStyle}
                    value={signUpState.password}
                    onChange={(e) =>
                      setSignUpState({
                        ...signUpState,
                        password: e.target.value,
                      })
                    }
                  />

                  <TextField
                    label="Confirm Password"
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
                    required
                    sx={textFieldStyle}
                    value={signUpState.confirmPassword}
                    onChange={(e) =>
                      setSignUpState({
                        ...signUpState,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  {signUpState.confirmPassword.length > 0 &&
                    signUpState.password !== signUpState.confirmPassword && (
                      <Typography
                        variant="body2"
                        sx={{ color: catppuccin.red }}
                      >
                        Passwords do not match!
                      </Typography>
                    )}
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
                    type="submit"
                  >
                    Create Account
                  </Button>
                </Stack>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  color: catppuccin.subtext1,
                }}
              >
                Already have an account?{" "}
                <Link
                  href="/login"
                  underline="hover"
                  sx={{
                    color: catppuccin.mauve,
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const textFieldStyle = {
  "& .MuiInputBase-input": {
    color: catppuccin.text,
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
};
