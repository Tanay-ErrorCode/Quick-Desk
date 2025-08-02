import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  Modal,
  Spinner,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { apiService } from "../services/api";

const customStyles = {
  profileCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  customButton: {
    borderRadius: "25px",
    padding: "12px 30px",
    fontWeight: "600",
  },
  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    border: "3px solid #e9ecef",
    fontSize: "0.9rem",
    color: "#6c757d",
  },
  adminBadge: {
    fontSize: "0.8rem",
  },
};

interface UserProfile {
  name: string;
  email: string;
  role: string;
  categoriesOfInterest: string;
  language: string;
  phone?: string;
  department?: string;
}

function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "End User",
    categoriesOfInterest: "",
    language: "English",
    phone: "",
    department: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger" | "info">(
    "success",
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      loadUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProfile();
      
      if (response.success && response.user) {
        setProfile({
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          phone: response.user.phone || "",
          department: response.user.department || "",
          categoriesOfInterest: localStorage.getItem("userCategories") || "Technical, Development",
          language: localStorage.getItem("userLanguage") || "English",
        });

        // Update localStorage with fresh data
        localStorage.setItem("userName", response.user.name);
        localStorage.setItem("userEmail", response.user.email);
        localStorage.setItem("userRole", response.user.role);
        
        if (response.user.phone) {
          localStorage.setItem("userPhone", response.user.phone);
        }
        if (response.user.department) {
          localStorage.setItem("userDepartment", response.user.department);
        }

        // Dispatch event to update navigation
        window.dispatchEvent(new Event('authStateChanged'));
      } else {
        throw new Error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      
      // Fallback to localStorage data
      const userName = localStorage.getItem("userName") || "User";
      const userEmail = localStorage.getItem("userEmail") || "";
      const userRole = localStorage.getItem("userRole") || "End User";
      const userPhone = localStorage.getItem("userPhone") || "";
      const userDepartment = localStorage.getItem("userDepartment") || "";

      setProfile({
        name: userName,
        email: userEmail,
        role: userRole,
        phone: userPhone,
        department: userDepartment,
        categoriesOfInterest: localStorage.getItem("userCategories") || "Technical, Development",
        language: localStorage.getItem("userLanguage") || "English",
      });

      setAlertMessage("Unable to load latest profile data. Showing cached information.");
      setAlertType("info");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

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
    // For now, save preferences to localStorage
    // In a real app, you would make an API call to update the profile
    localStorage.setItem("userName", profile.name);
    localStorage.setItem("userCategories", profile.categoriesOfInterest);
    localStorage.setItem("userLanguage", profile.language);

    setIsEditing(false);
    setAlertMessage("Profile updated successfully!");
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);

    // Dispatch event to update navigation
    window.dispatchEvent(new Event('authStateChanged'));
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

  if (isLoading) {
    return (
      <>
        <Navigation />
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={8} md={10}>
              <Card style={customStyles.profileCard}>
                <Card.Body className="p-5 text-center">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading profile...</p>
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
                    {profile.name.charAt(0).toUpperCase()}
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
                        <Form.Label className="fw-bold">Phone:</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="123-456-7890"
                          size="lg"
                          style={{ borderRadius: "10px" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Department:</Form.Label>
                        <Form.Control
                          type="text"
                          name="department"
                          value={profile.department}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="e.g., IT, HR, Sales"
                          size="lg"
                          style={{ borderRadius: "10px" }}
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
                            Request Upgrade
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
                          Language:
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
                          onClick={() => {
                            setIsEditing(false);
                            loadUserProfile(); // Reset to original data
                          }}
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