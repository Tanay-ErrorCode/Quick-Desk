import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Alert,
  Modal,
} from "react-bootstrap";
import Navigation from "../components/Navigation";

const customStyles = {
  profileCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "0.9rem",
    fontWeight: "bold",
    margin: "0 auto",
  },
  customButton: {
    borderRadius: "25px",
    padding: "10px 25px",
    fontWeight: "600",
  },
  adminBadge: {
    borderRadius: "20px",
    padding: "8px 16px",
    fontWeight: "500",
  },
};

interface UserProfile {
  name: string;
  email: string;
  role: "End User" | "Support Agent" | "Admin";
  categoriesOfInterest: string;
  language: string;
  profileImage?: string;
}

function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "End User",
    categoriesOfInterest: "",
    language: "English",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger" | "info">(
    "success",
  );

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const userEmail = localStorage.getItem("userEmail") || "";
      const userName = localStorage.getItem("userName") || "User";
      const userRole =
        (localStorage.getItem("userRole") as UserProfile["role"]) || "End User";

      setProfile({
        name: userName,
        email: userEmail,
        role: userRole,
        categoriesOfInterest:
          localStorage.getItem("userCategories") || "Technical, Development",
        language: localStorage.getItem("userLanguage") || "English",
      });
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    localStorage.setItem("userName", profile.name);
    localStorage.setItem("userCategories", profile.categoriesOfInterest);
    localStorage.setItem("userLanguage", profile.language);

    setIsEditing(false);
    setAlertMessage("Profile updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleUpgradeRequest = () => {
    setShowUpgradeModal(false);
    setAlertMessage("Upgrade request sent to admin for review!");
    setAlertType("info");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);

    localStorage.setItem("upgradeRequestPending", "true");
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

  const isPendingUpgrade =
    localStorage.getItem("upgradeRequestPending") === "true";

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center">
                <Card.Body>
                  <h3>Please log in to view your profile</h3>
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

        {/* Alert */}
        {showAlert && (
          <Alert variant={alertType} className="mb-4">
            {alertMessage}
          </Alert>
        )}

        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <Card style={customStyles.profileCard}>
              <Card.Body className="p-5">
                {/* Profile Header */}
                <div className="text-center mb-4">
                  <div style={customStyles.profileImage} className="mb-3">
                    Profile Image
                  </div>
                  <h4 className="fw-bold text-dark mb-2">
                    {profile.name}
                    <Badge
                      bg={getRoleBadgeColor(profile.role)}
                      className="ms-3"
                      style={customStyles.adminBadge}
                    >
                      {profile.role}
                    </Badge>
                  </h4>
                  <h5 className="text-primary mb-4">Profile</h5>
                </div>

                {/* Profile Form */}
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Name:</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          size="lg"
                          style={{ borderRadius: "10px" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Email:</Form.Label>
                        <Form.Control
                          type="email"
                          value={profile.email}
                          disabled
                          size="lg"
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f8f9fa",
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Role:</Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.role}
                          disabled
                          size="lg"
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f8f9fa",
                          }}
                        />
                        {profile.role === "End User" && !isPendingUpgrade && (
                          <Button
                            variant="success"
                            size="sm"
                            className="mt-2"
                            onClick={() => setShowUpgradeModal(true)}
                            style={customStyles.customButton}
                          >
                            Upgrade
                          </Button>
                        )}
                        {isPendingUpgrade && (
                          <Badge bg="warning" className="mt-2 d-block w-auto">
                            Upgrade request pending admin approval
                          </Badge>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Categories of Interest:
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="categoriesOfInterest"
                          value={profile.categoriesOfInterest}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="e.g., Technical, Development, Support"
                          size="lg"
                          style={{ borderRadius: "10px" }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Change Language:
                        </Form.Label>
                        <Form.Select
                          name="language"
                          value={profile.language}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          size="lg"
                          style={{ borderRadius: "10px" }}
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Español</option>
                          <option value="French">Français</option>
                          <option value="German">Deutsch</option>
                          <option value="Hindi">हिंदी</option>
                          <option value="Chinese">中文</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Action Buttons */}
                  <div className="text-center mt-4">
                    {isEditing ? (
                      <div className="d-flex gap-3 justify-content-center">
                        <Button
                          variant="success"
                          onClick={handleSaveProfile}
                          style={customStyles.customButton}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setIsEditing(false)}
                          style={customStyles.customButton}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                        style={customStyles.customButton}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Upgrade Request Modal */}
      <Modal
        show={showUpgradeModal}
        onHide={() => setShowUpgradeModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Request Role Upgrade</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are requesting to upgrade your role from{" "}
            <strong>End User</strong> to <strong>Support Agent</strong>.
          </p>
          <Form.Group>
            <Form.Label>Reason for upgrade request:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={upgradeMessage}
              onChange={(e) => setUpgradeMessage(e.target.value)}
              placeholder="Please explain why you need this upgrade..."
            />
          </Form.Group>
          <Alert variant="info" className="mt-3 mb-0">
            <small>
              Your request will be sent to the admin for review. You will be
              notified once a decision is made.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUpgradeModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpgradeRequest}
            disabled={!upgradeMessage.trim()}
          >
            Send Request
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ProfilePage;
