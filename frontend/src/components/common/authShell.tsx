import type { ReactNode } from "react";
import { Card, CardContent, Container, Stack } from "@mui/material";
import CenteredScreen from "./centeredScreen";
import { useAppTheme } from "../../contexts/themeContext";

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  const { catppuccin } = useAppTheme();

  return (
    <CenteredScreen>
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
            <Stack spacing={3}>{children}</Stack>
          </CardContent>
        </Card>
      </Container>
    </CenteredScreen>
  );
}
