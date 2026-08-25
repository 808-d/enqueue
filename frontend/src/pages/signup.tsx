import { Alert, Box, Button, Link, Snackbar, Stack, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { endpoints } from "../utils/endpoints";
import AuthShell from "../components/common/authShell";
import FilledTextField from "../components/common/filledTextField";
import { useAppTheme } from "../contexts/themeContext";

export default function Signup() {
  const { catppuccin } = useAppTheme();
  const [signUpState, setSignUpState] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [toast, setToast] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const signUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
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
          <FilledTextField
            label="Name"
            required
            value={signUpState.username}
            onChange={(e) =>
              setSignUpState({
                ...signUpState,
                name: e.target.value,
              })
            }
          />
          <FilledTextField
            label="Username"
            required
            value={signUpState.username}
            onChange={(e) =>
              setSignUpState({
                ...signUpState,
                username: e.target.value,
              })
            }
          />

          <FilledTextField
            label="Email"
            type="email"
            required
            value={signUpState.email}
            onChange={(e) =>
              setSignUpState({ ...signUpState, email: e.target.value })
            }
          />

          <FilledTextField
            label="Password"
            type="password"
            required
            value={signUpState.password}
            onChange={(e) =>
              setSignUpState({
                ...signUpState,
                password: e.target.value,
              })
            }
          />

          <FilledTextField
            label="Confirm Password"
            type="password"
            required
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
              <Typography variant="body2" sx={{ color: catppuccin.red }}>
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
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Account"}
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
    </AuthShell>
  );
}
