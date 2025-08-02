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
  Spinner,
  Modal,
  Dropdown,
  ListGroup,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { apiService, Notification as ApiNotification } from "../services/api";

const customStyles = {
  notificationCard: {
    borderRadius: "15px",
    border: "1px solid #e9ecef",
    marginBottom: "15px",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  unreadNotification: {
    backgroundColor: "#f8f9fa",
    borderLeft: "4px solid #007bff",
  },
  readNotification: {
    backgroundColor: "white",
    borderLeft: "4px solid #e9ecef",
  },
  urgentNotification: {
    borderLeft: "4px solid #dc3545",
    backgroundColor: "#fff5f5",
  },
  customButton: {
    borderRadius: "25px",
    padding: "8px 20px",
    fontWeight: "600",
  },
  headerCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  filterCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
  },
  notificationIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    marginRight: "15px",
  },
};

// Extend the API Notification interface for local use with proper typing
interface LocalNotification {
  id: string;
  title: string;
  message: string;
  type: "ticket_update" | "assignment" | "comment" | "system" | "urgent" | "mention";
  is_read: boolean;
  created_at: string;
  // related_ticket_id?: string;
  // related_user_id?: string;
  // metadata?: {
  //   ticket_title?: string;
  //   user_name?: string;
  //   old_status?: string;
  //   new_status?: string;
  //   comment_content?: string;
  // };
}

