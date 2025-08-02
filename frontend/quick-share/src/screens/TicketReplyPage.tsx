import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Alert,
  Dropdown,
} from "react-bootstrap";
import Navigation from "../components/Navigation";

const customStyles = {
  questionCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  replyCard: {
    borderRadius: "15px",
    border: "none",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
    marginBottom: "15px",
  },
  adminOnlySection: {
    background: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)",
    borderRadius: "15px",
    border: "2px solid #e17055",
  },
  creatorSection: {
    background: "linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%)",
    borderRadius: "15px",
    border: "2px solid #00b894",
  },
  shareButton: {
    borderRadius: "25px",
    padding: "8px 20px",
    fontWeight: "600",
  },
  replyButton: {
    borderRadius: "25px",
    padding: "10px 25px",
    fontWeight: "600",
  },
  noAnswersBox: {
    background: "linear-gradient(135deg, #ddd6fe 0%, #e0e7ff 100%)",
    borderRadius: "15px",
    border: "2px dashed #8b5cf6",
    padding: "40px",
    textAlign: "center" as const,
  },
};

interface TicketData {
  id: number;
  title: string;
  description: string;
  category: string;
  author: string;
  authorRole: string;
  createdAt: string;
  status: "open" | "answered" | "closed";
  priority: "low" | "medium" | "high";
  replies: Reply[];
}

interface Reply {
  id: number;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  isStaff: boolean;
  isCreator: boolean;
  replyType: "staff_reply" | "creator_clarification";
}

function TicketReplyPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [shareableLink, setShareableLink] = useState("");

  // Check if user can reply (Admin/Staff OR ticket creator)
  const isStaff =
    userRole === "Admin" ||
    userRole === "Staff" ||
    userRole === "Support Agent";
  const isTicketCreator = ticket && userName === ticket.author;
  const canReply = isStaff || isTicketCreator;

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole") || "End User";
    const name = localStorage.getItem("userName") || "User";
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(name);

    // Load sample ticket data
    const sampleTicket: TicketData = {
      id: parseInt(ticketId || "1"),
      title: "Is it good things to use AI for hackathon?",
      description: "I am participating in odoo IN hackathon - 2025.",
      category: "Development",
      author: "Mitchell Admin",
      authorRole: "Admin",
      createdAt: "1 second ago",
      status: "open",
      priority: "medium",
      replies: [
        // Sample replies showing both staff and creator replies
        {
          id: 1,
          content:
            "Yes, using AI in hackathons can be very beneficial! It can help you build innovative solutions faster.",
          author: "Support Team",
          authorRole: "Support Agent",
          createdAt: "30 minutes ago",
          isStaff: true,
          isCreator: false,
          replyType: "staff_reply",
        },
        {
          id: 2,
          content:
            "Thanks for the reply! Just to clarify - I'm specifically looking for advice on using ChatGPT API for generating code suggestions. Is this allowed in the competition rules?",
          author: "Mitchell Admin",
          authorRole: "Admin",
          createdAt: "25 minutes ago",
          isStaff: false,
          isCreator: true,
          replyType: "creator_clarification",
        },
      ],
    };

    setTicket(sampleTicket);
    setShareableLink(`${window.location.origin}/ticket/${ticketId}/share`);
  }, [ticketId]);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply: Reply = {
      id: Date.now(),
      content: replyText,
      author: userName,
      authorRole: userRole,
      createdAt: "Just now",
      isStaff: isStaff,
      isCreator: isTicketCreator || false,
      replyType: isStaff ? "staff_reply" : "creator_clarification",
    };

    setTicket((prev) =>
      prev
        ? {
            ...prev,
            replies: [...prev.replies, newReply],
            status: isStaff ? ("answered" as const) : prev.status,
          }
        : null,
    );

    setReplyText("");
    setShowReplyForm(false);
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableLink);
    alert("Shareable link copied to clipboard!");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "primary";
      case "answered":
        return "success";
      case "closed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getReplyIcon = (reply: Reply) => {
    if (reply.isStaff) return "🛠️";
    if (reply.isCreator) return "💭";
    return "💬";
  };

  const getReplyBorderColor = (reply: Reply) => {
    if (reply.isStaff) return "border-success";
    if (reply.isCreator) return "border-info";
    return "border-secondary";
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="text-center shadow">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Please log in to view tickets</h3>
                  <Link to="/login" className="btn btn-primary btn-lg">
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

  if (!ticket) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="text-center">
                <Card.Body className="p-4">
                  <h3>Ticket not found</h3>
                  <Link to="/forum" className="btn btn-primary mt-3">
                    Back to Forum
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

      <Container className="py-4">
        {/* Breadcrumb */}
        <Row className="mb-3">
          <Col xs={12}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/forum" className="text-decoration-none">
                    Forum
                  </Link>
                </li>
                <li className="breadcrumb-item active">Ticket #{ticket.id}</li>
              </ol>
            </nav>
          </Col>
        </Row>

        <Row>
          {/* Main Content */}
          <Col xs={12} lg={8}>
            {/* Question Card */}
            <Card style={customStyles.questionCard}>
              <Card.Body className="p-4">
                {/* Question Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1 mb-3 mb-md-0">
                    <h2 className="fw-bold text-dark mb-2">{ticket.title}</h2>
                    <Badge bg="primary" className="me-2 mb-2">
                      {ticket.category}
                    </Badge>
                    <Badge
                      bg={getPriorityColor(ticket.priority)}
                      className="me-2 mb-2"
                    >
                      {ticket.priority.toUpperCase()} Priority
                    </Badge>
                    <Badge bg={getStatusColor(ticket.status)} className="mb-2">
                      {ticket.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Share Button */}
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-primary"
                      size="sm"
                      style={customStyles.shareButton}
                    >
                      🔗 Share
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={copyShareableLink}>
                        📋 Copy Link
                      </Dropdown.Item>
                      <Dropdown.Item
                        href={`mailto:?subject=${encodeURIComponent(ticket.title)}&body=${encodeURIComponent(shareableLink)}`}
                      >
                        📧 Email Link
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {/* Question Author Info */}
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <div
                      className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{ width: "40px", height: "40px" }}
                    >
                      {ticket.author.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="fw-bold">
                      {ticket.author}
                      <Badge bg="info" className="ms-2 small">
                        {ticket.authorRole}
                      </Badge>
                      {isTicketCreator && (
                        <Badge bg="warning" className="ms-1 small">
                          You
                        </Badge>
                      )}
                    </div>
                    <small className="text-muted">
                      Asked {ticket.createdAt}
                    </small>
                  </div>
                </div>

                {/* Question Content */}
                <div className="question-content">
                  <p className="mb-0">{ticket.description}</p>
                </div>
              </Card.Body>
            </Card>

            {/* Replies Section */}
            <Card style={customStyles.questionCard}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">
                  💬 Answers & Discussion ({ticket.replies.length})
                </h5>

                {ticket.replies.length === 0 ? (
                  /* No Answers Yet */
                  <div style={customStyles.noAnswersBox}>
                    <div className="display-4 mb-3">🤔</div>
                    <h6 className="fw-bold text-dark mb-2">
                      There are no answers yet
                    </h6>
                    <p className="text-muted mb-3">
                      Be the first to answer this question
                    </p>

                    {canReply ? (
                      <Button
                        variant="primary"
                        style={customStyles.replyButton}
                        onClick={() => setShowReplyForm(true)}
                      >
                        💬 {isStaff ? "Reply" : "Add Clarification"}
                      </Button>
                    ) : (
                      <Alert variant="warning" className="mt-3 mb-0">
                        <small>
                          <strong>Note:</strong> Only Support Agents, Admins,
                          and the question author can reply to tickets.
                        </small>
                      </Alert>
                    )}
                  </div>
                ) : (
                  /* Display Replies */
                  <>
                    {ticket.replies.map((reply) => (
                      <Card
                        key={reply.id}
                        style={customStyles.replyCard}
                        className={`mb-3 ${getReplyBorderColor(reply)} border-start border-4`}
                      >
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-start">
                            <div className="me-3">
                              <div
                                className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${reply.isStaff ? "bg-success" : reply.isCreator ? "bg-info" : "bg-secondary"}`}
                                style={{ width: "35px", height: "35px" }}
                              >
                                {reply.author.charAt(0)}
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <span className="me-2">
                                  {getReplyIcon(reply)}
                                </span>
                                <span className="fw-bold me-2">
                                  {reply.author}
                                </span>
                                <Badge
                                  bg={
                                    reply.isStaff
                                      ? "success"
                                      : reply.isCreator
                                        ? "info"
                                        : "secondary"
                                  }
                                  className="me-2 small"
                                >
                                  {reply.authorRole}
                                </Badge>
                                {reply.isCreator && (
                                  <Badge bg="warning" className="me-2 small">
                                    Question Author
                                  </Badge>
                                )}
                                {reply.replyType ===
                                  "creator_clarification" && (
                                  <Badge
                                    bg="outline-info"
                                    className="me-2 small"
                                  >
                                    Clarification
                                  </Badge>
                                )}
                                <small className="text-muted">
                                  {reply.createdAt}
                                </small>
                              </div>
                              <p className="mb-0">{reply.content}</p>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}

                    {/* Reply Button for Existing Answers */}
                    {canReply && (
                      <div className="text-center">
                        <Button
                          variant={isStaff ? "outline-success" : "outline-info"}
                          style={customStyles.replyButton}
                          onClick={() => setShowReplyForm(true)}
                        >
                          {isStaff ? "🛠️ Staff Reply" : "💭 Add Clarification"}
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* Reply Form */}
                {showReplyForm && canReply && (
                  <Card
                    style={
                      isStaff
                        ? customStyles.adminOnlySection
                        : customStyles.creatorSection
                    }
                    className="mt-4"
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <span className="fw-bold text-dark">
                          {isStaff
                            ? "🔒 Staff Reply Section"
                            : "💭 Clarification Section"}
                        </span>
                        <Badge
                          bg={isStaff ? "warning" : "info"}
                          className="ms-2"
                        >
                          {isStaff
                            ? "Visible only to Support Agents & Admins"
                            : "You can add clarifications to your question"}
                        </Badge>
                      </div>

                      <Form onSubmit={handleReplySubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            {isStaff ? "Your Reply" : "Your Clarification"}
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={
                              isStaff
                                ? "Type your answer here..."
                                : "Add additional details or clarify your question..."
                            }
                            required
                          />
                          {!isStaff && (
                            <Form.Text className="text-muted">
                              💡 Use this to add forgotten details, clarify
                              requirements, or provide additional context.
                            </Form.Text>
                          )}
                        </Form.Group>

                        <div className="d-flex gap-2">
                          <Button
                            type="submit"
                            variant={isStaff ? "success" : "info"}
                            style={customStyles.replyButton}
                            disabled={!replyText.trim()}
                          >
                            {isStaff ? "✅ Post Reply" : "💭 Add Clarification"}
                          </Button>
                          <Button
                            variant="outline-secondary"
                            style={customStyles.replyButton}
                            onClick={() => {
                              setShowReplyForm(false);
                              setReplyText("");
                            }}
                          >
                            ❌ Cancel
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={12} lg={4}>
            <Card style={customStyles.questionCard}>
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">📋 Ticket Information</h6>

                <div className="mb-3">
                  <small className="text-muted d-block">Ticket ID</small>
                  <span className="fw-bold">#{ticket.id}</span>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Status</small>
                  <Badge bg={getStatusColor(ticket.status)}>
                    {ticket.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Priority</small>
                  <Badge bg={getPriorityColor(ticket.priority)}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Category</small>
                  <Badge bg="primary">{ticket.category}</Badge>
                </div>

                <div className="mb-4">
                  <small className="text-muted d-block">Created</small>
                  <span>{ticket.createdAt}</span>
                </div>

                <div className="d-grid gap-2">
                  <Link to="/forum" className="btn btn-outline-primary btn-sm">
                    ← Back to Forum
                  </Link>
                  <Link to="/create-ticket" className="btn btn-primary btn-sm">
                    ➕ Ask New Question
                  </Link>
                </div>

                {/* Updated information message */}
                {!canReply && (
                  <Alert variant="info" className="mt-3 mb-0">
                    <small>
                      <strong>ℹ️ Note:</strong> Only Support Agents, Admins, and
                      the question author can reply to tickets.
                    </small>
                  </Alert>
                )}

                {isTicketCreator && (
                  <Alert variant="success" className="mt-3 mb-0">
                    <small>
                      <strong>✅ Your Question:</strong> You can add
                      clarifications or additional details to help others
                      understand your question better.
                    </small>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default TicketReplyPage;
