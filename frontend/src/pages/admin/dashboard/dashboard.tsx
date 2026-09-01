import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { useAppTheme } from "../../contexts/themeContext";

export default function AdminDashboard() {
  const { catppuccin } = useAppTheme();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ color: catppuccin.subtext1 }}>
        Admin Dashboard
      </Typography>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 600 }} aria-label="admin data table">
          <TableBody>
            <TableRow>
              <TableCell>Posts</TableCell>
              <TableCell align="right">1,234</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Users</TableCell>
              <TableCell align="right">567</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Comments</TableCell>
              <TableCell align="right">3,456</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
