import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";

import Dashboard from "./pages/Dashboard";
import MySkills from "./pages/MySkills";
import AddSkill from "./pages/AddSkill";
import ExploreSkills from "./pages/ExploreSkills";
import Community from "./pages/Community";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ViewProfile from "./pages/ViewProfile";
import RequestSwap from "./pages/RequestSwap";
import Bookings from "./pages/Bookings";
import ProtectedRoute from "./routes/ProtectedRoute";
import Reviews from "./pages/Reviews";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword  from "./pages/ResetPassword";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/my-skills" element={<ProtectedRoute><MySkills /></ProtectedRoute>} />
        <Route path="/add-skill" element={<ProtectedRoute><AddSkill /></ProtectedRoute>} />
        <Route path="/explore-skills" element={<ProtectedRoute><ExploreSkills /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
        <Route path="/request/:id" element={<ProtectedRoute><RequestSwap /></ProtectedRoute>} />
  
<Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/swaprequests" element={<ProtectedRoute><RequestSwap /></ProtectedRoute>} />
        <Route path="/reviews/:id" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token"  element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}