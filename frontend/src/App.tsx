import "./App.css";
import Home from "./pages/home";
import Login from "./pages/login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/signup";
import Verify from "./pages/verify";
import { Profile } from "./pages/profile";
import Compose from "./pages/compose";
import Read from "./pages/read";
import Settings from "./pages/settings/settings";
import VerifyEmailChange from "./pages/verify_email_change";
import { useAppTheme } from "./contexts/themeContext";
import { useEffect } from "react";
import { Box } from "@mui/material";

// import Profile from "./pages/profile";
function App() {
  const { catppuccin } = useAppTheme();

  useEffect(() => {
    document.body.style.backgroundColor = catppuccin.base;
    document.body.style.color = catppuccin.text;
  }, [catppuccin]);
  return (
    <Box
      sx={{
        bgcolor: catppuccin.base,
        minHeight: "100vh",
        color: catppuccin.text,
      }}
    >
      <BrowserRouter>
        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/read" element={<Read />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/verify-email-change" element={<VerifyEmailChange />} />
        </Routes>
      </BrowserRouter>
    </Box>
  );
}

export default App;
