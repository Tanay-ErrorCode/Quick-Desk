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
  categoryCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
};

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  ticketCount: number;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: number;
  name: string;
  category: string;
  color: string;
  usageCount: number;
  status: "Active" | "Inactive";
}

function AdminCategoryManagementPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("success");
  const [activeTab, setActiveTab] = useState("categories");
  const navigate = useNavigate();

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#007bff",
    icon: "📂",
  });

  const [tagForm, setTagForm] = useState({
    name: "",
    category: "",
    color: "#6c757d",
  });

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
      // Load sample categories
      const sampleCategories: Category[] = [
        {
          id: 1,
          name: "Technical",
          description: "Technical support and troubleshooting issues",
          color: "#007bff",
          icon: "🔧",
          ticketCount: 45,
          status: "Active",
          createdAt: "2024-01-15",
          updatedAt: "2025-01-20",
        },
        {
          id: 2,
          name: "Development",
          description: "Programming and development related questions",
          color: "#28a745",
          icon: "💻",
          ticketCount: 38,
          status: "Active",
          createdAt: "2024-01-15",
          updatedAt: "2025-01-25",
        },
        {
          id: 3,
          name: "Database",
          description: "Database administration and queries",
          color: "#dc3545",
          icon: "🗄️",
          ticketCount: 28,
          status: "Active",
          createdAt: "2024-01-20",
          updatedAt: "2025-01-28",
        },
        {
          id: 4,
          name: "DevOps",
          description: "Deployment, CI/CD, and infrastructure issues",
          color: "#fd7e14",
          icon: "⚙️",
          ticketCount: 22,
          status: "Active",
          createdAt: "2024-02-01",
          updatedAt: "2025-01-30",
        },
        {
          id: 5,
          name: "UI/UX",
          description: "User interface and user experience design",
          color: "#e83e8c",
          icon: "🎨",
          ticketCount: 15,
          status: "Active",
          createdAt: "2024-02-10",
          updatedAt: "2025-01-22",
        },
        {
          id: 6,
          name: "Security",
          description: "Security vulnerabilities and best practices",
          color: "#6f42c1",
          icon: "🔒",
          ticketCount: 8,
          status: "Active",
          createdAt: "2024-03-01",
          updatedAt: "2025-01-18",
        },
        {
          id: 7,
          name: "Legacy",
          description: "Old category no longer in use",
          color: "#6c757d",
          icon: "📁",
          ticketCount: 0,
          status: "Inactive",
          createdAt: "2023-12-01",
          updatedAt: "2024-06-15",
        },
      ];

      const sampleTags: Tag[] = [
        {
          id: 1,
          name: "urgent",
          category: "Technical",
          color: "#dc3545",
          usageCount: 23,
          status: "Active",
        },
        {
          id: 2,
          name: "bug-fix",
          category: "Development",
          color: "#fd7e14",
          usageCount: 18,
          status: "Active",
        },
        {
          id: 3,
          name: "sql-query",
          category: "Database",
          color: "#0dcaf0",
          usageCount: 15,
          status: "Active",
        },
        {
          id: 4,
          name: "docker",
          category: "DevOps",
          color: "#198754",
          usageCount: 12,
          status: "Active",
        },
        {
          id: 5,
          name: "mobile",
          category: "UI/UX",
          color: "#e83e8c",
          usageCount: 9,
          status: "Active",
        },
        {
          id: 6,
          name: "authentication",
          category: "Security",
          color: "#6f42c1",
          usageCount: 7,
          status: "Active",
        },
        {
          id: 7,
          name: "deprecated",
          category: "Legacy",
          color: "#6c757d",
          usageCount: 0,
          status: "Inactive",
        },
      ];

      setCategories(sampleCategories);
      setTags(sampleTags);
      setFilteredCategories(sampleCategories);
    }
  }, [navigate]);

  useEffect(() => {
    let filtered = [...categories];

    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (category) => category.status === statusFilter,
      );
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm, statusFilter]);

  const handleCreateCategory = () => {
    if (!categoryForm.name || !categoryForm.description) {
      setAlertMessage("Please fill in all required fields");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const newCategory: Category = {
      id: Math.max(...categories.map((c) => c.id)) + 1,
      name: categoryForm.name,
      description: categoryForm.description,
      color: categoryForm.color,
      icon: categoryForm.icon,
      ticketCount: 0,
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setCategories((prev) => [...prev, newCategory]);
    setShowCategoryModal(false);
    setCategoryForm({
      name: "",
      description: "",
      color: "#007bff",
      icon: "📂",
    });
    setAlertMessage("Category created successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
    });
    setShowCategoryModal(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === editingCategory.id
          ? {
              ...cat,
              name: categoryForm.name,
              description: categoryForm.description,
              color: categoryForm.color,
              icon: categoryForm.icon,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : cat,
      ),
    );

    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      description: "",
      color: "#007bff",
      icon: "📂",
    });
    setAlertMessage("Category updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleToggleStatus = (categoryId: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              status: cat.status === "Active" ? "Inactive" : "Active",
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : cat,
      ),
    );

    setAlertMessage("Category status updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleDeleteCategory = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category && category.ticketCount > 0) {
      setAlertMessage("Cannot delete category with existing tickets!");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      setAlertMessage("Category deleted successfully!");
      setAlertType("success");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const iconOptions = [
    "📂",
    "🔧",
    "💻",
    "🗄️",
    "⚙️",
    "🎨",
    "🔒",
    "📊",
    "🌐",
    "📱",
    "🚀",
    "💡",
  ];

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
                  📂 Category & Tag Management
                </h2>
                <p className="text-muted mb-0">
                  Manage ticket categories and tags for better organization
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
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({
                      name: "",
                      description: "",
                      color: "#007bff",
                      icon: "📂",
                    });
                    setShowCategoryModal(true);
                  }}
                  style={customStyles.customButton}
                >
                  ➕ Add Category
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

        {/* Tabs */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card>
              <Card.Header className="bg-white">
                <div className="d-flex gap-3">
                  <Button
                    variant={
                      activeTab === "categories" ? "primary" : "outline-primary"
                    }
                    onClick={() => setActiveTab("categories")}
                    size="sm"
                  >
                    📂 Categories (
                    {categories.filter((c) => c.status === "Active").length})
                  </Button>
                  <Button
                    variant={
                      activeTab === "tags" ? "primary" : "outline-primary"
                    }
                    onClick={() => setActiveTab("tags")}
                    size="sm"
                  >
                    🏷️ Tags ({tags.filter((t) => t.status === "Active").length})
                  </Button>
                </div>
              </Card.Header>
            </Card>
          </Col>
        </Row>

        {activeTab === "categories" && (
          <>
            {/* Filters */}
            <Row className="mb-4">
              <Col xs={12}>
                <Card style={customStyles.searchCard}>
                  <Card.Body className="p-3">
                    <Row className="g-3 align-items-end">
                      <Col lg={4} md={6}>
                        <Form.Label className="small fw-bold">
                          Search Categories
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            placeholder="Search by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <InputGroup.Text>🔍</InputGroup.Text>
                        </InputGroup>
                      </Col>
                      <Col lg={2} md={3}>
                        <Form.Label className="small fw-bold">
                          Status
                        </Form.Label>
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
                        <div className="d-flex gap-2 justify-content-lg-end align-items-end">
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
                            {filteredCategories.length} categories
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Categories Grid */}
            <Row className="g-4">
              {filteredCategories.map((category) => (
                <Col key={category.id} lg={4} md={6}>
                  <Card
                    style={customStyles.categoryCard}
                    className={`h-100 ${category.status === "Inactive" ? "opacity-75" : ""}`}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "50px",
                              height: "50px",
                              backgroundColor: category.color + "20",
                              color: category.color,
                              fontSize: "1.5rem",
                            }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">{category.name}</h6>
                            <Badge
                              bg={
                                category.status === "Active"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {category.status}
                            </Badge>
                          </div>
                        </div>

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
                              onClick={() => handleEditCategory(category)}
                            >
                              ✏️ Edit Category
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleToggleStatus(category.id)}
                              className={
                                category.status === "Active"
                                  ? "text-warning"
                                  : "text-success"
                              }
                            >
                              {category.status === "Active"
                                ? "🚫 Deactivate"
                                : "✅ Activate"}
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-danger"
                              disabled={category.ticketCount > 0}
                            >
                              🗑️ Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>

                      <p className="text-muted small mb-3">
                        {category.description}
                      </p>

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold text-dark">
                            {category.ticketCount}
                          </div>
                          <small className="text-muted">Tickets</small>
                        </div>
                        <div className="text-end">
                          <div className="small text-muted">Updated</div>
                          <small className="text-muted">
                            {category.updatedAt}
                          </small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {filteredCategories.length === 0 && (
              <Row className="mt-5">
                <Col xs={12}>
                  <div className="text-center py-5">
                    <h5 className="text-muted">No categories found</h5>
                    <p className="text-muted">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </Col>
              </Row>
            )}
          </>
        )}

        {activeTab === "tags" && (
          <Row>
            <Col xs={12}>
              <Card style={customStyles.tableCard}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="fw-bold mb-0">🏷️ Tags Management</h6>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowTagModal(true)}
                    >
                      ➕ Add Tag
                    </Button>
                  </div>

                  <div className="table-responsive">
                    <Table className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="border-0 py-3">Tag</th>
                          <th className="border-0 py-3">Category</th>
                          <th className="border-0 py-3">Usage</th>
                          <th className="border-0 py-3">Status</th>
                          <th className="border-0 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tags.map((tag) => (
                          <tr key={tag.id}>
                            <td className="py-3">
                              <Badge
                                style={{
                                  backgroundColor: tag.color,
                                  color: "white",
                                }}
                                className="px-3 py-2"
                              >
                                {tag.name}
                              </Badge>
                            </td>
                            <td className="py-3">{tag.category}</td>
                            <td className="py-3">{tag.usageCount} tickets</td>
                            <td className="py-3">
                              <Badge
                                bg={
                                  tag.status === "Active"
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {tag.status}
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
                                  <Dropdown.Item>✏️ Edit Tag</Dropdown.Item>
                                  <Dropdown.Item className="text-warning">
                                    {tag.status === "Active"
                                      ? "🚫 Deactivate"
                                      : "✅ Activate"}
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item className="text-danger">
                                    🗑️ Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* Category Modal */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? "✏️ Edit Category" : "➕ Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Category Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    placeholder="Enter category name"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Icon</Form.Label>
                  <Form.Select
                    value={categoryForm.icon}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, icon: e.target.value })
                    }
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon} {icon}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                placeholder="Enter category description"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, color: e.target.value })
                  }
                  style={{ width: "60px" }}
                />
                <Form.Control
                  type="text"
                  value={categoryForm.color}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, color: e.target.value })
                  }
                  placeholder="#007bff"
                />
              </div>
            </Form.Group>

            <div className="p-3 bg-light rounded">
              <h6 className="mb-2">Preview:</h6>
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: categoryForm.color + "20",
                    color: categoryForm.color,
                    fontSize: "1.2rem",
                  }}
                >
                  {categoryForm.icon}
                </div>
                <div>
                  <div className="fw-bold">
                    {categoryForm.name || "Category Name"}
                  </div>
                  <small className="text-muted">
                    {categoryForm.description || "Category description"}
                  </small>
                </div>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCategoryModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={
              editingCategory ? handleUpdateCategory : handleCreateCategory
            }
          >
            {editingCategory ? "Update Category" : "Create Category"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Tag Modal */}
      <Modal show={showTagModal} onHide={() => setShowTagModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>➕ Add New Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tag Name *</Form.Label>
              <Form.Control
                type="text"
                value={tagForm.name}
                onChange={(e) =>
                  setTagForm({ ...tagForm, name: e.target.value })
                }
                placeholder="Enter tag name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                value={tagForm.category}
                onChange={(e) =>
                  setTagForm({ ...tagForm, category: e.target.value })
                }
              >
                <option value="">Select category...</option>
                {categories
                  .filter((c) => c.status === "Active")
                  .map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="color"
                value={tagForm.color}
                onChange={(e) =>
                  setTagForm({ ...tagForm, color: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTagModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">Create Tag</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminCategoryManagementPage;
