import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Badge,
  Dropdown,
  Button,
} from "react-bootstrap";
import { apiService } from "../services/api";

function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole") || "End User";
    const name = localStorage.getItem("userName") || "User";
    
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(name);

    if (loggedIn) {
      loadNotifications();
    }

    // Listen for auth state changes
    const handleAuthStateChange = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const role = localStorage.getItem("userRole") || "End User";
      const name = localStorage.getItem("userName") || "User";
      setIsLoggedIn(loggedIn);
      setUserRole(role);
      setUserName(name);

      if (loggedIn) {
        loadNotifications();
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    window.addEventListener("storage", handleAuthStateChange);
    window.addEventListener("authStateChanged", handleAuthStateChange);

    return () => {
      window.removeEventListener("storage", handleAuthStateChange);
      window.removeEventListener("authStateChanged", handleAuthStateChange);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications({ limit: 10, is_read: false });
      if (response.success && response.notifications) {
        setNotifications(response.notifications);
        setUnreadCount(response.unread_count || response.notifications.length);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      // Fallback to empty array if API fails
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all authentication data
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userPhone");
      localStorage.removeItem("userDepartment");
      localStorage.removeItem("upgradeRequestPending");
      localStorage.removeItem("userCategories");
      localStorage.removeItem("userLanguage");

      // Dispatch custom event
      window.dispatchEvent(new Event('authStateChanged'));

      // Redirect to home
      navigate("/");
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return "🎫";
      case "upgrade":
        return "⬆️";
      case "system":
        return "⚙️";
      case "assignment":
        return "📝";
      case "reply":
        return "💬";
      default:
        return "📢";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "danger";
      case "Support Agent":
        return "warning";
      case "End User":
        return "primary";
      default:
        return "secondary";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div>
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          QuickDesk
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            {isLoggedIn && (
              <>
                <Nav.Link as={Link} to="/forum">
                  Forum
                </Nav.Link>
                <Nav.Link as={Link} to="/create-ticket">
                  Create Ticket
                </Nav.Link>
                <Nav.Link as={Link} to="/dashboard">
                  Dashboard
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="align-items-center">
            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <Dropdown align="end" className="me-3">
                  <Dropdown.Toggle
                    variant="outline-primary"
                    className="position-relative border-0"
                    style={{ background: "transparent" }}
                  >
                    🔔
                    {unreadCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu style={{ minWidth: "350px", maxHeight: "400px", overflowY: "auto" }}>
                    <Dropdown.Header className="d-flex justify-content-between align-items-center">
                      <span>Notifications</span>
                      <Link 
                        to="/notifications" 
                        className="text-decoration-none small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        View All
                      </Link>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    
                    {notifications.length === 0 ? (
                      <Dropdown.ItemText className="text-center text-muted py-3">
                        No notifications
                      </Dropdown.ItemText>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <Dropdown.Item
                          key={notification.id}
                          className={`${!notification.is_read ? 'bg-light' : ''} border-bottom`}
                          onClick={() => markAsRead(notification.id)}
                          style={{ whiteSpace: "normal", padding: "10px 15px" }}
                        >
                          <div className="d-flex align-items-start">
                            <span className="me-2" style={{ fontSize: "1.2rem" }}>
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-grow-1">
                              <div className="fw-bold small text-dark">
                                {notification.title}
                              </div>
                              <div className="text-muted small mb-1">
                                {notification.message}
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                {formatTimeAgo(notification.created_at)}
                              </div>
                            </div>
                            {!notification.is_read && (
                              <Badge bg="primary" className="ms-2" style={{ fontSize: "0.6rem" }}>
                                New
                              </Badge>
                            )}
                          </div>
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                {/* User Menu */}
                <NavDropdown
                  title={
                    <span>
                      👤 {userName}{" "}
                      <Badge bg={getRoleBadgeColor(userRole)} className="ms-1">
                        {userRole}
                      </Badge>
                    </span>
                  }
                  id="user-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link as any} to="/profile">
                    👤 Profile
                  </NavDropdown.Item>
                  
                  {userRole === "Admin" && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Header>Admin Panel</NavDropdown.Header>
                      <NavDropdown.Item as={Link as any} to="/admin/dashboard">
                        🛡️ Admin Dashboard
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link as any} to="/admin/users">
                        👥 User Management
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link as any} to="/admin/tickets">
                        🎫 All Tickets
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link as any} to="/admin/categories">
                        📂 Categories
                      </NavDropdown.Item>
                    </>
                  )}
                  
                  {userRole === "Support Agent" && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link as any} to="/staff/dashboard">
                        🛠️ Staff Dashboard
                      </NavDropdown.Item>
                    </>
                  )}
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    🚪 Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button
                  as={Link as any}
                  to="/login"
                  variant="outline-primary"
                  className="me-2"
                >
                  Login
                </Button>
                <Button as={Link as any} to="/register" variant="primary">
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      </Navbar>
    </div>
  );
}

export default Navigation;