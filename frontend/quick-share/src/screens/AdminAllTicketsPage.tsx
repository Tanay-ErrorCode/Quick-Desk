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
};

interface AdminTicket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "open" | "answered" | "closed" | "in_progress";
  author: string;
  authorEmail: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  replies: number;
  isUrgent: boolean;
}

interface Agent {
  id: number;
  name: string;
  email: string;
  activeTickets: number;
}

function AdminAllTicketsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<AdminTicket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(
    null,
  );
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("success");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole") || "End User";
    setIsLoggedIn(loggedIn);
    setUserRole(role);

    if (loggedIn && role !== "Admin") {
      navigate("/dashboard");
      return;
    }

    if (loggedIn && role === "Admin") {
      // Load sample tickets
      const sampleTickets: AdminTicket[] = [
        {
          id: 1,
          title: "Critical database connection error",
          description:
            "Cannot connect to production database, affecting all users",
          category: "Database",
          priority: "high",
          status: "open",
          author: "John Doe",
          authorEmail: "john.doe@company.com",
          assignedTo: null,
          createdAt: "2025-01-30 09:00",
          updatedAt: "2025-01-30 09:00",
          replies: 0,
          isUrgent: true,
        },
        {
          id: 2,
          title: "Login page not responsive on mobile",
          description: "The login form doesn't work properly on mobile devices",
          category: "UI/UX",
          priority: "medium",
          status: "in_progress",
          author: "Alice Wilson",
          authorEmail: "alice.wilson@company.com",
          assignedTo: "Sarah Johnson",
          createdAt: "2025-01-29 14:30",
          updatedAt: "2025-01-30 10:15",
          replies: 3,
          isUrgent: false,
        },
        {
          id: 3,
          title: "How to integrate payment gateway?",
          description: "Need help with Stripe integration in React application",
          category: "Development",
          priority: "low",
          status: "answered",
          author: "Bob Martinez",
          authorEmail: "bob.martinez@company.com",
          assignedTo: "Mike Chen",
          createdAt: "2025-01-28 16:45",
          updatedAt: "2025-01-29 11:20",
          replies: 5,
          isUrgent: false,
        },
        {
          id: 4,
          title: "Server deployment failing",
          description: "Docker container won't start on production server",
          category: "DevOps",
          priority: "high",
          status: "open",
          author: "Emily Taylor",
          authorEmail: "emily.taylor@company.com",
          assignedTo: "David Kim",
          createdAt: "2025-01-30 08:15",
          updatedAt: "2025-01-30 08:15",
          replies: 1,
          isUrgent: true,
        },
        {
          id: 5,
          title: "API documentation update needed",
          description: "The REST API documentation is outdated",
          category: "Technical",
          priority: "low",
          status: "closed",
          author: "Lisa Rodriguez",
          authorEmail: "lisa.rodriguez@company.com",
          assignedTo: "Sarah Johnson",
          createdAt: "2025-01-25 10:00",
          updatedAt: "2025-01-27 15:30",
          replies: 8,
          isUrgent: false,
        },
        {
          id: 6,
          title: "Is it good things to use AI for hackathon?",
          description: "I am participating in odoo IN hackathon - 2025.",
          category: "Development",
          priority: "medium",
          status: "open",
          author: "Mitchell Admin",
          authorEmail: "mitchell.admin@company.com",
          assignedTo: null,
          createdAt: "2025-01-30 16:00",
          updatedAt: "2025-01-30 16:00",
          replies: 2,
          isUrgent: false,
        },
      ];

      const sampleAgents: Agent[] = [
        {
          id: 1,
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          activeTickets: 5,
        },
        {
          id: 2,
          name: "Mike Chen",
          email: "mike.chen@company.com",
          activeTickets: 3,
        },
        {
          id: 3,
          name: "David Kim",
          email: "david.kim@company.com",
          activeTickets: 4,
        },
        {
          id: 4,
          name: "Lisa Rodriguez",
          email: "lisa.rodriguez@company.com",
          activeTickets: 2,
        },
      ];

      setTickets(sampleTickets);
      setFilteredTickets(sampleTickets);
      setAgents(sampleAgents);
    }
  }, [navigate]);

  useEffect(() => {
    let filtered = [...tickets];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.author.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter(
        (ticket) => ticket.category === categoryFilter,
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "All") {
      filtered = filtered.filter(
        (ticket) => ticket.priority === priorityFilter,
      );
    }

    // Sort by priority and urgency
    filtered.sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;

      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, categoryFilter, statusFilter, priorityFilter]);

  const handleAssignTicket = () => {
    if (!selectedTicket || !selectedAgent) return;

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              assignedTo: selectedAgent,
              status: "in_progress" as const,
              updatedAt: new Date()
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
            }
          : ticket,
      ),
    );

    setShowAssignModal(false);
    setSelectedTicket(null);
    setSelectedAgent("");
    setAlertMessage("Ticket assigned successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleStatusChange = (
    ticketId: number,
    newStatus: AdminTicket["status"],
  ) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: newStatus,
              updatedAt: new Date()
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
            }
          : ticket,
      ),
    );

    setAlertMessage("Ticket status updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleDeleteTicket = (ticketId: number) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
      setAlertMessage("Ticket deleted successfully!");
      setAlertType("success");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
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
      case "answered":
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

  if (!isLoggedIn || userRole !== "Admin") {
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
                  🎫 All Tickets Management
                </h2>
                <p className="text-muted mb-0">
                  View, assign, and manage all support tickets
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Link
                  to="/admin/dashboard"
                  className="btn btn-outline-secondary"
                  style={customStyles.customButton}
                >
                  ← Back to Admin
                </Link>
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

        {/* Filters */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card style={customStyles.searchCard}>
              <Card.Body className="p-3">
                <Row className="g-3 align-items-end">
                  <Col lg={3} md={6}>
                    <Form.Label className="small fw-bold">
                      Search Tickets
                    </Form.Label>
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
                      <option value="DevOps">DevOps</option>
                      <option value="UI/UX">UI/UX</option>
                      <option value="Security">Security</option>
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
                      <option value="answered">Answered</option>
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
                  <Col lg={3} className="text-lg-end">
                    <div className="d-flex gap-2 justify-content-lg-end align-items-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setCategoryFilter("All");
                          setStatusFilter("All");
                          setPriorityFilter("All");
                        }}
                      >
                        Clear Filters
                      </Button>
                      <Badge bg="info" className="px-3 py-2">
                        {filteredTickets.length} tickets
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-4 g-3">
          <Col md={3} sm={6}>
            <Card className="bg-primary text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">
                  {tickets.filter((t) => t.status === "open").length}
                </h3>
                <small>Open Tickets</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="bg-warning text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">
                  {tickets.filter((t) => t.status === "in_progress").length}
                </h3>
                <small>In Progress</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="bg-danger text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">
                  {tickets.filter((t) => t.isUrgent).length}
                </h3>
                <small>Urgent Tickets</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="bg-success text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">
                  {
                    tickets.filter(
                      (t) => t.status === "answered" || t.status === "closed",
                    ).length
                  }
                </h3>
                <small>Resolved</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tickets Table */}
        <Row>
          <Col xs={12}>
            <Card style={customStyles.tableCard}>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 px-4 py-3">Ticket</th>
                        <th className="border-0 py-3">Priority</th>
                        <th className="border-0 py-3">Status</th>
                        <th className="border-0 py-3">Author</th>
                        <th className="border-0 py-3">Assigned To</th>
                        <th className="border-0 py-3">Created</th>
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
                                  <Badge bg="danger" className="me-2 small">
                                    🚨 URGENT
                                  </Badge>
                                )}
                                <Link
                                  to={`/ticket/${ticket.id}`}
                                  className="text-decoration-none text-dark"
                                >
                                  #{ticket.id} {ticket.title}
                                </Link>
                              </div>
                              <small
                                className="text-muted text-truncate d-block"
                                style={{ maxWidth: "300px" }}
                              >
                                {ticket.description}
                              </small>
                              <Badge bg="secondary" className="mt-1 small">
                                {ticket.category}
                              </Badge>
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
                              <div className="fw-bold small">
                                {ticket.author}
                              </div>
                              <small className="text-muted">
                                {ticket.authorEmail}
                              </small>
                            </div>
                          </td>
                          <td className="py-3">
                            {ticket.assignedTo ? (
                              <Badge bg="info">{ticket.assignedTo}</Badge>
                            ) : (
                              <Badge bg="light" text="dark">
                                Unassigned
                              </Badge>
                            )}
                          </td>
                          <td className="py-3">
                            <small>{ticket.createdAt}</small>
                          </td>
                          <td className="py-3">
                            <Badge bg="primary" className="rounded-pill">
                              {ticket.replies}
                            </Badge>
                          </td>
                          <td className="py-3 text-center">
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                                style={{ border: "none" }}
                              >
                                ⋮
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  as={Link}
                                  to={`/ticket/${ticket.id}`}
                                >
                                  👁️ View Ticket
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                    setShowAssignModal(true);
                                  }}
                                >
                                  👤 Assign Agent
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                  onClick={() =>
                                    handleStatusChange(ticket.id, "in_progress")
                                  }
                                  disabled={ticket.status === "in_progress"}
                                >
                                  🔄 Mark In Progress
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() =>
                                    handleStatusChange(ticket.id, "answered")
                                  }
                                  disabled={ticket.status === "answered"}
                                >
                                  ✅ Mark Answered
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() =>
                                    handleStatusChange(ticket.id, "closed")
                                  }
                                  disabled={ticket.status === "closed"}
                                >
                                  🔒 Close Ticket
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                  onClick={() => handleDeleteTicket(ticket.id)}
                                  className="text-danger"
                                >
                                  🗑️ Delete Ticket
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
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
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Assign Agent Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>👤 Assign Agent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div>
              <div className="mb-3">
                <strong>Ticket:</strong> #{selectedTicket.id}{" "}
                {selectedTicket.title}
              </div>
              <Form.Group>
                <Form.Label>Select Agent</Form.Label>
                <Form.Select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <option value="">Choose an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.name}>
                      {agent.name} ({agent.activeTickets} active tickets)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignTicket}
            disabled={!selectedAgent}
          >
            Assign Ticket
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminAllTicketsPage;
