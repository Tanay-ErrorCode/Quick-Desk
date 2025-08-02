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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (email && password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        navigate("/forum");
      } else {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
      setIsLoading(false);
    }, 1000);
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
                  <Alert variant="danger" className="mb-3">
                    Please enter both email and password
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
