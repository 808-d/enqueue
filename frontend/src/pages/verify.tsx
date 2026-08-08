import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Box, CircularProgress, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { catppuccin } from "../theme/catppuccinMocha";
import { endpoints } from "../utils/endpoints";

function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.post(endpoints.verify, {
          token,
        });

        setStatus("success");
        setMessage("Your email has been successfully verified!");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setMessage("This verification link is invalid or has expired.");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: catppuccin.base,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 5,
          textAlign: "center",
          bgcolor: catppuccin.surface0,
          borderRadius: 3,
        }}
      >
        {status === "loading" && (
          <>
            <CircularProgress sx={{ color: catppuccin.mauve }} />

            <Typography
              variant="h6"
              sx={{
                mt: 3,
                color: catppuccin.text,
              }}
            >
              Verifying your email...
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon
              sx={{
                fontSize: 64,
                color: catppuccin.green,
              }}
            />

            <Typography
              variant="h5"
              sx={{
                mt: 2,
                color: catppuccin.text,
                fontWeight: 700,
              }}
            >
              Email verified!
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: catppuccin.subtext1,
              }}
            >
              Your account has been successfully verified.
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: catppuccin.overlay1,
              }}
            >
              Redirecting to login...
            </Typography>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: catppuccin.red,
              }}
            />

            <Typography
              variant="h5"
              sx={{
                mt: 2,
                color: catppuccin.text,
                fontWeight: 700,
              }}
            >
              Verification failed
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: catppuccin.subtext1,
              }}
            >
              {message}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default Verify;
