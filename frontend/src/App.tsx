import "./App.css";
import Home from "./pages/home";
import Login from "./pages/login";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/signup";
import Verify from "./pages/verify";
import { Profile } from "./pages/profile";
import Publish from "./pages/publish";

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
    <Route path="/publish" element={<Publish />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
