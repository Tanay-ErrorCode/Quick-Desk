import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { apiService, CreateTicketData, Category } from "../services/api";

const customStyles = {
  formCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  customButton: {
    borderRadius: "25px",
    padding: "12px 30px",
    fontWeight: "600",
  },
  headerGradient: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "15px 15px 0 0",
  },
};

interface TicketFormData {
  title: string;
  description: string;
  tags: string;
  category_id: string;
  priority: "low" | "medium" | "high";
  is_urgent: boolean;
}

function CreateTicketPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    description: "",
    tags: "",
    category_id: "",
    priority: "medium",
    is_urgent: false,
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      navigate("/login");
      return;
    }

    // Load categories
    loadCategories();
  }, [navigate]);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.filter(cat => cat.is_active));
        if (response.data && response.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: response.data?.[0]?.id ?? '' }));
        }
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Fallback categories if API fails
      setCategories([
        { id: "1", name: "Technical", description: "", color: "#007bff", icon: "🛠️", is_active: true },
        { id: "2", name: "Development", description: "", color: "#28a745", icon: "💻", is_active: true },
        { id: "3", name: "Database", description: "", color: "#dc3545", icon: "🗄️", is_active: true },
        { id: "4", name: "DevOps", description: "", color: "#fd7e14", icon: "⚙️", is_active: true },
        { id: "5", name: "UI/UX", description: "", color: "#6f42c1", icon: "🎨", is_active: true },
        { id: "6", name: "Security", description: "", color: "#e83e8c", icon: "🔒", is_active: true },
        { id: "7", name: "General", description: "", color: "#6c757d", icon: "📝", is_active: true },
      ]);
      if (categories.length === 0) {
        setFormData(prev => ({ ...prev, category_id: "1" }));
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.title.trim()) {
      setAlertMessage("Please enter a ticket title");
      setAlertType("danger");
      setShowAlert(true);
      setIsSubmitting(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (!formData.description.trim()) {
      setAlertMessage("Please provide a description");
      setAlertType("danger");
      setShowAlert(true);
      setIsSubmitting(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (formData.description.length < 20) {
      setAlertMessage("Description should be at least 20 characters long");
      setAlertType("danger");
      setShowAlert(true);
      setIsSubmitting(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    try {
      const ticketData: CreateTicketData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id,
        priority: formData.priority,
        is_urgent: formData.is_urgent,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      };

      const response = await apiService.createTicket(ticketData);

      if (response.success) {
        setAlertMessage("Your ticket has been created successfully!");
        setAlertType("success");
        setShowAlert(true);

        // Reset form
        setFormData({
          title: "",
          description: "",
          tags: "",
          category_id: categories.length > 0 ? categories[0].id : "",
          priority: "medium",
          is_urgent: false,
        });

        // Redirect after success
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setAlertMessage(response.message || "Failed to create ticket");
        setAlertType("danger");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to create ticket. Please try again.");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }

    setIsSubmitting(false);
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

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center">
                <Card.Body>
                  <h3>Please log in to create a ticket</h3>
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

      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold text-dark mb-1">Create Support Ticket</h2>
                <p className="text-muted">Describe your issue and get help from our support team</p>
              </div>
              <Link to="/dashboard" className="btn btn-outline-secondary">
                ← Back to Dashboard
              </Link>
            </div>
          </Col>
        </Row>

        {/* Alert */}
        {showAlert && (
          <Alert variant={alertType} className="mb-4">
            {alertMessage}
          </Alert>
        )}

        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <Card style={customStyles.formCard}>
              {/* Card Header */}
              <div style={customStyles.headerGradient} className="p-4">
                <h4 className="mb-0 fw-bold">Create New Support Ticket</h4>
                <small className="opacity-75">
                  Fill out the form below to get help from our support team
                </small>
              </div>

              <Card.Body className="p-5">
                <Form onSubmit={handleSubmit}>
                  {/* Ticket Title */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Ticket Title <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter a clear, descriptive title for your issue"
                      size="lg"
                      style={{ borderRadius: "10px" }}
                      maxLength={200}
                    />
                    <Form.Text className="text-muted">
                      Be specific and descriptive. This helps our team understand your issue quickly.
                    </Form.Text>
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Description <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide detailed information about your issue. Include what you've tried, error messages, steps to reproduce, etc."
                      style={{ borderRadius: "10px" }}
                    />
                    <Form.Text className="text-muted">
                      {formData.description.length}/500 characters. Minimum 20 characters required.
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    {/* Category */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Category <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          size="lg"
                          style={{ borderRadius: "10px" }}
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Priority */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Priority</Form.Label>
                        <Form.Select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          size="lg"
                          style={{ borderRadius: "10px" }}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </Form.Select>
                        <div className="mt-2">
                          <Badge bg={getPriorityColor(formData.priority)}>
                            {formData.priority.toUpperCase()} Priority
                          </Badge>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Tags */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Tags</Form.Label>
                    <Form.Control
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Enter tags separated by commas (e.g., react, javascript, api)"
                      size="lg"
                      style={{ borderRadius: "10px" }}
                    />
                    <Form.Text className="text-muted">
                      Add relevant tags to help categorize your ticket. Separate multiple tags with commas.
                    </Form.Text>
                  </Form.Group>

                  {/* Urgent Checkbox */}
                  <Form.Group className="mb-5">
                    <Form.Check
                      type="checkbox"
                      name="is_urgent"
                      checked={formData.is_urgent}
                      onChange={handleInputChange}
                      label="🚨 Mark as Urgent"
                      className="fw-bold"
                    />
                    <Form.Text className="text-muted">
                      Only mark as urgent if this issue is blocking critical business operations.
                    </Form.Text>
                  </Form.Group>

                  {/* Submit Button */}
                  <div className="text-center">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      style={{
                        ...customStyles.customButton,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        minWidth: "150px",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Creating...
                        </>
                      ) : (
                        "Create Ticket"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Help Section */}
        <Row className="mt-5">
          <Col>
            <Card className="bg-light border-0">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">
                  💡 Tips for Better Support
                </h5>
                <Row>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        ✅ <strong>Be specific</strong> - Include exact error messages
                      </li>
                      <li className="mb-2">
                        ✅ <strong>Show your work</strong> - What have you already tried?
                      </li>
                      <li className="mb-2">
                        ✅ <strong>Add context</strong> - What are you trying to achieve?
                      </li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        ✅ <strong>Use relevant tags</strong> - Help us categorize your issue
                      </li>
                      <li className="mb-2">
                        ✅ <strong>Choose correct priority</strong> - This helps us respond appropriately
                      </li>
                      <li className="mb-2">
                        ✅ <strong>Check spelling</strong> - Clear descriptions get faster responses
                      </li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default CreateTicketPage;