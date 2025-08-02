import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  forgotPasswordBg: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
  },
  forgotPasswordCard: {
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

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("danger");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      setAlertMessage("Please enter your email address");
      setAlertType("danger");
      setShowAlert(true);
      setIsLoading(false);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    try {
      const response = await apiService.forgotPassword(email);
      
      if (response.success) {
        setAlertMessage("Password reset instructions have been sent to your email.");
        setAlertType("success");
        setShowAlert(true);
        setEmail("");
      } else {
        setAlertMessage(response.message || "Failed to send reset email. Please try again.");
        setAlertType("danger");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      setAlertMessage(error instanceof Error ? error.message : "Network error. Please check your connection.");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }

    setIsLoading(false);
  };

  return (
    <div style={customStyles.forgotPasswordBg}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={5} md={7} sm={9}>
            <Card style={customStyles.forgotPasswordCard}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold text-dark mb-2">Forgot Password?</h1>
                  <p className="text-muted">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>

                {showAlert && (
                  <Alert variant={alertType} className="mb-3">
                    {alertMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="lg"
                      style={{ borderRadius: "10px" }}
                    />
                  </Form.Group>

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
                    {isLoading ? "Sending..." : "Send Reset Instructions"}
                  </Button>
                </Form>

                <div className="text-center">
                  <p className="text-muted">
                    Remember your password?{" "}
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

export default ForgotPasswordPage;