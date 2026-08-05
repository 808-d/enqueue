import { Grid, Paper, Stack, styled } from "@mui/material";
import "./App.css";
import Button from "@mui/material/Button";
import { catppuccin } from "./shared/CatppuccinMocha";

function App() {
  return (
    <>
    <Home />
    </>
  );
}
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));
function Home() {

  return (
    <Grid container spacing={1}>
    <Grid size={{ xs: 3, md: 2 }}>
    <Stack spacing={2}>
    <Button
    sx={{
      bgcolor: catppuccin.base,
      color: catppuccin.text,
      "&:hover": {
	bgcolor: catppuccin.surface0,
      },
    }}
    >
    Item1
    </Button>
    <Button variant="contained">Item2</Button>
    <Button variant="contained">Item3</Button>
    </Stack>
    </Grid>
    <Grid size={{ xs: 4, md: 7 }}>
    <Item> Middle</Item>
    </Grid>
    <Grid size={{ xs: 4, md: 3 }}>
    <Item> Right </Item>
    </Grid>
    </Grid>
  );
}
export default App;
