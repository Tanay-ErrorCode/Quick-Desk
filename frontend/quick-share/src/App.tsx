import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./screens/HomePage";
import LoginPage from "./screens/LoginPage";
import RegisterPage from "./screens/RegisterPage";
import "bootstrap/dist/css/bootstrap.min.css";
import TicketForumPage from "./screens/TicketForumPage";
import ProfilePage from "./screens/ProfilePage";
import CreateTicketPage from "./screens/CreateTicketPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forum" element={<TicketForumPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-ticket" element={<CreateTicketPage />} />

          <Route path="/tickets" element={<h2>My Tickets</h2>} />
          <Route path="/dashboard" element={<h2>Dashboard</h2>} />
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
