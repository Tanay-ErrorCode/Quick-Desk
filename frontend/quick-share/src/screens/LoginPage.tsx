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
  loginBg: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
  },
  loginCard: {
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

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("danger");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      setAlertMessage("Please enter both email and password");
      setAlertType("danger");
      setShowAlert(true);
      setIsLoading(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    try {
      const response = await apiService.login({ email, password });

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

        setAlertMessage("Login successful! Redirecting...");
        setAlertType("success");
        setShowAlert(true);

        setTimeout(() => {
          // Navigate based on role
          if (response.user?.role === "Admin") {
            navigate("/admin/dashboard");
          } else if (response.user?.role === "Support Agent") {
            navigate("/staff/dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 1000);
      } else {
        setAlertMessage(response.message || "Login failed. Please try again.");
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
    <div style={customStyles.loginBg}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={5} md={7} sm={9}>
            <Card style={customStyles.loginCard}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold text-dark mb-2">Welcome Back</h1>
                  <p className="text-muted">
                    Sign in to your QuickDesk account
                  </p>
                </div>

                {showAlert && (
                  <Alert variant={alertType} className="mb-3">
                    {alertMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="lg"
                      style={{ borderRadius: "10px" }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                      style={{ borderRadius: "10px" }}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div></div>
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none small"
                    >
                      Forgot Password?
                    </Link>
                  </div>

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
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </Form>

                <div className="text-center">
                  <p className="text-muted">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-decoration-none">
                      Sign up here
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

export default LoginPage;
