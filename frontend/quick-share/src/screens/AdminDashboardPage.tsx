import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Badge,
  Button,
  Table,
  Modal,
  Form,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import Navigation from "../components/Navigation";

const customStyles = {
  dashboardCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
    height: "100%",
  },
  statCard: {
    background: "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)",
    color: "white",
    borderRadius: "15px",
    border: "none",
    height: "100%",
  },
  chartCard: {
    background: "linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)",
    borderRadius: "15px",
    border: "none",
    minHeight: "350px",
  },
  customButton: {
    borderRadius: "25px",
    padding: "8px 20px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  urgentNotification: {
    background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
    borderRadius: "15px",
    border: "2px solid #ff4757",
  },
};

interface AdminDashboardData {
  totalUsers: number;
  totalAgents: number;
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  pendingUpgrades: number;
  categoryData: Array<{ name: string; count: number; color: string }>;
  agentPerformance: Array<{ name: string; resolved: number; assigned: number }>;
  recentActivity: Array<{
    id: number;
    action: string;
    time: string;
    type: string;
    urgent?: boolean;
  }>;
}

interface UpgradeRequest {
  id: number;
  userName: string;
  userEmail: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  requestDate: string;
}

function AdminDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>({
    totalUsers: 0,
    totalAgents: 0,
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    pendingUpgrades: 0,
    categoryData: [],
    agentPerformance: [],
    recentActivity: [],
  });
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole") || "End User";
    const name = localStorage.getItem("userName") || "User";
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(name);

    // Redirect if not admin
    if (loggedIn && role !== "Admin") {
      navigate("/dashboard");
      return;
    }

    if (loggedIn && role === "Admin") {
      // Load admin dashboard data
      const adminData: AdminDashboardData = {
        totalUsers: 245,
        totalAgents: 12,
        totalTickets: 1847,
        openTickets: 156,
        closedTickets: 1691,
        pendingUpgrades: 3,
        categoryData: [
          { name: "Technical", count: 45, color: "#8884d8" },
          { name: "Development", count: 38, color: "#82ca9d" },
          { name: "Database", count: 28, color: "#ffc658" },
          { name: "DevOps", count: 22, color: "#8dd1e1" },
          { name: "UI/UX", count: 15, color: "#d084d0" },
          { name: "Security", count: 8, color: "#ffb347" },
        ],
        agentPerformance: [
          { name: "John Smith", resolved: 45, assigned: 12 },
          { name: "Sarah Johnson", resolved: 38, assigned: 8 },
          { name: "Mike Chen", resolved: 42, assigned: 15 },
          { name: "Lisa Rodriguez", resolved: 29, assigned: 6 },
          { name: "David Kim", resolved: 33, assigned: 10 },
        ],
        recentActivity: [
          {
            id: 1,
            action: "New upgrade request from John Doe (End User → Support Agent)",
            time: "5 minutes ago",
            type: "upgrade",
            urgent: true,
          },
          {
            id: 2,
            action: "Critical ticket #1234 has been unassigned for 2 hours",
            time: "2 hours ago",
            type: "ticket",
            urgent: true,
          },
          {
            id: 3,
            action: "Agent Sarah Johnson resolved 5 tickets today",
            time: "3 hours ago",
            type: "performance",
          },
          {
            id: 4,
            action: "New user registration: alex.thompson@company.com",
            time: "4 hours ago",
            type: "user",
          },
          {
            id: 5,
            action: "System backup completed successfully",
            time: "6 hours ago",
            type: "system",
          },
        ],
      };

      const sampleUpgradeRequests: UpgradeRequest[] = [
        {
          id: 1,
          userName: "John Doe",
          userEmail: "john.doe@company.com",
          currentRole: "End User",
          requestedRole: "Support Agent",
          reason: "I have 3 years of technical support experience and would like to help resolve tickets for other users.",
          requestDate: "2025-01-30",
        },
        {
          id: 2,
          userName: "Alice Wilson",
          userEmail: "alice.wilson@company.com",
          currentRole: "End User",
          requestedRole: "Support Agent",
          reason: "I have expertise in database administration and can help with database-related queries.",
          requestDate: "2025-01-29",
        },
        {
          id: 3,
          userName: "Bob Martinez",
          userEmail: "bob.martinez@company.com",
          currentRole: "End User",
          requestedRole: "Support Agent",
          reason: "I work in DevOps and can assist with deployment and infrastructure issues.",
          requestDate: "2025-01-28",
        },
      ];

      setDashboardData(adminData);
      setUpgradeRequests(sampleUpgradeRequests);
    }
  }, [navigate]);

  const handleUpgradeRequest = (request: UpgradeRequest, action: "approve" | "reject") => {
    setUpgradeRequests(prev => prev.filter(req => req.id !== request.id));
    setDashboardData(prev => ({
      ...prev,
      pendingUpgrades: prev.pendingUpgrades - 1,
      totalAgents: action === "approve" ? prev.totalAgents + 1 : prev.totalAgents,
    }));
    setShowUpgradeModal(false);
    setSelectedRequest(null);

    // In real app, you would make API call here
    alert(`Upgrade request ${action}ed successfully!`);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upgrade":
        return "⬆️";
      case "ticket":
        return "🎫";
      case "user":
        return "👤";
      case "performance":
        return "📊";
      case "system":
        return "⚙️";
      default:
        return "📝";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "upgrade":
        return "warning";
      case "ticket":
        return "danger";
      case "user":
        return "primary";
      case "performance":
        return "success";
      case "system":
        return "info";
      default:
        return "secondary";
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="text-center shadow">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Please log in to access admin dashboard</h3>
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

  if (userRole !== "Admin") {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="text-center shadow">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Access Denied</h3>
                  <p>You need admin privileges to access this page.</p>
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    Go to Dashboard
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
                <h2 className="fw-bold text-dark mb-1">
                  🛡️ Admin Dashboard
                </h2>
                <p className="text-muted mb-0 d-none d-sm-block">
                  System overview and management tools
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <Badge bg="danger" className="fs-6 px-3 py-2">
                  Administrator
                </Badge>
                {dashboardData.pendingUpgrades > 0 && (
                  <Badge bg="warning" className="fs-6 px-3 py-2">
                    {dashboardData.pendingUpgrades} Pending Upgrades
                  </Badge>
                )}
                <Link
                  to="/admin/users"
                  className="btn btn-primary"
                  style={customStyles.customButton}
                >
                  Manage Users
                </Link>
              </div>
            </div>
          </Col>
        </Row>

        {/* Urgent Notifications */}
        {upgradeRequests.length > 0 && (
          <Row className="mb-4">
            <Col xs={12}>
              <Card style={customStyles.urgentNotification}>
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="fw-bold text-dark mb-1">
                        🚨 Pending Upgrade Requests
                      </h6>
                      <p className="mb-0 text-dark">
                        {upgradeRequests.length} user(s) requesting role upgrades - Review needed
                      </p>
                    </div>
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => setShowUpgradeModal(true)}
                      style={customStyles.customButton}
                    >
                      Review Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Statistics Cards */}
        <Row className="mb-4 g-3 g-md-4">
          <Col xs={6} lg={2}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">👥</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">{dashboardData.totalUsers}</h4>
                <p className="mb-0 opacity-75 small">Total Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={2}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">🛠️</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">{dashboardData.totalAgents}</h4>
                <p className="mb-0 opacity-75 small">Support Agents</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={2}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">🎫</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">{dashboardData.totalTickets}</h4>
                <p className="mb-0 opacity-75 small">Total Tickets</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={2}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">📝</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">{dashboardData.openTickets}</h4>
                <p className="mb-0 opacity-75 small">Open Tickets</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={2}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">✅</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">{dashboardData.closedTickets}</h4>
                <p className="mb-0 opacity-75 small">Resolved</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={2}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3 p-md-4">
                <div className="display-6 display-md-4 mb-2">⬆️</div>
                <h4 className="h3 h-md-2 fw-bold mb-1">{dashboardData.pendingUpgrades}</h4>
                <p className="mb-0 opacity-75 small">Pending Upgrades</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="mb-4 g-3 g-md-4">
          {/* Tickets by Category */}
          <Col xs={12} lg={6}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="fw-bold mb-3 mb-md-4">📂 Tickets by Category</h6>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dashboardData.categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {dashboardData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* Agent Performance */}
          <Col xs={12} lg={6}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="fw-bold mb-3 mb-md-4">🏆 Agent Performance</h6>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dashboardData.agentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} tick={{ fontSize: 10 }} />
                    <YAxis fontSize={12} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="resolved" fill="#28a745" name="Resolved" />
                    <Bar dataKey="assigned" fill="#ffc107" name="Assigned" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row className="g-3 g-md-4">
          <Col xs={12}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">🔔 Recent System Activity</h6>
                  <Link to="/admin/activity" className="btn btn-outline-primary btn-sm">
                    View All
                  </Link>
                </div>
                <div className="activity-list">
                  {dashboardData.recentActivity.map((activity) => (
                    <Alert
                      key={activity.id}
                      variant={activity.urgent ? "warning" : "light"}
                      className="d-flex align-items-start mb-2 border-start border-4 p-2 p-md-3"
                      style={{
                        borderLeftColor: `var(--bs-${getActivityColor(activity.type)})`,
                        backgroundColor: activity.urgent ? "#fff3cd" : undefined,
                      }}
                    >
                      <span className="me-2 me-md-3 fs-6 fs-md-5 flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </span>
                      <div className="flex-grow-1 min-w-0">
                        <div className={`fw-medium small text-break ${activity.urgent ? "text-dark" : ""}`}>
                          {activity.action}
                        </div>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                      <div className="d-flex gap-2">
                        <Badge
                          bg={getActivityColor(activity.type)}
                          className="flex-shrink-0"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {activity.type}
                        </Badge>
                        {activity.urgent && (
                          <Badge bg="danger" className="flex-shrink-0" style={{ fontSize: "0.7rem" }}>
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </Alert>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mt-4">
          <Col xs={12}>
            <Card style={customStyles.dashboardCard}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="fw-bold mb-3">⚡ Quick Actions</h6>
                <div className="d-flex flex-wrap gap-2">
                  <Link to="/admin/users" className="btn btn-outline-primary" style={customStyles.customButton}>
                    👥 Manage Users
                  </Link>
                  <Link to="/admin/tickets" className="btn btn-outline-success" style={customStyles.customButton}>
                    🎫 All Tickets
                  </Link>
                  <Link to="/admin/categories" className="btn btn-outline-warning" style={customStyles.customButton}>
                    📂 Categories
                  </Link>
                  <Link to="/admin/agents" className="btn btn-outline-info" style={customStyles.customButton}>
                    🛠️ Agent Management
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Upgrade Requests Modal */}
      <Modal show={showUpgradeModal} onHide={() => setShowUpgradeModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🔐 Role Upgrade Requests</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {upgradeRequests.length === 0 ? (
            <div className="text-center py-4">
              <h5 className="text-muted">No pending upgrade requests</h5>
            </div>
          ) : (
            <div>
              {upgradeRequests.map((request) => (
                <Card key={request.id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold">{request.userName}</h6>
                        <small className="text-muted">{request.userEmail}</small>
                      </div>
                      <Badge bg="warning">{request.requestDate}</Badge>
                    </div>
                    <div className="mb-3">
                      <strong>Role Change:</strong> {request.currentRole} → {request.requestedRole}
                    </div>
                    <div className="mb-3">
                      <strong>Reason:</strong>
                      <p className="text-muted mt-1">{request.reason}</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUpgradeRequest(request, "approve")}
                      >
                        ✅ Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleUpgradeRequest(request, "reject")}
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AdminDashboardPage;