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
  Tabs,
  Tab,
  Modal,
  Alert,
  InputGroup,
  Dropdown,
  Spinner,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { apiService, Ticket } from "../services/api";

const customStyles = {
  dashboardCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
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
  urgentRow: {
    backgroundColor: "#fff5f5",
    borderLeft: "4px solid #dc3545",
  },
  searchCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
  },
};

function StaffDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [activeTab, setActiveTab] = useState("assigned");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("success");
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status and role
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

    if (role !== "Support Agent" && role !== "Admin") {
      navigate("/dashboard");
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getStaffDashboard();
      
      if (response.success && response.tickets) {
        setTickets(response.tickets);
        setFilteredTickets(response.tickets);
      } else {
        // Fallback: Load all tickets and filter client-side
        const ticketsResponse = await apiService.getTickets({
          limit: 100,
        });
        
        if (ticketsResponse.success && ticketsResponse.tickets) {
          setTickets(ticketsResponse.tickets);
          setFilteredTickets(ticketsResponse.tickets);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setAlertMessage("Failed to load dashboard data");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...tickets];

    // Filter by tab
    if (activeTab === "assigned") {
      filtered = filtered.filter((ticket) => 
        ticket.assigned_to && ticket.assigned_to.name === userName
      );
    } else if (activeTab === "unassigned") {
      filtered = filtered.filter((ticket) => !ticket.assigned_to);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.author.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter(
        (ticket) => ticket.category?.name === categoryFilter,
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

    // Sort tickets
    switch (sortBy) {
      case "recent":
        filtered.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort(
          (a, b) => (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                   (priorityOrder[a.priority as keyof typeof priorityOrder] || 0),
        );
        break;
      case "replies":
        filtered.sort((a, b) => b.reply_count - a.reply_count);
        break;
      default:
        break;
    }

    // Urgent tickets first
    filtered.sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      return 0;
    });

    setFilteredTickets(filtered);
  }, [
    tickets,
    searchTerm,
    categoryFilter,
    statusFilter,
    priorityFilter,
    sortBy,
    activeTab,
    userName,
  ]);

  const handlePickupTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowPickupModal(true);
  };

  const confirmPickupTicket = async () => {
    if (!selectedTicket) return;

    try {
      const response = await apiService.pickupTicket(selectedTicket.id);
      
      if (response.success) {
        // Update local state
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === selectedTicket.id
              ? {
                  ...ticket,
                  assigned_to: {
                    id: localStorage.getItem("userId") || "",
                    name: userName,
                    email: localStorage.getItem("userEmail") || "",
                    role: userRole,
                  },
                  status: "in_progress",
                  updated_at: new Date().toISOString(),
                }
              : ticket,
          ),
        );

        setShowPickupModal(false);
        setSelectedTicket(null);
        setAlertMessage("Ticket picked up successfully!");
        setAlertType("success");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        setAlertMessage(response.message || "Failed to pickup ticket");
        setAlertType("danger");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to pickup ticket");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const response = await apiService.updateTicket(ticketId, {
        // Note: This might need to be adjusted based on your backend API
        // You might need a separate endpoint for status updates
      });

      // For now, update locally
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : ticket,
        ),
      );

      setAlertMessage("Ticket status updated successfully!");
      setAlertType("success");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to update ticket status");
      setAlertType("danger");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const assignedTickets = tickets.filter((t) => t.assigned_to?.name === userName);
  const unassignedTickets = tickets.filter((t) => !t.assigned_to);
  const urgentTickets = assignedTickets.filter((t) => t.is_urgent);
  const inProgressTickets = assignedTickets.filter(
    (t) => t.status === "in_progress",
  );

  if (!isLoggedIn || (userRole !== "Support Agent" && userRole !== "Admin")) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="text-center shadow">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Access Denied</h3>
                  <p>You need support agent or admin privileges to access this page.</p>
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
          <Col xs={12}>
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
              <div className="flex-grow-1">
                <h2 className="fw-bold text-dark mb-1">
                  🛠️ Support Agent Dashboard
                </h2>
                <p className="text-muted mb-0">
                  Manage and respond to support tickets
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
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
        <Row className="mb-4 g-3">
          <Col md={3} sm={6}>
            <Card className="bg-primary text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{assignedTickets.length}</h3>
                <small>Assigned to Me</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="bg-warning text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{inProgressTickets.length}</h3>
                <small>In Progress</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="bg-danger text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{urgentTickets.length}</h3>
                <small>Urgent</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="bg-success text-white">
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
                  <Col lg={2} md={3}>
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
                  <Col lg={1} className="text-lg-end">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setCategoryFilter("All");
                        setStatusFilter("All");
                        setPriorityFilter("All");
                        setSortBy("recent");
                      }}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tickets Table */}
        <Row>
          <Col xs={12}>
            <Card style={customStyles.tableCard}>
              <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k || "assigned")}
                  className="border-0"
                >
                  <Tab
                    eventKey="assigned"
                    title={
                      <span>
                        👤 My Tickets ({assignedTickets.length})
                        {urgentTickets.length > 0 && (
                          <Badge bg="danger" className="ms-2">
                            {urgentTickets.length} urgent
                          </Badge>
                        )}
                      </span>
                    }
                  />
                  <Tab
                    eventKey="unassigned"
                    title={
                      <span>
                        🆕 Available Tickets ({unassignedTickets.length})
                        {unassignedTickets.some((t) => t.is_urgent) && (
                          <Badge bg="warning" className="ms-2">
                            ⚠️
                          </Badge>
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
                          style={ticket.is_urgent ? customStyles.urgentRow : {}}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-bold d-flex align-items-center">
                                {ticket.is_urgent && (
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
                              <div className="d-flex gap-2 mt-1">
                                <Badge bg="secondary" className="small">
                                  {ticket.category?.name || 'General'}
                                </Badge>
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
                              <div className="fw-bold small">
                                {ticket.author.name}
                              </div>
                              <small className="text-muted">
                                {ticket.author.email}
                              </small>
                            </div>
                          </td>
                          <td className="py-3">
                            <small>
                              {formatDate(ticket.created_at)}
                            </small>
                          </td>
                          <td className="py-3">
                            <small>{formatDate(ticket.updated_at)}</small>
                          </td>
                          <td className="py-3">
                            <Badge bg="primary" className="rounded-pill">
                              {ticket.reply_count}
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
                                  <Dropdown.Item
                                    as={Link}
                                    to={`/ticket/${ticket.id}`}
                                  >
                                    👁️ View Ticket
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
                                      handleStatusChange(ticket.id, "resolved")
                                    }
                                    disabled={ticket.status === "resolved"}
                                  >
                                    ✅ Mark Resolved
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleStatusChange(ticket.id, "closed")
                                    }
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
                <strong>Ticket:</strong> #{selectedTicket.id}{" "}
                {selectedTicket.title}
              </div>
              <div className="mb-3">
                <strong>Priority:</strong>
                <Badge
                  bg={getPriorityColor(selectedTicket.priority)}
                  className="ms-2"
                >
                  {selectedTicket.priority.toUpperCase()}
                </Badge>
                {selectedTicket.is_urgent && (
                  <Badge bg="danger" className="ms-2">
                    URGENT
                  </Badge>
                )}
              </div>
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="text-muted mt-1">{selectedTicket.description}</p>
              </div>
              <Alert variant="info">
                By picking up this ticket, you will be assigned as the
                responsible agent and the status will change to "In Progress".
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