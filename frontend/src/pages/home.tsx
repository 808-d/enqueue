import SearchIcon from "@mui/icons-material/Search";
import { Grid, InputAdornment, Stack } from "@mui/material";
import { useAuth } from "../contexts/authContext";
import { Left } from "../components/shared/left";
import { Right } from "../components/shared/right";
import FilledTextField from "../components/common/filledTextField";
import { useAppTheme } from "../contexts/themeContext";
function Home() {
	const { loading } = useAuth();
	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<Grid container spacing={1}>
			<Left />
			<Mid />
			<Right />
		</Grid>
	);
}

function Mid() {
  const { catppuccin } = useAppTheme();
  const { user } = useAuth();
  return (
    <Grid size={{ xs: 4, md: 8 }}>
      <Stack spacing={2}>
        {user && (
          <FilledTextField
            placeholder="What's on your mind?"
            sx={{
              "& .MuiInputAdornment-root": {
                color: catppuccin.subtext1,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: catppuccin.mauve }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      </Stack>
    </Grid>
  );
}

export default Home;