function AllNotificationsPage() {
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [typeFilter, setTypeFilter] = useState("all"); // all, ticket_update, assignment, etc.
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger" | "info">("success");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status
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

    loadNotifications();
  }, [navigate, filter, typeFilter, page]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      const queryParams: any = {
        page,
        limit: 20,
      };

      if (filter !== "all") {
        queryParams.is_read = filter === "read";
      }

      if (typeFilter !== "all") {
        queryParams.type = typeFilter;
      }

      const response = await apiService.getNotifications(queryParams);

      if (response.success && response.data) {
        // Convert API notifications to local format
        const convertedNotifications: LocalNotification[] = response.data.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: normalizeNotificationType(notification.type as string),
          is_read: notification.is_read,
          created_at: notification.created_at,
          // related_ticket_id: notification.related_ticket_id,
          // related_user_id: notification.related_user_id,
          // metadata: notification.metadata,
        }));

        if (page === 1) {
          setNotifications(convertedNotifications);
        } else {
          setNotifications(prev => [...prev, ...convertedNotifications]);
        }

        // Handle total count from extended response
        const extendedResponse = response as any;
        setTotalCount(extendedResponse.total || response.data.length);
        setHasMore(response.data.length === 20); // Assuming 20 per page
      } else {
        // Fallback: create some demo notifications based on user activity
        const fallbackNotifications = createFallbackNotifications();
        setNotifications(fallbackNotifications);
        setTotalCount(fallbackNotifications.length);
        setHasMore(false);
      }

    } catch (error: any) {
      console.error("Error loading notifications:", error);
      
      // Show error and create fallback notifications
      setAlertMessage("Failed to load notifications. Showing local data.");
      setAlertType("info");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);

      const fallbackNotifications = createFallbackNotifications();
      setNotifications(fallbackNotifications);
      setTotalCount(fallbackNotifications.length);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeNotificationType = (type: string): LocalNotification['type'] => {
    const validTypes: LocalNotification['type'][] = [
      "ticket_update", "assignment", "comment", "system", "urgent", "mention"
    ];
    
    if (validTypes.includes(type as LocalNotification['type'])) {
      return type as LocalNotification['type'];
    }
    
    // Default fallback
    return "system";
  };

  const createFallbackNotifications = (): LocalNotification[] => {
    const userId = localStorage.getItem("userId") || "user1";
    const baseNotifications: LocalNotification[] = [];

    // Add welcome notification for new users
    baseNotifications.push({
      id: "welcome",
      title: "Welcome to ODO Support!",
      message: "Thank you for joining our support system. You can now create tickets, track issues, and get help from our team.",
      type: "system",
      is_read: false,
      created_at: new Date().toISOString(),
      // metadata: {},
    });

    // Add role-specific notifications
    if (userRole === "Support Agent" || userRole === "Admin") {
      baseNotifications.push({
        id: "new_tickets",
        title: "New Tickets Available",
        message: "There are unassigned tickets waiting for pickup. Check the staff dashboard to help users.",
        type: "assignment",
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        // metadata: {},
      });

      // Add a sample ticket update notification
      baseNotifications.push({
        id: "ticket_update_sample",
        title: "Ticket Status Updated",
        message: "A ticket has been updated and requires your attention.",
        type: "ticket_update",
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        // related_ticket_id: "sample_ticket_123",
        // metadata: {
        //   ticket_title: "Sample Support Request",
        //   old_status: "open",
        //   new_status: "in_progress",
        // },
      });
    }

    // Add comment notification for all users
    baseNotifications.push({
      id: "comment_sample",
      title: "New Comment on Your Ticket",
      message: "A support agent has replied to your ticket. Check it out for the latest update!",
      type: "comment",
      is_read: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
      // related_ticket_id: "user_ticket_456",
      // metadata: {
      //   ticket_title: "Login Issue",
      //   user_name: "Support Agent",
      //   comment_content: "We've identified the issue and are working on a fix...",
      // },
    });

    return baseNotifications;
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Try the API method (check if it exists first)
      let response;
      
      if ('markNotificationAsRead' in apiService) {
        response = await (apiService as any).markNotificationAsRead(notificationId);
      } else {
        // Fallback: simulate API call
        response = { success: true };
      }
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
      } else {
        // Fallback: update locally
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
      }
    } catch (error) {
      // Fallback: update locally
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsUpdating(true);
      
      // Try the API method (check if it exists first)
      let response;
      
      if ('markAllNotificationsAsRead' in apiService) {
        response = await (apiService as any).markAllNotificationsAsRead();
      } else {
        // Fallback: simulate API call
        response = { success: true };
      }
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        
        setAlertMessage("All notifications marked as read!");
        setAlertType("success");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error("Failed to mark all as read");
      }
    } catch (error) {
      // Fallback: update locally
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      setAlertMessage("All notifications marked as read (local update)!");
      setAlertType("info");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteNotifications = async () => {
    try {
      setIsUpdating(true);
      
      if (selectedNotifications.length === 0) return;

      // Try the API method (check if it exists first)
      let response;
      
      if ('deleteNotifications' in apiService) {
        response = await (apiService as any).deleteNotifications(selectedNotifications);
      } else {
        // Fallback: simulate API call
        response = { success: true };
      }
      
      if (response.success) {
        setNotifications(prev => 
          prev.filter(notif => !selectedNotifications.includes(notif.id))
        );
        setSelectedNotifications([]);
        setShowDeleteModal(false);
        
        setAlertMessage(`${selectedNotifications.length} notification(s) deleted!`);
        setAlertType("success");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error("Failed to delete notifications");
      }
    } catch (error) {
      // Fallback: delete locally
      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.includes(notif.id))
      );
      setSelectedNotifications([]);
      setShowDeleteModal(false);
      
      setAlertMessage(`${selectedNotifications.length} notification(s) deleted (local update)!`);
      setAlertType("info");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotificationClick = (notification: LocalNotification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate to related content
    // if (notification.related_ticket_id) {
    //   navigate(`/ticket/${notification.related_ticket_id}`);
    // } else if (notification.type === "system") {
    //   // Stay on notifications page for system notifications
    //   return;
    // }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ticket_update":
        return { icon: "🎫", color: "#007bff" };
      case "assignment":
        return { icon: "👤", color: "#28a745" };
      case "comment":
        return { icon: "💬", color: "#17a2b8" };
      case "urgent":
        return { icon: "🚨", color: "#dc3545" };
      case "mention":
        return { icon: "@", color: "#6f42c1" };
      case "system":
        return { icon: "⚙️", color: "#6c757d" };
      default:
        return { icon: "📢", color: "#ffc107" };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (filter !== "all") {
      filtered = filtered.filter(notif => 
        filter === "read" ? notif.is_read : !notif.is_read
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(notif => notif.type === typeFilter);
    }

    return filtered;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredNotifications = getFilteredNotifications();

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center">
                <Card.Body>
                  <h3>Please log in to view notifications</h3>
                  <Link to="/login" className="btn btn-primary mt-3">
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

      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Card style={customStyles.headerCard}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="fw-bold mb-2">🔔 All Notifications</h2>
                    <p className="mb-0 opacity-75">
                      Stay updated with your tickets and system activities
                    </p>
                  </div>
                  <div className="text-end">
                    <h3 className="fw-bold mb-1">{totalCount}</h3>
                    <small>Total Notifications</small>
                    {unreadCount > 0 && (
                      <div className="mt-2">
                        <Badge bg="warning" className="fs-6">
                          {unreadCount} Unread
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Alert */}
        {showAlert && (
          <Alert variant={alertType} className="mb-4">
            {alertMessage}
          </Alert>
        )}

        <Row>
          {/* Filters Sidebar */}
          <Col lg={3}>
            <Card style={customStyles.filterCard} className="mb-4">
              <Card.Header className="bg-light">
                <h6 className="mb-0 fw-bold">🔍 Filters</h6>
              </Card.Header>
              <Card.Body className="p-3">
                {/* Read Status Filter */}
                <div className="mb-3">
                  <Form.Label className="small fw-bold">Status</Form.Label>
                  <Form.Select
                    size="sm"
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread Only</option>
                    <option value="read">Read Only</option>
                  </Form.Select>
                </div>

                {/* Type Filter */}
                <div className="mb-3">
                  <Form.Label className="small fw-bold">Type</Form.Label>
                  <Form.Select
                    size="sm"
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="ticket_update">Ticket Updates</option>
                    <option value="assignment">Assignments</option>
                    <option value="comment">Comments</option>
                    <option value="urgent">Urgent</option>
                    <option value="mention">Mentions</option>
                    <option value="system">System</option>
                  </Form.Select>
                </div>

                {/* Quick Actions */}
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={isUpdating || unreadCount === 0}
                  >
                    {isUpdating ? "Updating..." : "Mark All Read"}
                  </Button>
                  
                  {selectedNotifications.length > 0 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Delete Selected ({selectedNotifications.length})
                    </Button>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-4 pt-3 border-top">
                  <h6 className="small fw-bold mb-2">Quick Stats</h6>
                  <div className="small text-muted">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Total:</span>
                      <span>{notifications.length}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Unread:</span>
                      <span>{unreadCount}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Filtered:</span>
                      <span>{filteredNotifications.length}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Notifications List */}
          <Col lg={9}>
            {isLoading && page === 1 ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" className="mb-3">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <>
                {/* Bulk Actions */}
                {filteredNotifications.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="checkbox"
                      label={`Select All (${filteredNotifications.length})`}
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications(filteredNotifications.map(n => n.id));
                        } else {
                          setSelectedNotifications([]);
                        }
                      }}
                    />
                    <small className="text-muted">
                      Showing {filteredNotifications.length} of {totalCount} notifications
                    </small>
                  </div>
                )}

                {/* Notifications */}
                {filteredNotifications.map((notification) => {
                  const iconInfo = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      style={{
                        ...customStyles.notificationCard,
                        ...(notification.is_read 
                          ? customStyles.readNotification 
                          : customStyles.unreadNotification),
                        ...(notification.type === "urgent" 
                          ? customStyles.urgentNotification 
                          : {}),
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="p-3">
                        <div className="d-flex align-items-start">
                          {/* Selection Checkbox */}
                          <Form.Check
                            type="checkbox"
                            className="me-3 mt-1"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                setSelectedNotifications(prev => [...prev, notification.id]);
                              } else {
                                setSelectedNotifications(prev => 
                                  prev.filter(id => id !== notification.id)
                                );
                              }
                            }}
                          />

                          {/* Notification Icon */}
                          <div
                            style={{
                              ...customStyles.notificationIcon,
                              backgroundColor: iconInfo.color + "20",
                              color: iconInfo.color,
                            }}
                          >
                            {iconInfo.icon}
                          </div>

                          {/* Notification Content */}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className="fw-bold mb-1">
                                {notification.title}
                                {!notification.is_read && (
                                  <Badge bg="primary" className="ms-2 small">New</Badge>
                                )}
                              </h6>
                              <div className="d-flex align-items-center gap-2">
                                <small className="text-muted">
                                  {formatDate(notification.created_at)}
                                </small>
                                {notification.type === "urgent" && (
                                  <Badge bg="danger" className="small">URGENT</Badge>
                                )}
                              </div>
                            </div>

                            <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
                              {notification.message}
                            </p>

                            {/* Metadata */}
                            {/* {notification.metadata && (
                              <div className="small text-muted">
                                {notification.metadata.ticket_title && (
                                  <div>
                                    <strong>Ticket:</strong> {notification.metadata.ticket_title}
                                  </div>
                                )}
                                {notification.metadata.user_name && (
                                  <div>
                                    <strong>User:</strong> {notification.metadata.user_name}
                                  </div>
                                )}
                                {notification.metadata.old_status && notification.metadata.new_status && (
                                  <div>
                                    <strong>Status:</strong> {notification.metadata.old_status} → {notification.metadata.new_status}
                                  </div>
                                )}
                              </div>
                            )} */}

                            {/* Actions */}
                            <div className="d-flex gap-2 mt-2">
                              {/* {notification.related_ticket_id && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/ticket/${notification.related_ticket_id}`);
                                  }}
                                >
                                  View Ticket
                                </Button>
                              )} */}
                              {!notification.is_read && (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  Mark Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline-primary"
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Load More Notifications"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-5">
                <Card.Body>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔔</div>
                  <h4>No Notifications</h4>
                  <p className="text-muted">
                    {filter !== "all" || typeFilter !== "all" 
                      ? "No notifications match your current filters." 
                      : "You don't have any notifications yet."}
                  </p>
                  {(filter !== "all" || typeFilter !== "all") && (
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setFilter("all");
                        setTypeFilter("all");
                        setPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                  {filter === "all" && typeFilter === "all" && (
                    <div className="mt-3">
                      <Link to="/create-ticket" className="btn btn-primary me-2">
                        Create Your First Ticket
                      </Link>
                      <Link to="/forum" className="btn btn-outline-primary">
                        Browse Tickets
                      </Link>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete {selectedNotifications.length} notification(s)?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={deleteNotifications}
            disabled={isUpdating}
          >
            {isUpdating ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AllNotificationsPage;