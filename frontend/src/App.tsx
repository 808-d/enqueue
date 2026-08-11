import "./App.css";
import Home from "./pages/home";
import Login from "./pages/login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/signup";
import Verify from "./pages/verify";
import { Profile } from "./pages/profile";
import Compose from "./pages/compose";

// import Profile from "./pages/profile";
function App() {
  return (
    <BrowserRouter>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/compose" element={<Compose />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
