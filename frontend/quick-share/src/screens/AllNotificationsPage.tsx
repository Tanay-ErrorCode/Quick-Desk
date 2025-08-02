import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Alert,
  Dropdown,
  ListGroup,
  Modal,
} from "react-bootstrap";
import Navigation from "../components/Navigation";

const customStyles = {
  notificationCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
  customButton: {
    borderRadius: "25px",
    padding: "8px 20px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  unreadNotification: {
    backgroundColor: "#f8f9fa",
    borderLeft: "4px solid #007bff",
  },
  urgentNotification: {
    backgroundColor: "#fff5f5",
    borderLeft: "4px solid #dc3545",
  },
};

interface Notification {
  id: number;
  type: "ticket" | "system" | "assignment" | "mention" | "upgrade" | "reminder";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isUrgent: boolean;
  actionUrl?: string;
  actionText?: string;
  sender?: string;
  ticketId?: number;
}

function AllNotificationsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole") || "End User";
    const name = localStorage.getItem("userName") || "User";
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(name);

    if (!loggedIn) {
      navigate("/login");
      return;
    }

    // Load sample notifications based on user role
    const sampleNotifications: Notification[] = [
      {
        id: 1,
        type: "ticket",
        title: "New Reply on Your Ticket #1234",
        message: "Sarah Johnson replied to your ticket about database connection issues.",
        timestamp: "2 minutes ago",
        isRead: false,
        isUrgent: false,
        actionUrl: "/ticket/1234",
        actionText: "View Ticket",
        sender: "Sarah Johnson",
        ticketId: 1234,
      },
      {
        id: 2,
        type: "assignment",
        title: "New Ticket Assigned",
        message: "You have been assigned ticket #5678 - Critical server downtime issue.",
        timestamp: "15 minutes ago",
        isRead: false,
        isUrgent: true,
        actionUrl: "/ticket/5678",
        actionText: "View Assignment",
        ticketId: 5678,
      },
      {
        id: 3,
        type: "system",
        title: "System Maintenance Scheduled",
        message: "Scheduled maintenance will occur tonight at 11:00 PM EST.",
        timestamp: "1 hour ago",
        isRead: true,
        isUrgent: false,
      },
      {
        id: 4,
        type: "mention",
        title: "You Were Mentioned",
        message: "@" + userName + " can you help with this React integration issue?",
        timestamp: "2 hours ago",
        isRead: false,
        isUrgent: false,
        actionUrl: "/ticket/9101",
        actionText: "View Mention",
        sender: "Mike Chen",
      },
      {
        id: 5,
        type: "ticket",
        title: "Ticket Status Changed",
        message: "Your ticket #1122 has been marked as resolved.",
        timestamp: "3 hours ago",
        isRead: true,
        isUrgent: false,
        actionUrl: "/ticket/1122",
        actionText: "View Ticket",
        ticketId: 1122,
      },
      {
        id: 6,
        type: "reminder",
        title: "Ticket Requires Attention",
        message: "Ticket #3344 has been waiting for your response for over 24 hours.",
        timestamp: "4 hours ago",
        isRead: false,
        isUrgent: true,
        actionUrl: "/ticket/3344",
        actionText: "Respond Now",
        ticketId: 3344,
      },
      {
        id: 7,
        type: "upgrade",
        title: "Role Upgrade Request Status",
        message: "Your request to become a Support Agent has been approved!",
        timestamp: "1 day ago",
        isRead: true,
        isUrgent: false,
      },
      {
        id: 8,
        type: "system",
        title: "New Feature Available",
        message: "File attachments are now available in ticket replies.",
        timestamp: "2 days ago",
        isRead: true,
        isUrgent: false,
      },
    ];

    // Add role-specific notifications
    if (role === "Admin") {
      sampleNotifications.unshift(
        {
          id: 100,
          type: "upgrade",
          title: "New Role Upgrade Request",
          message: "John Doe has requested to become a Support Agent.",
          timestamp: "30 minutes ago",
          isRead: false,
          isUrgent: true,
          actionUrl: "/admin/dashboard",
          actionText: "Review Request",
        },
        {
          id: 101,
          type: "system",
          title: "High Priority Ticket Unassigned",
          message: "Critical ticket #7890 has been unassigned for 2 hours.",
          timestamp: "2 hours ago",
          isRead: false,
          isUrgent: true,
          actionUrl: "/admin/tickets",
          actionText: "Assign Now",
        }
      );
    }

    if (role === "Support Agent") {
      sampleNotifications.unshift(
        {
          id: 200,
          type: "assignment",
          title: "Multiple Tickets Assigned",
          message: "You have been assigned 3 new tickets by the admin.",
          timestamp: "1 hour ago",
          isRead: false,
          isUrgent: false,
          actionUrl: "/staff/dashboard",
          actionText: "View Assignments",
        }
      );
    }

    setNotifications(sampleNotifications);
    setFilteredNotifications(sampleNotifications);
  }, [navigate, userName]);

  useEffect(() => {
    let filtered = [...notifications];

    switch (filter) {
      case "unread":
        filtered = filtered.filter(n => !n.isRead);
        break;
      case "urgent":
        filtered = filtered.filter(n => n.isUrgent);
        break;
      case "tickets":
        filtered = filtered.filter(n => n.type === "ticket" || n.type === "assignment");
        break;
      case "system":
        filtered = filtered.filter(n => n.type === "system");
        break;
      default:
        break;
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter]);

  const markAsRead = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const deleteSelected = () => {
    setNotifications(prev =>
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    );
    setSelectedNotifications([]);
    setShowClearModal(false);
  };

  const toggleSelection = (notificationId: number) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return "🎫";
      case "assignment":
        return "📋";
      case "system":
        return "⚙️";
      case "mention":
        return "💬";
      case "upgrade":
        return "⬆️";
      case "reminder":
        return "⏰";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "ticket":
        return "primary";
      case "assignment":
        return "success";
      case "system":
        return "info";
      case "mention":
        return "warning";
      case "upgrade":
        return "purple";
      case "reminder":
        return "danger";
      default:
        return "secondary";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.isUrgent && !n.isRead).length;

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="text-center shadow">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Please log in to view notifications</h3>
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Login
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
              <div className="flex-grow-1">
                <h2 className="fw-bold text-dark mb-1">🔔 All Notifications</h2>
                <p className="text-muted mb-0">
                  Stay updated with your tickets and system messages
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                {unreadCount > 0 && (
                  <Badge bg="danger" className="fs-6 px-3 py-2">
                    {unreadCount} Unread
                  </Badge>
                )}
                {urgentCount > 0 && (
                  <Badge bg="warning" className="fs-6 px-3 py-2">
                    {urgentCount} Urgent
                  </Badge>
                )}
                <Link
                  to="/dashboard"
                  className="btn btn-outline-secondary"
                  style={customStyles.customButton}
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </Col>
        </Row>

        {/* Filter and Actions */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card style={customStyles.notificationCard}>
              <Card.Body className="p-3">
                <Row className="g-3 align-items-center">
                  <Col lg={4} md={6}>
                    <Form.Label className="small fw-bold">Filter Notifications</Form.Label>
                    <Form.Select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All Notifications ({notifications.length})</option>
                      <option value="unread">Unread ({unreadCount})</option>
                      <option value="urgent">Urgent ({urgentCount})</option>
                      <option value="tickets">Tickets & Assignments</option>
                      <option value="system">System Messages</option>
                    </Form.Select>
                  </Col>
                  <Col lg={8}>
                    <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                      {selectedNotifications.length > 0 ? (
                        <>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={clearSelection}
                          >
                            Clear Selection ({selectedNotifications.length})
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setShowClearModal(true)}
                          >
                            Delete Selected
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={selectAll}
                            disabled={filteredNotifications.length === 0}
                          >
                            Select All
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                          >
                            Mark All Read
                          </Button>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Notifications List */}
        <Row>
          <Col xs={12}>
            <Card style={customStyles.notificationCard}>
              <Card.Body className="p-0">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-5">
                    <h5 className="text-muted">No notifications found</h5>
                    <p className="text-muted">
                      {filter === "all" 
                        ? "You're all caught up!" 
                        : "Try changing your filter to see more notifications"}
                    </p>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {filteredNotifications.map((notification) => (
                      <ListGroup.Item
                        key={notification.id}
                        className={`border-0 ${
                          !notification.isRead ? "bg-light" : ""
                        } ${notification.isUrgent ? "border-start border-4 border-danger" : ""}`}
                        style={{
                          ...(!notification.isRead ? customStyles.unreadNotification : {}),
                          ...(notification.isUrgent ? customStyles.urgentNotification : {}),
                        }}
                      >
                        <div className="d-flex align-items-start gap-3 p-2">
                          {/* Selection Checkbox */}
                          <Form.Check
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => toggleSelection(notification.id)}
                            className="mt-1"
                          />

                          {/* Notification Icon */}
                          <div className="flex-shrink-0 fs-4 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Notification Content */}
                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex align-items-start justify-content-between mb-2">
                              <div className="flex-grow-1 min-w-0">
                                <h6 className={`mb-1 ${!notification.isRead ? "fw-bold" : ""}`}>
                                  {notification.title}
                                  {!notification.isRead && (
                                    <Badge bg="primary" className="ms-2 small">New</Badge>
                                  )}
                                  {notification.isUrgent && (
                                    <Badge bg="danger" className="ms-2 small">Urgent</Badge>
                                  )}
                                </h6>
                                <p className="text-muted mb-2 small">{notification.message}</p>
                                <div className="d-flex align-items-center gap-3">
                                  <small className="text-muted">{notification.timestamp}</small>
                                  {notification.sender && (
                                    <small className="text-muted">
                                      from <strong>{notification.sender}</strong>
                                    </small>
                                  )}
                                  <Badge 
                                    bg={getNotificationColor(notification.type)} 
                                    className="small"
                                  >
                                    {notification.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="d-flex gap-2">
                                {notification.actionUrl && (
                                  <Link
                                    to={notification.actionUrl}
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    {notification.actionText}
                                  </Link>
                                )}
                                
                                <Dropdown>
                                  <Dropdown.Toggle
                                    variant="outline-secondary"
                                    size="sm"
                                    style={{ border: "none" }}
                                  >
                                    ⋮
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    {!notification.isRead ? (
                                      <Dropdown.Item 
                                        onClick={() => markAsRead(notification.id)}
                                      >
                                        ✅ Mark as Read
                                      </Dropdown.Item>
                                    ) : (
                                      <Dropdown.Item 
                                        onClick={() => setNotifications(prev =>
                                          prev.map(n =>
                                            n.id === notification.id
                                              ? { ...n, isRead: false }
                                              : n
                                          )
                                        )}
                                      >
                                        📧 Mark as Unread
                                      </Dropdown.Item>
                                    )}
                                    <Dropdown.Divider />
                                    <Dropdown.Item 
                                      onClick={() => deleteNotification(notification.id)}
                                      className="text-danger"
                                    >
                                      🗑️ Delete
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🗑️ Delete Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete {selectedNotifications.length} selected notification(s)?
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteSelected}>
            Delete Selected
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AllNotificationsPage;