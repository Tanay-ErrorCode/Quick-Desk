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

interface User {
  id: number;
  name: string;
  email: string;
  role: "End User" | "Support Agent" | "Admin";
  status: "Active" | "Inactive";
  joinDate: string;
  lastActive: string;
  ticketsCreated: number;
  ticketsResolved: number;
}

function AdminUserManagementPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "End User" as User["role"],
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
      // Load sample users data
      const sampleUsers: User[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@company.com",
          role: "End User",
          status: "Active",
          joinDate: "2024-01-15",
          lastActive: "2025-01-30 14:30",
          ticketsCreated: 12,
          ticketsResolved: 0,
        },
        {
          id: 2,
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          role: "Support Agent",
          status: "Active",
          joinDate: "2023-11-20",
          lastActive: "2025-01-30 16:45",
          ticketsCreated: 5,
          ticketsResolved: 87,
        },
        {
          id: 3,
          name: "Mike Chen",
          email: "mike.chen@company.com",
          role: "Support Agent",
          status: "Active",
          joinDate: "2024-03-10",
          lastActive: "2025-01-30 15:20",
          ticketsCreated: 8,
          ticketsResolved: 62,
        },
        {
          id: 4,
          name: "Alice Wilson",
          email: "alice.wilson@company.com",
          role: "End User",
          status: "Active",
          joinDate: "2024-06-05",
          lastActive: "2025-01-29 10:15",
          ticketsCreated: 7,
          ticketsResolved: 0,
        },
        {
          id: 5,
          name: "Bob Martinez",
          email: "bob.martinez@company.com",
          role: "End User",
          status: "Inactive",
          joinDate: "2024-02-28",
          lastActive: "2025-01-15 09:30",
          ticketsCreated: 3,
          ticketsResolved: 0,
        },
        {
          id: 6,
          name: "Lisa Rodriguez",
          email: "lisa.rodriguez@company.com",
          role: "Support Agent",
          status: "Active",
          joinDate: "2023-12-01",
          lastActive: "2025-01-30 17:00",
          ticketsCreated: 2,
          ticketsResolved: 45,
        },
        {
          id: 7,
          name: "David Kim",
          email: "david.kim@company.com",
          role: "Support Agent",
          status: "Active",
          joinDate: "2024-04-15",
          lastActive: "2025-01-30 13:25",
          ticketsCreated: 6,
          ticketsResolved: 38,
        },
        {
          id: 8,
          name: "Emily Taylor",
          email: "emily.taylor@company.com",
          role: "End User",
          status: "Active",
          joinDate: "2024-08-20",
          lastActive: "2025-01-30 11:45",
          ticketsCreated: 15,
          ticketsResolved: 0,
        },
      ];

      setUsers(sampleUsers);
      setFilteredUsers(sampleUsers);
    }
  }, [navigate]);

  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "All") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id ? selectedUser : user
      )
    );

    setShowEditModal(false);
    setSelectedUser(null);
    setAlertMessage("User updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      setAlertMessage("Please fill in all required fields");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const user: User = {
      id: Math.max(...users.map(u => u.id)) + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "Active",
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: "Never",
      ticketsCreated: 0,
      ticketsResolved: 0,
    };

    setUsers((prev) => [...prev, user]);
    setShowCreateModal(false);
    setNewUser({ name: "", email: "", role: "End User" });
    setAlertMessage("User created successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleToggleStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );

    setAlertMessage("User status updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
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

  const getStatusBadgeColor = (status: string) => {
    return status === "Active" ? "success" : "secondary";
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
                <h2 className="fw-bold text-dark mb-1">👥 User Management</h2>
                <p className="text-muted mb-0">
                  Manage users, roles, and permissions
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
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  style={customStyles.customButton}
                >
                  ➕ Add User
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
                    <Form.Label className="small fw-bold">Search Users</Form.Label>
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
                    <Form.Label className="small fw-bold">Role</Form.Label>
                    <Form.Select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="All">All Roles</option>
                      <option value="End User">End User</option>
                      <option value="Support Agent">Support Agent</option>
                      <option value="Admin">Admin</option>
                    </Form.Select>
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
                  <Col lg={4} className="text-lg-end">
                    <div className="d-flex gap-2 justify-content-lg-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setRoleFilter("All");
                          setStatusFilter("All");
                        }}
                      >
                        Clear Filters
                      </Button>
                      <Badge bg="info" className="px-3 py-2">
                        {filteredUsers.length} users found
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Users Table */}
        <Row>
          <Col xs={12}>
            <Card style={customStyles.tableCard}>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 px-4 py-3">User</th>
                        <th className="border-0 py-3">Role</th>
                        <th className="border-0 py-3">Status</th>
                        <th className="border-0 py-3">Join Date</th>
                        <th className="border-0 py-3">Last Active</th>
                        <th className="border-0 py-3">Tickets</th>
                        <th className="border-0 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-bold">{user.name}</div>
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge bg={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge bg={getStatusBadgeColor(user.status)}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <small>{user.joinDate}</small>
                          </td>
                          <td className="py-3">
                            <small>{user.lastActive}</small>
                          </td>
                          <td className="py-3">
                            <small>
                              Created: {user.ticketsCreated}
                              {user.role === "Support Agent" && (
                                <><br />Resolved: {user.ticketsResolved}</>
                              )}
                            </small>
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
                                <Dropdown.Item onClick={() => handleEditUser(user)}>
                                  ✏️ Edit User
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleToggleStatus(user.id)}
                                  className={
                                    user.status === "Active"
                                      ? "text-warning"
                                      : "text-success"
                                  }
                                >
                                  {user.status === "Active" ? "🚫 Deactivate" : "✅ Activate"}
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item className="text-primary">
                                  📊 View Details
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-5">
                    <h5 className="text-muted">No users found</h5>
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

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value as User["role"],
                    })
                  }
                >
                  <option value="End User">End User</option>
                  <option value="Support Agent">Support Agent</option>
                  <option value="Admin">Admin</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={selectedUser.status}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      status: e.target.value as User["status"],
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
          <Button variant="primary" onClick={handleSaveUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>➕ Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value as User["role"],
                  })
                }
              >
                <option value="End User">End User</option>
                <option value="Support Agent">Support Agent</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateUser}>
            Create User
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminUserManagementPage;