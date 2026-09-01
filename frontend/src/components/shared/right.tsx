import { Grid, Paper } from "@mui/material";

export function Right() {
  return (
    <Grid size={{ xs: 0, md: 2 }}>
      <Paper sx={{ p: 2, minHeight: 200 }}>
        <h1>Right Sidebar</h1>
      </Paper>
    </Grid>
  );
}
