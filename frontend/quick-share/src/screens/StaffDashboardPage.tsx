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
  Modal,
  Alert,
  InputGroup,
  Dropdown,
  Tabs,
  Tab,
} from "react-bootstrap";
import Navigation from "../components/Navigation";

const customStyles = {
  tableCard: {
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
  searchCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
  },
  urgentRow: {
    backgroundColor: "#fff5f5",
    borderLeft: "4px solid #dc3545",
  },
  statCard: {
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    borderRadius: "15px",
    border: "none",
    height: "100%",
  },
};

interface StaffTicket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  author: string;
  authorEmail: string;
  assignedTo: string | null;
  assignedDate: string | null;
  createdAt: string;
  updatedAt: string;
  lastReply: string;
  replies: number;
  isUrgent: boolean;
  hasUnreadReplies: boolean;
  internalNotes: number;
}

function StaffDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [activeTab, setActiveTab] = useState("assigned");
  const [tickets, setTickets] = useState<StaffTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<StaffTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<StaffTicket | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("success");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole") || "End User";
    const storedUserName = localStorage.getItem("userName") || "User";
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(storedUserName);

    if (!loggedIn) {
      navigate("/login");
      return;
    }

    if (role !== "Support Agent") {
      navigate("/dashboard");
      return;
    }

    // Load sample tickets
    const sampleTickets: StaffTicket[] = [
      // Assigned to current user
      {
        id: 1,
        title: "Database connection timeout error",
        description: "Users are experiencing timeout errors when connecting to the database",
        category: "Database",
        priority: "high",
        status: "in_progress",
        author: "John Doe",
        authorEmail: "john.doe@company.com",
        assignedTo: storedUserName,
        assignedDate: "2025-01-30 09:00",
        createdAt: "2025-01-30 08:30",
        updatedAt: "2025-01-30 14:30",
        lastReply: "2025-01-30 14:30",
        replies: 5,
        isUrgent: true,
        hasUnreadReplies: true,
        internalNotes: 2,
      },
      {
        id: 2,
        title: "Mobile app login issues",
        description: "iOS users cannot log in to the mobile application",
        category: "Mobile",
        priority: "medium",
        status: "in_progress",
        author: "Alice Wilson",
        authorEmail: "alice.wilson@company.com",
        assignedTo: storedUserName,
        assignedDate: "2025-01-29 16:00",
        createdAt: "2025-01-29 15:30",
        updatedAt: "2025-01-30 11:20",
        lastReply: "2025-01-30 10:15",
        replies: 3,
        isUrgent: false,
        hasUnreadReplies: false,
        internalNotes: 1,
      },
      {
        id: 3,
        title: "Payment gateway integration help",
        description: "Need assistance with Stripe payment gateway setup",
        category: "Development",
        priority: "low",
        status: "resolved",
        author: "Bob Martinez",
        authorEmail: "bob.martinez@company.com",
        assignedTo: storedUserName,
        assignedDate: "2025-01-28 10:00",
        createdAt: "2025-01-28 09:00",
        updatedAt: "2025-01-29 17:30",
        lastReply: "2025-01-29 17:30",
        replies: 8,
        isUrgent: false,
        hasUnreadReplies: false,
        internalNotes: 0,
      },
      // Unassigned tickets
      {
        id: 4,
        title: "Critical server performance issues",
        description: "Production server showing extremely slow response times",
        category: "Infrastructure",
        priority: "high",
        status: "open",
        author: "Emily Taylor",
        authorEmail: "emily.taylor@company.com",
        assignedTo: null,
        assignedDate: null,
        createdAt: "2025-01-30 15:00",
        updatedAt: "2025-01-30 15:00",
        lastReply: "2025-01-30 15:00",
        replies: 0,
        isUrgent: true,
        hasUnreadReplies: false,
        internalNotes: 0,
      },
      {
        id: 5,
        title: "API documentation update request",
        description: "REST API documentation needs updating for v2.0",
        category: "Documentation",
        priority: "medium",
        status: "open",
        author: "Lisa Rodriguez",
        authorEmail: "lisa.rodriguez@company.com",
        assignedTo: null,
        assignedDate: null,
        createdAt: "2025-01-30 12:00",
        updatedAt: "2025-01-30 12:00",
        lastReply: "2025-01-30 12:00",
        replies: 1,
        isUrgent: false,
        hasUnreadReplies: false,
        internalNotes: 0,
      },
      {
        id: 6,
        title: "Email notification not working",
        description: "Users not receiving email notifications for ticket updates",
        category: "Email",
        priority: "medium",
        status: "open",
        author: "David Kim",
        authorEmail: "david.kim@company.com",
        assignedTo: null,
        assignedDate: null,
        createdAt: "2025-01-30 10:30",
        updatedAt: "2025-01-30 10:30",
        lastReply: "2025-01-30 10:30",
        replies: 0,
        isUrgent: false,
        hasUnreadReplies: false,
        internalNotes: 0,
      },
    ];

    setTickets(sampleTickets);
    setFilteredTickets(sampleTickets);
  }, [navigate, userName]);

  useEffect(() => {
    let filtered = [...tickets];

    // Filter by tab
    if (activeTab === "assigned") {
      filtered = filtered.filter(ticket => ticket.assignedTo === userName);
    } else if (activeTab === "unassigned") {
      filtered = filtered.filter(ticket => !ticket.assignedTo);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
    }

    // Sort tickets
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      case "replies":
        filtered.sort((a, b) => b.replies - a.replies);
        break;
      default:
        break;
    }

    // Urgent tickets first
    filtered.sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return 0;
    });

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, categoryFilter, statusFilter, priorityFilter, sortBy, activeTab, userName]);

  const handlePickupTicket = (ticket: StaffTicket) => {
    setSelectedTicket(ticket);
    setShowPickupModal(true);
  };

  const confirmPickupTicket = () => {
    if (!selectedTicket) return;

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              assignedTo: userName,
              assignedDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
              status: "in_progress" as const,
              updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : ticket
      )
    );

    setShowPickupModal(false);
    setSelectedTicket(null);
    setAlertMessage("Ticket picked up successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleStatusChange = (ticketId: number, newStatus: StaffTicket["status"]) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: newStatus,
              updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : ticket
      )
    );

    setAlertMessage("Ticket status updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "primary";
      case "in_progress":
        return "warning";
      case "resolved":
        return "success";
      case "closed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const assignedTickets = tickets.filter(t => t.assignedTo === userName);
  const unassignedTickets = tickets.filter(t => !t.assignedTo);
  const urgentTickets = assignedTickets.filter(t => t.isUrgent);
  const inProgressTickets = assignedTickets.filter(t => t.status === "in_progress");

  if (!isLoggedIn || userRole !== "Support Agent") {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="text-center shadow">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Access Denied</h3>
                  <p>You need Support Agent privileges to access this page.</p>
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
                <h2 className="fw-bold text-dark mb-1">🛠️ Staff Dashboard</h2>
                <p className="text-muted mb-0">
                  Manage and resolve support tickets
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="success" className="fs-6 px-3 py-2">
                  Support Agent
                </Badge>
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

        {/* Statistics Cards */}
        <Row className="mb-4 g-3">
          <Col md={3} sm={6}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{assignedTickets.length}</h3>
                <small>My Tickets</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{inProgressTickets.length}</h3>
                <small>In Progress</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{urgentTickets.length}</h3>
                <small>Urgent</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card style={customStyles.statCard}>
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{unassignedTickets.length}</h3>
                <small>Available</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card style={customStyles.searchCard}>
              <Card.Body className="p-3">
                <Row className="g-3 align-items-end">
                  <Col lg={3} md={6}>
                    <Form.Label className="small fw-bold">Search Tickets</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search by title, description, or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <InputGroup.Text>🔍</InputGroup.Text>
                    </InputGroup>
                  </Col>
                  <Col lg={2} md={3}>
                    <Form.Label className="small fw-bold">Category</Form.Label>
                    <Form.Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      <option value="Technical">Technical</option>
                      <option value="Development">Development</option>
                      <option value="Database">Database</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Email">Email</option>
                      <option value="Documentation">Documentation</option>
                    </Form.Select>
                  </Col>
                  <Col lg={2} md={3}>
                    <Form.Label className="small fw-bold">Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </Form.Select>
                  </Col>
                  <Col lg={2} md={3}>
                    <Form.Label className="small fw-bold">Priority</Form.Label>
                    <Form.Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="All">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Form.Select>
                  </Col>
                  <Col lg={3}>
                    <Form.Label className="small fw-bold">Sort By</Form.Label>
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="priority">Priority</option>
                      <option value="replies">Most Replies</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card style={customStyles.tableCard}>
              <Card.Header className="bg-white">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k || "assigned")}
                  className="border-0"
                >
                  <Tab
                    eventKey="assigned"
                    title={
                      <span>
                        📋 My Assigned Tickets ({assignedTickets.length})
                        {assignedTickets.some(t => t.hasUnreadReplies) && (
                          <Badge bg="danger" className="ms-2">●</Badge>
                        )}
                      </span>
                    }
                  />
                  <Tab
                    eventKey="unassigned"
                    title={
                      <span>
                        🆕 Available Tickets ({unassignedTickets.length})
                        {unassignedTickets.some(t => t.isUrgent) && (
                          <Badge bg="warning" className="ms-2">⚠️</Badge>
                        )}
                      </span>
                    }
                  />
                </Tabs>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 px-4 py-3">Ticket</th>
                        <th className="border-0 py-3">Priority</th>
                        <th className="border-0 py-3">Status</th>
                        <th className="border-0 py-3">Author</th>
                        <th className="border-0 py-3">
                          {activeTab === "assigned" ? "Assigned Date" : "Created"}
                        </th>
                        <th className="border-0 py-3">Last Activity</th>
                        <th className="border-0 py-3">Replies</th>
                        <th className="border-0 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr 
                          key={ticket.id} 
                          style={ticket.isUrgent ? customStyles.urgentRow : {}}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-bold d-flex align-items-center">
                                {ticket.isUrgent && (
                                  <Badge bg="danger" className="me-2 small">🚨 URGENT</Badge>
                                )}
                                {ticket.hasUnreadReplies && (
                                  <Badge bg="primary" className="me-2 small">● NEW</Badge>
                                )}
                                <Link 
                                  to={`/ticket/${ticket.id}`} 
                                  className="text-decoration-none text-dark"
                                >
                                  #{ticket.id} {ticket.title}
                                </Link>
                              </div>
                              <small className="text-muted text-truncate d-block" style={{maxWidth: '300px'}}>
                                {ticket.description}
                              </small>
                              <div className="d-flex gap-2 mt-1">
                                <Badge bg="secondary" className="small">
                                  {ticket.category}
                                </Badge>
                                {ticket.internalNotes > 0 && (
                                  <Badge bg="info" className="small">
                                    📝 {ticket.internalNotes} notes
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge bg={getPriorityColor(ticket.priority)}>
                              {ticket.priority.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge bg={getStatusColor(ticket.status)}>
                              {getStatusText(ticket.status)}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="fw-bold small">{ticket.author}</div>
                              <small className="text-muted">{ticket.authorEmail}</small>
                            </div>
                          </td>
                          <td className="py-3">
                            <small>
                              {activeTab === "assigned" && ticket.assignedDate 
                                ? ticket.assignedDate 
                                : ticket.createdAt}
                            </small>
                          </td>
                          <td className="py-3">
                            <small>{ticket.lastReply}</small>
                          </td>
                          <td className="py-3">
                            <Badge bg="primary" className="rounded-pill">
                              {ticket.replies}
                            </Badge>
                          </td>
                          <td className="py-3 text-center">
                            {activeTab === "unassigned" ? (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handlePickupTicket(ticket)}
                                style={customStyles.customButton}
                              >
                                Pick Up
                              </Button>
                            ) : (
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant="outline-secondary"
                                  size="sm"
                                  style={{ border: "none" }}
                                >
                                  ⋮
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item as={Link} to={`/ticket/${ticket.id}`}>
                                    👁️ View Ticket
                                  </Dropdown.Item>
                                  <Dropdown.Item as={Link} to={`/ticket/${ticket.id}/reply`}>
                                    💬 Reply
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item 
                                    onClick={() => handleStatusChange(ticket.id, "in_progress")}
                                    disabled={ticket.status === "in_progress"}
                                  >
                                    🔄 Mark In Progress
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => handleStatusChange(ticket.id, "resolved")}
                                    disabled={ticket.status === "resolved"}
                                  >
                                    ✅ Mark Resolved
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => handleStatusChange(ticket.id, "closed")}
                                    disabled={ticket.status === "closed"}
                                  >
                                    🔒 Close Ticket
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {filteredTickets.length === 0 && (
                  <div className="text-center py-5">
                    <h5 className="text-muted">No tickets found</h5>
                    <p className="text-muted">
                      {activeTab === "assigned" 
                        ? "You don't have any assigned tickets matching the current filters"
                        : "No unassigned tickets available at the moment"}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Pickup Ticket Modal */}
      <Modal show={showPickupModal} onHide={() => setShowPickupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📋 Pick Up Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div>
              <div className="mb-3">
                <strong>Ticket:</strong> #{selectedTicket.id} {selectedTicket.title}
              </div>
              <div className="mb-3">
                <strong>Priority:</strong> 
                <Badge bg={getPriorityColor(selectedTicket.priority)} className="ms-2">
                  {selectedTicket.priority.toUpperCase()}
                </Badge>
                {selectedTicket.isUrgent && (
                  <Badge bg="danger" className="ms-2">URGENT</Badge>
                )}
              </div>
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="text-muted mt-1">{selectedTicket.description}</p>
              </div>
              <Alert variant="info">
                By picking up this ticket, you will be assigned as the responsible agent and the status will change to "In Progress".
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPickupModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={confirmPickupTicket}>
            Pick Up Ticket
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default StaffDashboardPage;