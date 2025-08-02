import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./screens/HomePage";
import LoginPage from "./screens/LoginPage";
import RegisterPage from "./screens/RegisterPage";
import "bootstrap/dist/css/bootstrap.min.css";
import TicketForumPage from "./screens/TicketForumPage";
import ProfilePage from "./screens/ProfilePage";
import CreateTicketPage from "./screens/CreateTicketPage";
import DashboardPage from "./screens/DashboardPage";
import TicketReplyPage from "./screens/TicketReplyPage";
import AdminDashboardPage from "./screens/AdminDashboardPage";
import AdminUserManagementPage from "./screens/AdminUserManagementPage";
import AdminAllTicketsPage from "./screens/AdminAllTicketsPage";
import AdminCategoryManagementPage from "./screens/AdminCategoryManagementPage";
import AllNotificationsPage from "./screens/AllNotificationsPage";
import StaffDashboardPage from "./screens/StaffDashboardPage";
import ForgotPasswordPage from "./screens/ForgotPasswordPage";

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ticket/:ticketId" element={<TicketReplyPage />} />
          <Route path="/notifications" element={<AllNotificationsPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />


          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUserManagementPage />} />
          <Route path="/admin/tickets" element={<AdminAllTicketsPage />} />
          <Route path="/admin/categories" element={<AdminCategoryManagementPage />} />
          <Route path="/admin/agents" element={<AdminUserManagementPage />} />

          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={<StaffDashboardPage />} />

          <Route path="/tickets" element={<h2>My Tickets</h2>} />
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
