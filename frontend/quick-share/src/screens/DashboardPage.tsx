import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Alert,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { apiService, Ticket } from "../services/api";

const customStyles = {
  dashboardCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
  },
  statCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    textAlign: "center" as const,
  },
  customButton: {
    borderRadius: "25px",
    padding: "12px 30px",
    fontWeight: "600",
  },
  recentTicketCard: {
    borderRadius: "15px",
    border: "1px solid #e9ecef",
    marginBottom: "15px",
    transition: "all 0.3s ease",
  },
  urgentTicket: {
    borderLeft: "4px solid #dc3545",
    backgroundColor: "#fff5f5",
  },
};

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  urgentTickets: number;
  myTickets: number;
  assignedToMe?: number;
}

function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    urgentTickets: 0,
    myTickets: 0,
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger" | "info">("info");
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

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load dashboard data based on user role
      let dashboardResponse;
      if (userRole === "Admin") {
        dashboardResponse = await apiService.getAdminDashboard();
      } else if (userRole === "Support Agent") {
        dashboardResponse = await apiService.getStaffDashboard();
        // redirect to "/staff/dashboard" if needed
        if (window.location.pathname !== "/staff/dashboard") {
          navigate("/staff/dashboard");
        }
      } else {
        dashboardResponse = await apiService.getUserDashboard();
      }

      if (dashboardResponse.success && dashboardResponse.data) {
        // Extract stats from API response
        const data = dashboardResponse.data;
        setStats({
          totalTickets: data.totalTickets || 0,
          openTickets: data.openTickets || 0,
          inProgressTickets: data.inProgressTickets || 0,
          resolvedTickets: data.resolvedTickets || 0,
          closedTickets: data.closedTickets || 0,
          urgentTickets: data.urgentTickets || 0,
          myTickets: data.myTickets || 0,
          assignedToMe: data.assignedToMe,
        });

        // Set recent tickets if available
        if (data.recentTickets) {
          setRecentTickets(data.recentTickets);
        }
      } else {
        // Fallback: Load tickets and calculate stats manually
        const ticketsResponse = await apiService.getTickets({ limit: 50 });
        
        if (ticketsResponse.success && ticketsResponse.tickets) {
          const tickets = ticketsResponse.tickets;
          const userId = localStorage.getItem("userId");
          
          const calculatedStats: DashboardStats = {
            totalTickets: tickets.length,
            openTickets: tickets.filter(t => t.status === "open").length,
            inProgressTickets: tickets.filter(t => t.status === "in_progress").length,
            resolvedTickets: tickets.filter(t => t.status === "resolved").length,
            closedTickets: tickets.filter(t => t.status === "closed").length,
            urgentTickets: tickets.filter(t => t.is_urgent).length,
            myTickets: tickets.filter(t => t.author.id === userId).length,
            assignedToMe: userRole === "Support Agent" || userRole === "Admin" 
              ? tickets.filter(t => t.assigned_to?.id === userId).length 
              : undefined,
          };

          setStats(calculatedStats);
          
          // Get recent tickets (last 10)
          const sortedTickets = tickets
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 10);
          setRecentTickets(sortedTickets);
        }
      }

    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      setAlertMessage("Failed to load dashboard data. Some information may be unavailable.");
      setAlertType("info");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      
      // Set minimal fallback data
      setStats({
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0,
        urgentTickets: 0,
        myTickets: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "primary";
      case "in_progress": return "warning";
      case "resolved": return "success";
      case "closed": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress": return "In Progress";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + " " +
           new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getCompletionRate = () => {
    if (stats.totalTickets === 0) return 0;
    return Math.round(((stats.resolvedTickets + stats.closedTickets) / stats.totalTickets) * 100);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center">
                <Card.Body>
                  <h3>Please log in to view your dashboard</h3>
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

  if (isLoading) {
    return (
      <>
        <Navigation />
        <Container className="py-5">
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading dashboard...</p>
          </div>
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
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold text-dark mb-1">
                  {userRole === "Admin" ? "🛡️ Admin Dashboard" :
                   userRole === "Support Agent" ? "🛠️ Support Dashboard" :
                   "📊 My Dashboard"}
                </h2>
                <p className="text-muted mb-0">
                  Welcome back, {userName}! Here's what's happening with your tickets.
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => window.location.reload()}
                  style={customStyles.customButton}
                >
                  🔄 Refresh
                </Button>
                <Link
                  to="/create-ticket"
                  className="btn btn-primary"
                  style={customStyles.customButton}
                >
                  ➕ Create Ticket
                </Link>
              </div>
            </div>
          </Col>
        </Row>

        {/* Alert */}
        {showAlert && (
          <Alert variant={alertType} className="mb-4">
            {alertMessage}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-5 g-4">
          <Col xl={3} lg={4} md={6}>
            <Card style={customStyles.statCard} className="text-white">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="fw-bold mb-1">{stats.totalTickets}</h3>
                    <p className="mb-0">Total Tickets</p>
                  </div>
                  <div style={{ fontSize: "2.5rem", opacity: 0.7 }}>🎫</div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={4} md={6}>
            <Card style={{...customStyles.statCard, background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)"}}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="fw-bold mb-1">{stats.openTickets}</h3>
                    <p className="mb-0">Open Tickets</p>
                  </div>
                  <div style={{ fontSize: "2.5rem", opacity: 0.7 }}>🟢</div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={4} md={6}>
            <Card style={{...customStyles.statCard, background: "linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)"}}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="fw-bold mb-1">{stats.inProgressTickets}</h3>
                    <p className="mb-0">In Progress</p>
                  </div>
                  <div style={{ fontSize: "2.5rem", opacity: 0.7 }}>🔄</div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={4} md={6}>
            <Card style={{...customStyles.statCard, background: "linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)"}}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="fw-bold mb-1">{stats.urgentTickets}</h3>
                    <p className="mb-0">Urgent</p>
                  </div>
                  <div style={{ fontSize: "2.5rem", opacity: 0.7 }}>🚨</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Secondary Stats */}
        <Row className="mb-5 g-4">
          <Col md={4}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">📈 Completion Rate</h6>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span>Resolved & Closed</span>
                  <span className="fw-bold">{getCompletionRate()}%</span>
                </div>
                <ProgressBar
                  variant={getCompletionRate() > 70 ? "success" : getCompletionRate() > 40 ? "warning" : "danger"}
                  now={getCompletionRate()}
                  style={{ height: "8px", borderRadius: "10px" }}
                />
                <small className="text-muted mt-2 d-block">
                  {stats.resolvedTickets + stats.closedTickets} of {stats.totalTickets} tickets completed
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-4 text-center">
                <h6 className="fw-bold mb-3">👤 My Tickets</h6>
                <h3 className="text-primary fw-bold mb-2">{stats.myTickets}</h3>
                <p className="text-muted mb-0">Tickets created by you</p>
                <Link to="/forum?author=me" className="btn btn-outline-primary btn-sm mt-2">
                  View All
                </Link>
              </Card.Body>
            </Card>
          </Col>

          {(userRole === "Support Agent" || userRole === "Admin") && (
            <Col md={4}>
              <Card style={customStyles.dashboardCard}>
                <Card.Body className="p-4 text-center">
                  <h6 className="fw-bold mb-3">📋 Assigned to Me</h6>
                  <h3 className="text-warning fw-bold mb-2">{stats.assignedToMe || 0}</h3>
                  <p className="text-muted mb-0">Tickets assigned to you</p>
                  <Link to="/staff/dashboard" className="btn btn-outline-warning btn-sm mt-2">
                    Manage
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        <Row>
          {/* Recent Tickets */}
          <Col lg={8}>
            <Card style={customStyles.dashboardCard}>
              <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">🕒 Recent Tickets</h5>
                  <Link to="/forum" className="btn btn-outline-primary btn-sm">
                    View All Tickets
                  </Link>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {recentTickets.length > 0 ? (
                  <div>
                    {recentTickets.slice(0, 8).map((ticket) => (
                      <div
                        key={ticket.id}
                        style={{
                          ...customStyles.recentTicketCard,
                          ...(ticket.is_urgent ? customStyles.urgentTicket : {}),
                        }}
                        className="p-3"
                      >
                        <Row className="align-items-center">
                          <Col md={6}>
                            <div className="d-flex align-items-center">
                              {ticket.is_urgent && (
                                <Badge bg="danger" className="me-2 small">
                                  🚨 URGENT
                                </Badge>
                              )}
                              <div>
                                <div className="fw-bold">
                                  <Link
                                    to={`/ticket/${ticket.id}`}
                                    className="text-decoration-none text-dark"
                                  >
                                    #{ticket.id} {ticket.title}
                                  </Link>
                                </div>
                                <small className="text-muted">
                                  by {ticket.author.name}
                                </small>
                              </div>
                            </div>
                          </Col>
                          <Col md={2}>
                            <Badge bg={getPriorityColor(ticket.priority)} className="small">
                              {ticket.priority.toUpperCase()}
                            </Badge>
                          </Col>
                          <Col md={2}>
                            <Badge bg={getStatusColor(ticket.status)}>
                              {getStatusText(ticket.status)}
                            </Badge>
                          </Col>
                          <Col md={2} className="text-end">
                            <small className="text-muted">
                              {formatDate(ticket.updated_at)}
                            </small>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <h6 className="text-muted">No recent tickets</h6>
                    <p className="text-muted">Create your first ticket to get started!</p>
                    <Link to="/create-ticket" className="btn btn-primary">
                      Create Ticket
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions & Links */}
          <Col lg={4}>
            <Card style={customStyles.dashboardCard} className="mb-4">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0 fw-bold">⚡ Quick Actions</h6>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="d-grid gap-2">
                  <Link to="/create-ticket" className="btn btn-primary">
                    ➕ Create New Ticket
                  </Link>
                  <Link to="/forum" className="btn btn-outline-primary">
                    🔍 Browse All Tickets
                  </Link>
                  {(userRole === "Support Agent" || userRole === "Admin") && (
                    <Link to="/staff/dashboard" className="btn btn-outline-warning">
                      🛠️ Staff Dashboard
                    </Link>
                  )}
                  {userRole === "Admin" && (
                    <Link to="/admin/dashboard" className="btn btn-outline-danger">
                      🛡️ Admin Panel
                    </Link>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Status Distribution */}
            <Card style={customStyles.dashboardCard}>
              <Card.Header className="bg-light">
                <h6 className="mb-0 fw-bold">📊 Ticket Status</h6>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="small">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>🟢 Open</span>
                    <Badge bg="success">{stats.openTickets}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>🔄 In Progress</span>
                    <Badge bg="warning">{stats.inProgressTickets}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>✅ Resolved</span>
                    <Badge bg="success">{stats.resolvedTickets}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>🔒 Closed</span>
                    <Badge bg="secondary">{stats.closedTickets}</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default DashboardPage;