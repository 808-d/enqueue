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
import { catppuccin } from "../components/shared/CatppuccinMocha";

export default function Signup() {
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
                sx={textFieldStyle}
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
                sx={textFieldStyle}
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
                sx={textFieldStyle}
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
                sx={textFieldStyle}
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
              >
                Create Account
              </Button>

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
