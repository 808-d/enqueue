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
import ResetPassword from "./pages/resetPassword";
import Activity from "./pages/activity";
import ErrorPage from "./pages/ErrorPage";
import AdminLogin from "./pages/admin/login/login";
import AdminDashboard from "./pages/admin/dashboard/dashboard";
import AdminForgotPassword from "./pages/admin/forgot-password/forgotPassword";
import AdminResetPassword from "./pages/admin/reset-password/resetPassword";

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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/admin/reset-password" element={<AdminResetPassword />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </Box>
  );
}

export default App;
