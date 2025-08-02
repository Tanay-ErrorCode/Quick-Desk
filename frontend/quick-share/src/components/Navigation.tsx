import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Dropdown,
  Badge,
} from "react-bootstrap";

const customStyles = {
  headerGradient: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  notificationDropdown: {
    minWidth: "300px",
    maxHeight: "400px",
    overflowY: "auto" as const,
  },
  notificationItem: {
    borderBottom: "1px solid #e9ecef",
    padding: "12px 16px",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
  },
  notificationBell: {
    fontSize: "1.3rem",
    color: "white",
    background: "none",
    border: "none",
    position: "relative" as const,
    padding: "8px",
    borderRadius: "50%",
    transition: "background-color 0.3s ease",
  },
};

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "upgrade" | "ticket" | "system";
}

// Custom Bell Icon Component
const BellIcon = ({
  filled = false,
  size = 20,
}: {
  filled?: boolean;
  size?: number;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      {filled && (
        <path
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
          fill="currentColor"
        />
      )}
    </svg>
  );
};

function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      // Load sample notifications
      const sampleNotifications: Notification[] = [
        {
          id: 1,
          title: "Welcome to QuickDesk!",
          message:
            "Your account has been created successfully. Start by creating your first ticket.",
          time: "2 hours ago",
          read: false,
          type: "system",
        },
        {
          id: 2,
          title: "New Reply on Your Ticket",
          message:
            "Someone replied to your question about React vs Vue.js comparison.",
          time: "1 day ago",
          read: false,
          type: "ticket",
        },
        {
          id: 3,
          title: "Upgrade Request Update",
          message: "Your upgrade request is being reviewed by the admin team.",
          time: "2 days ago",
          read: true,
          type: "upgrade",
        },
        {
          id: 4,
          title: "System Maintenance",
          message:
            "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM.",
          time: "3 days ago",
          read: true,
          type: "system",
        },
      ];

      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter((n) => !n.read).length);
    }

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userCategories");
    localStorage.removeItem("userLanguage");
    localStorage.removeItem("upgradeRequestPending");

    setIsLoggedIn(false);
    setNotifications([]);
    setUnreadCount(0);

    // Dispatch custom event to update other components
    window.dispatchEvent(new Event("authStateChanged"));

    // Redirect to home page
    navigate("/");
  };

  const markAsRead = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "upgrade":
        return "⬆️";
      case "ticket":
        return "🎫";
      case "system":
        return "⚙️";
      default:
        return "📢";
    }
  };

  return (
    <Navbar
      expand="lg"
      sticky="top"
      className="shadow-sm"
      style={customStyles.headerGradient}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-white fw-bold fs-3">
          🎧 QuickDesk
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="text-white mx-2">
              Home
            </Nav.Link>

            {isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/forum" className="text-white mx-2">
                  Forum
                </Nav.Link>
                <Nav.Link as={Link} to="/tickets" className="text-white mx-2">
                  My Tickets
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/create-ticket"
                  className="text-white mx-2"
                >
                  Create Ticket
                </Nav.Link>
                <Nav.Link as={Link} to="/dashboard" className="text-white mx-2">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className="text-white mx-2">
                  Profile
                </Nav.Link>

                {/* Notification Bell - Always visible when logged in */}
                <Dropdown align="end" className="mx-2">
                  <Dropdown.Toggle
                    as="button"
                    style={customStyles.notificationBell}
                    className="position-relative d-flex align-items-center justify-content-center"
                  >
                    <BellIcon filled={unreadCount > 0} size={20} />
                    {unreadCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute"
                        style={{
                          fontSize: "0.6rem",
                          top: "2px",
                          right: "10px",
                          minWidth: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu style={customStyles.notificationDropdown}>
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                      <h6 className="mb-0 fw-bold">Notifications</h6>
                      {unreadCount > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none"
                          onClick={markAllAsRead}
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <BellIcon size={24} />
                        <div className="mt-2">
                          <small>No notifications yet</small>
                        </div>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          style={customStyles.notificationItem}
                          className={`${!notification.read ? "bg-light" : ""}`}
                          onClick={() => markAsRead(notification.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              notification.read ? "transparent" : "#f8f9fa";
                          }}
                        >
                          <div className="d-flex align-items-start">
                            <span className="me-2">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-grow-1">
                              <div
                                className="fw-bold text-dark mb-1"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {notification.title}
                              </div>
                              <div
                                className="text-muted mb-1"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {notification.message}
                              </div>
                              <small className="text-muted">
                                {notification.time}
                              </small>
                              {!notification.read && (
                                <Badge
                                  bg="primary"
                                  className="ms-2"
                                  style={{ fontSize: "0.6rem" }}
                                >
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {notifications.length > 0 && (
                      <div className="text-center py-2 border-top">
                        <Link
                          to="/notifications"
                          className="text-decoration-none small"
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  className="ms-2"
                  style={{ borderRadius: "20px" }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-white mx-2">
                  Login
                </Nav.Link>
                <Link
                  to="/register"
                  className="btn btn-outline-light btn-sm ms-2"
                  style={{ borderRadius: "20px" }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
