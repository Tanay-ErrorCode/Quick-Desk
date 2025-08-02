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
};

interface Agent {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  joinDate: string;
  lastActive: string;
  assignedTickets: number;
  resolvedTickets: number;
  specialty: string[];
  performance: number; // 0-100 rating
}

function AdminAgentManagementPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    specialty: [] as string[],
  });
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
      // Load sample agents data
      const sampleAgents: Agent[] = [
        {
          id: 1,
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          status: "Active",
          joinDate: "2023-11-20",
          lastActive: "2025-01-30 16:45",
          assignedTickets: 8,
          resolvedTickets: 87,
          specialty: ["Technical", "Development"],
          performance: 92,
        },
        {
          id: 2,
          name: "Mike Chen",
          email: "mike.chen@company.com",
          status: "Active",
          joinDate: "2024-03-10",
          lastActive: "2025-01-30 15:20",
          assignedTickets: 15,
          resolvedTickets: 62,
          specialty: ["Database", "DevOps"],
          performance: 88,
        },
        {
          id: 3,
          name: "Lisa Rodriguez",
          email: "lisa.rodriguez@company.com",
          status: "Active",
          joinDate: "2023-12-01",
          lastActive: "2025-01-30 17:00",
          assignedTickets: 6,
          resolvedTickets: 45,
          specialty: ["UI/UX", "Technical"],
          performance: 94,
        },
        {
          id: 4,
          name: "David Kim",
          email: "david.kim@company.com",
          status: "Active",
          joinDate: "2024-04-15",
          lastActive: "2025-01-30 13:25",
          assignedTickets: 10,
          resolvedTickets: 38,
          specialty: ["Security", "DevOps"],
          performance: 85,
        },
        {
          id: 5,
          name: "Alex Thompson",
          email: "alex.thompson@company.com",
          status: "Inactive",
          joinDate: "2024-01-10",
          lastActive: "2025-01-20 09:30",
          assignedTickets: 0,
          resolvedTickets: 25,
          specialty: ["Development"],
          performance: 76,
        },
      ];

      setAgents(sampleAgents);
      setFilteredAgents(sampleAgents);
    }
  }, [navigate]);

  useEffect(() => {
    let filtered = [...agents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((agent) => agent.status === statusFilter);
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, statusFilter]);

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowEditModal(true);
  };

  const handleSaveAgent = () => {
    if (!selectedAgent) return;

    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === selectedAgent.id ? selectedAgent : agent
      )
    );

    setShowEditModal(false);
    setSelectedAgent(null);
    setAlertMessage("Agent updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.email) {
      setAlertMessage("Please fill in all required fields");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const agent: Agent = {
      id: Math.max(...agents.map(a => a.id)) + 1,
      name: newAgent.name,
      email: newAgent.email,
      status: "Active",
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: "Never",
      assignedTickets: 0,
      resolvedTickets: 0,
      specialty: newAgent.specialty,
      performance: 0,
    };

    setAgents((prev) => [...prev, agent]);
    setShowCreateModal(false);
    setNewAgent({ name: "", email: "", specialty: [] });
    setAlertMessage("Agent created successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleToggleStatus = (agentId: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              status: agent.status === "Active" ? "Inactive" : "Active",
              assignedTickets: agent.status === "Active" ? 0 : agent.assignedTickets,
            }
          : agent
      )
    );

    setAlertMessage("Agent status updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleDeleteAgent = (agentId: number) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
      setAlertMessage("Agent deleted successfully!");
      setAlertType("success");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "Active" ? "success" : "secondary";
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "success";
    if (performance >= 80) return "warning";
    if (performance >= 70) return "info";
    return "danger";
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
                <h2 className="fw-bold text-dark mb-1">🛠️ Agent Management</h2>
                <p className="text-muted mb-0">
                  Manage support agents and their performance
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Link
                  to="/dashboard"
                  className="btn btn-outline-secondary"
                  style={customStyles.customButton}
                >
                  ← Back to Dashboard
                </Link>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  style={customStyles.customButton}
                >
                  ➕ Add Agent
                </Button>
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
                  <Col lg={4} md={6}>
                    <Form.Label className="small fw-bold">Search Agents</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <InputGroup.Text>🔍</InputGroup.Text>
                    </InputGroup>
                  </Col>
                  <Col lg={2} md={3}>
                    <Form.Label className="small fw-bold">Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Form.Select>
                  </Col>
                  <Col lg={6} className="text-lg-end">
                    <div className="d-flex gap-2 justify-content-lg-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("All");
                        }}
                      >
                        Clear Filters
                      </Button>
                      <Badge bg="info" className="px-3 py-2">
                        {filteredAgents.length} agents found
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
            <Card className="bg-success text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{agents.filter(a => a.status === 'Active').length}</h3>
                <small>Active Agents</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="bg-warning text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{agents.reduce((sum, a) => sum + a.assignedTickets, 0)}</h3>
                <small>Total Assigned</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="bg-info text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{agents.reduce((sum, a) => sum + a.resolvedTickets, 0)}</h3>
                <small>Total Resolved</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="bg-primary text-white">
              <Card.Body className="text-center p-3">
                <h3 className="mb-1">{Math.round(agents.reduce((sum, a) => sum + a.performance, 0) / agents.length)}%</h3>
                <small>Avg Performance</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Agents Table */}
        <Row>
          <Col xs={12}>
            <Card style={customStyles.tableCard}>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 px-4 py-3">Agent</th>
                        <th className="border-0 py-3">Status</th>
                        <th className="border-0 py-3">Performance</th>
                        <th className="border-0 py-3">Tickets</th>
                        <th className="border-0 py-3">Specialty</th>
                        <th className="border-0 py-3">Last Active</th>
                        <th className="border-0 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgents.map((agent) => (
                        <tr key={agent.id}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-bold">{agent.name}</div>
                              <small className="text-muted">{agent.email}</small>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge bg={getStatusBadgeColor(agent.status)}>
                              {agent.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge bg={getPerformanceColor(agent.performance)}>
                              {agent.performance}%
                            </Badge>
                          </td>
                          <td className="py-3">
                            <small>
                              Assigned: {agent.assignedTickets}
                              <br />
                              Resolved: {agent.resolvedTickets}
                            </small>
                          </td>
                          <td className="py-3">
                            <div>
                              {agent.specialty.map((spec, index) => (
                                <Badge key={index} bg="secondary" className="me-1 mb-1 small">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            <small>{agent.lastActive}</small>
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
                                <Dropdown.Item onClick={() => handleEditAgent(agent)}>
                                  ✏️ Edit Agent
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleToggleStatus(agent.id)}
                                  className={
                                    agent.status === "Active"
                                      ? "text-warning"
                                      : "text-success"
                                  }
                                >
                                  {agent.status === "Active" ? "🚫 Deactivate" : "✅ Activate"}
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item className="text-primary">
                                  📊 View Performance
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleDeleteAgent(agent.id)}
                                  className="text-danger"
                                >
                                  🗑️ Delete Agent
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {filteredAgents.length === 0 && (
                  <div className="text-center py-5">
                    <h5 className="text-muted">No agents found</h5>
                    <p className="text-muted">
                      Try adjusting your search criteria
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Edit Agent Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Edit Agent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAgent && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedAgent.name}
                  onChange={(e) =>
                    setSelectedAgent({ ...selectedAgent, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={selectedAgent.email}
                  onChange={(e) =>
                    setSelectedAgent({ ...selectedAgent, email: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={selectedAgent.status}
                  onChange={(e) =>
                    setSelectedAgent({
                      ...selectedAgent,
                      status: e.target.value as Agent["status"],
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAgent}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Agent Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>➕ Add New Agent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={newAgent.name}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, name: e.target.value })
                }
                placeholder="Enter agent name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={newAgent.email}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateAgent}>
            Create Agent
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminAgentManagementPage;