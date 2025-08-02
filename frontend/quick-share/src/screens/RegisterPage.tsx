import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { apiService } from "../services/api";

const customStyles = {
  registerBg: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
  },
  registerCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
  },
  customButton: {
    borderRadius: "50px",
    padding: "12px 30px",
    fontWeight: "600",
  },
};

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("danger");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setAlertMessage("Please fill in all required fields");
      setAlertType("danger");
      setShowAlert(true);
      setIsLoading(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlertMessage("Passwords do not match");
      setAlertType("danger");
      setShowAlert(true);
      setIsLoading(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (formData.password.length < 6) {
      setAlertMessage("Password must be at least 6 characters long");
      setAlertType("danger");
      setShowAlert(true);
      setIsLoading(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    try {
      const response = await apiService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        department: formData.department || undefined,
      });

      if (response.success && response.user && response.token) {
        // Store authentication data
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("userEmail", response.user.email);
        localStorage.setItem("userName", response.user.name);
        localStorage.setItem("userRole", response.user.role);
        localStorage.setItem("userId", response.user.id);

        // Store additional user data if available
        if (response.user.phone) {
          localStorage.setItem("userPhone", response.user.phone);
        }
        if (response.user.department) {
          localStorage.setItem("userDepartment", response.user.department);
        }

        // Dispatch custom event for navigation component
        window.dispatchEvent(new Event("authStateChanged"));

        setAlertMessage("Account created successfully! Redirecting...");
        setAlertType("success");
        setShowAlert(true);

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setAlertMessage(
          response.message || "Registration failed. Please try again.",
        );
        setAlertType("danger");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      setAlertMessage(
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection.",
      );
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }

    setIsLoading(false);
  };

  return (
    <div style={customStyles.registerBg}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={6} md={8} sm={10}>
            <Card style={customStyles.registerCard}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold text-dark mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-muted">
                    Join QuickDesk and start managing tickets efficiently
                  </p>
                </div>

                {showAlert && (
                  <Alert variant={alertType} className="mb-3">
                    {alertMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      size="lg"
                      style={{ borderRadius: "10px" }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      size="lg"
                      style={{ borderRadius: "10px" }}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="123-456-7890"
                          value={formData.phone}
                          onChange={handleInputChange}
                          size="lg"
                          style={{ borderRadius: "10px" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Control
                          type="text"
                          name="department"
                          placeholder="e.g., IT, HR, Sales"
                          value={formData.department}
                          onChange={handleInputChange}
                          size="lg"
                          style={{ borderRadius: "10px" }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password *</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Create password (min 6 characters)"
                          value={formData.password}
                          onChange={handleInputChange}
                          size="lg"
                          style={{ borderRadius: "10px" }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Confirm Password *</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          size="lg"
                          style={{ borderRadius: "10px" }}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-100 mb-3"
                    disabled={isLoading}
                    style={{
                      ...customStyles.customButton,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </Form>

                <div className="text-center">
                  <p className="text-muted">
                    Already have an account?{" "}
                    <Link to="/login" className="text-decoration-none">
                      Sign in here
                    </Link>
                  </p>
                  <Link to="/" className="text-muted text-decoration-none">
                    ← Back to Home
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default RegisterPage;
