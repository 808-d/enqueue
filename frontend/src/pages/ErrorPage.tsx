import { Box, Button, Typography } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppTheme } from "../contexts/themeContext";

type ErrorConfig = {
  title: string;
  message: string;
  showHomeButton: boolean;
};

const errorConfigs: Record<number, ErrorConfig> = {
  400: {
    title: "Bad Request",
    message: "The request could not be understood by the server.",
    showHomeButton: true,
  },
  401: {
    title: "Unauthorized",
    message: "You need to sign in to access this page.",
    showHomeButton: true,
  },
  403: {
    title: "Forbidden",
    message: "You don't have permission to access this resource.",
    showHomeButton: true,
  },
  404: {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist or has been moved.",
    showHomeButton: true,
  },
  500: {
    title: "Internal Server Error",
    message: "Something went wrong on our end. Please try again later.",
    showHomeButton: true,
  },
  502: {
    title: "Bad Gateway",
    message: "The server received an invalid response from the upstream server.",
    showHomeButton: true,
  },
  503: {
    title: "Service Unavailable",
    message: "The service is temporarily unavailable. Please try again later.",
    showHomeButton: true,
  },
};

const defaultConfig: ErrorConfig = {
  title: "Error",
  message: "An unexpected error occurred.",
  showHomeButton: true,
};

export default function ErrorPage() {
  const { catppuccin } = useAppTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const statusCode = parseInt(searchParams.get("code") || "500", 10);
  const config = errorConfigs[statusCode] || defaultConfig;

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: catppuccin.base,
        color: catppuccin.text,
        px: 3,
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          maxWidth: 480,
          px: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: "8rem",
            fontWeight: 800,
            color: catppuccin.red,
            lineHeight: 1,
            mb: 1,
          }}
        >
          {statusCode}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: catppuccin.subtext1,
            mb: 2,
            fontWeight: 600,
          }}
        >
          {config.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: catppuccin.subtext0,
            mb: 4,
            lineHeight: 1.6,
          }}
        >
          {config.message}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          {config.showHomeButton && (
            <Button
              variant="contained"
              size="large"
              onClick={handleGoHome}
              sx={{
                bgcolor: catppuccin.mauve,
                color: catppuccin.base,
                fontWeight: 700,
                "&:hover": {
                  bgcolor: catppuccin.pink,
                },
              }}
            >
              Go Home
            </Button>
          )}

          <Button
            variant="outlined"
            size="large"
            onClick={handleGoBack}
            sx={{
              color: catppuccin.text,
              borderColor: catppuccin.surface1,
              fontWeight: 600,
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
