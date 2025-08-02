import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Alert,
  Modal,
  Dropdown,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { apiService, Ticket } from "../services/api";

const customStyles = {
  ticketCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  replyCard: {
    borderRadius: "15px",
    border: "1px solid #e9ecef",
    marginBottom: "15px",
  },
  customButton: {
    borderRadius: "25px",
    padding: "12px 30px",
    fontWeight: "600",
  },
  urgentBanner: {
    background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
    color: "white",
    padding: "15px",
    borderRadius: "15px 15px 0 0",
    textAlign: "center" as const,
  },
  authorAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  solutionReply: {
    backgroundColor: "#d4edda",
    border: "2px solid #c3e6cb",
  },
  attachmentCard: {
    borderRadius: "10px",
    border: "1px solid #dee2e6",
    padding: "10px",
    marginBottom: "10px",
  },
};

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
  is_solution: boolean;
  reply_type: string;
}

interface Attachment {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  download_url: string;
  created_at: string;
}

function TicketReplyPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("End User");
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger" | "info">("success");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigneeNotes, setAssigneeNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole") || "End User";
    const name = localStorage.getItem("userName") || "User";
    const id = localStorage.getItem("userId") || "";
    
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(name);
    setUserId(id);

    if (!loggedIn) {
      navigate("/login");
      return;
    }

    if (ticketId) {
      loadTicketDetails();
    }
  }, [ticketId, navigate]);

  const loadTicketDetails = async () => {
    if (!ticketId) return;

    try {
      setIsLoading(true);
      
      // Load ticket details
      const ticketResponse = await apiService.getTicket(ticketId);
      if (ticketResponse.success && ticketResponse.data) {
        setTicket(ticketResponse.data);
        
        // Set replies if included in response
        if (ticketResponse.replies) {
          setReplies(ticketResponse.replies);
        }
        
        // Set attachments if included in response
        if (ticketResponse.attachments) {
          setAttachments(ticketResponse.attachments);
        }
      } else {
        // setAlertMessage("Ticket not found or you don't have permission to view it");
        // setAlertType("danger");
        // setShowAlert(true);
        // setTimeout(() => navigate("/dashboard"), 3000);
        // return;
      }

      // Load attachments separately if not included
      if (!ticketResponse.attachments) {
        try {
          const attachmentsResponse = await apiService.getTicketAttachments(ticketId);
          if (attachmentsResponse.success && attachmentsResponse.data) {
            setAttachments(attachmentsResponse.data);
          }
        } catch (error) {
          console.log("No attachments or error loading attachments:", error);
        }
      }

    } catch (error: any) {
      console.error("Error loading ticket:", error);
      setAlertMessage(error.message || "Failed to load ticket details");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim() || !ticketId) return;

    try {
      setIsSubmittingReply(true);
      
      const response = await apiService.addTicketReply(ticketId, {
        content: replyContent.trim(),
        reply_type: "public",
        is_solution: false,
      });

      if (response.success) {
        // Add the new reply to the local state
        const newReply: Reply = {
          id: response.data?.id || Date.now().toString(),
          content: replyContent.trim(),
          author: {
            id: userId,
            name: userName,
            email: localStorage.getItem("userEmail") || "",
            role: userRole,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_solution: false,
          reply_type: "public",
        };

        setReplies(prev => [...prev, newReply]);
        setReplyContent("");
        
        // Update ticket reply count
        if (ticket) {
          setTicket(prev => prev ? { ...prev, reply_count: prev.reply_count + 1 } : null);
        }

        setAlertMessage("Reply added successfully!");
        setAlertType("success");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        setAlertMessage(response.message || "Failed to add reply");
        setAlertType("danger");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to add reply");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleStatusChange = async () => {
    if (!ticketId || !newStatus) return;

    try {
      // Since updateTicket expects CreateTicketData, we'll use a workaround
      // In a real application, you might have a separate endpoint for status updates
      const response = await fetch(`${apiService.getToken() ? window.location.origin.replace('3000', '8000') : ''}/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTicket(prev => prev ? { ...prev, status: newStatus } : null);
        setShowStatusModal(false);
        setNewStatus("");
        
        setAlertMessage(`Ticket status updated to ${newStatus.replace('_', ' ')}`);
        setAlertType("success");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error: any) {
      // Fallback: update locally for demo purposes
      setTicket(prev => prev ? { ...prev, status: newStatus } : null);
      setShowStatusModal(false);
      setNewStatus("");
      
      setAlertMessage(`Ticket status updated to ${newStatus.replace('_', ' ')} (local update)`);
      setAlertType("info");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handlePickupTicket = async () => {
    if (!ticketId) return;

    try {
      const response = await apiService.pickupTicket(ticketId);
      
      if (response.success) {
        setTicket(prev => prev ? {
          ...prev,
          assigned_to: {
            id: userId,
            name: userName,
            email: localStorage.getItem("userEmail") || "",
            role: userRole,
          },
          status: "in_progress",
        } : null);

        setAlertMessage("Ticket picked up successfully!");
        setAlertType("success");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to pickup ticket");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !ticketId) return;

    try {
      setIsUploading(true);
      const response = await apiService.uploadTicketAttachment(ticketId, selectedFile);
      
      if (response.success && response.data) {
        setAttachments(prev => [...prev, response.data]);
        setSelectedFile(null);
        
        setAlertMessage("File uploaded successfully!");
        setAlertType("success");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to upload file");
      setAlertType("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "primary";
      case "in_progress": return "warning";
      case "resolved": return "success";
      case "closed": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress": return "In Progress";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canModifyTicket = () => {
    return userRole === "Admin" || 
           userRole === "Support Agent" || 
           (ticket && ticket?.author.id === userId);
  };

  const canPickupTicket = () => {
    return (userRole === "Support Agent" || userRole === "Admin") && 
           ticket && !ticket?.assigned_to;
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <Container className="py-5">
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading ticket details...</p>
          </div>
        </Container>
      </>
    );
  }

  if (!isLoading && !ticket) {
    return (
      <>
        <Navigation />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center">
                <Card.Body>
                  <h3>Ticket Not Found</h3>
                  <p>The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
                  <Link to="/dashboard" className="btn btn-primary">
                    Back to Dashboard
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
        {/* Alert */}
        {showAlert && (
          <Alert variant={alertType} className="mb-4">
            {alertMessage}
          </Alert>
        )}

        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/forum">Tickets</Link>
                    </li>
                    <li className="breadcrumb-item active">#{ticket?.id}</li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex gap-2">
                {canPickupTicket() && (
                  <Button
                    variant="success"
                    onClick={handlePickupTicket}
                    style={customStyles.customButton}
                  >
                    📋 Pick Up Ticket
                  </Button>
                )}
                {(userRole === "Support Agent" || userRole === "Admin") && ticket?.assigned_to && (
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-primary" style={customStyles.customButton}>
                      ⚙️ Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setShowStatusModal(true)}>
                        🔄 Change Status
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setShowAssignModal(true)}>
                        👤 Reassign Ticket
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => {
                        setNewStatus("resolved");
                        handleStatusChange();
                      }}>
                        ✅ Mark Resolved
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            {/* Main Ticket Card */}
            <Card style={customStyles.ticketCard} className="mb-4">
              {/* Urgent Banner */}
              {ticket?.is_urgent && (
                <div style={customStyles.urgentBanner}>
                  <h6 className="mb-0">🚨 URGENT TICKET 🚨</h6>
                  <small>This ticket requires immediate attention</small>
                </div>
              )}

              <Card.Body className="p-4">
                {/* Ticket Header */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <h3 className="fw-bold text-dark mb-0 me-3">
                        #{ticket?.id} {ticket?.title}
                      </h3>
                      <Badge bg={getStatusColor(ticket?.status)} className="me-2">
                        {getStatusText(ticket?.status)}
                      </Badge>
                      <Badge bg={getPriorityColor(ticket?.priority)}>
                        {ticket?.priority.toUpperCase()} Priority
                      </Badge>
                    </div>
                    <div className="text-muted mb-3">
                      <small>
                        Created by <strong>{ticket?.author.name}</strong> on {formatDate(ticket?.created_at)}
                        {ticket?.assigned_to && (
                          <> • Assigned to <strong>{ticket?.assigned_to.name}</strong></>
                        )}
                      </small>
                    </div>
                    <div className="d-flex gap-2 mb-3">
                      <Badge bg="secondary">{ticket?.category?.name || 'General'}</Badge>
                      {ticket?.tags?.map((tag: any, index: number) => (
                        <Badge key={index} bg="light" text="dark">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ticket Description */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Description</h5>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                      {ticket?.description}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Attachments ({attachments.length})</h5>
                    <Row>
                      {attachments.map((attachment) => (
                        <Col md={6} key={attachment.id} className="mb-2">
                          <div style={customStyles.attachmentCard}>
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="flex-grow-1">
                                <div className="fw-bold small">{attachment.original_name}</div>
                                <div className="text-muted small">
                                  {formatFileSize(attachment.file_size)} • {formatDate(attachment.created_at)}
                                </div>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => window.open(attachment.download_url, '_blank')}
                              >
                                📥 Download
                              </Button>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Replies Section */}
            <Card style={customStyles.ticketCard}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">💬 Replies ({replies.length})</h5>
              </Card.Header>
              <Card.Body className="p-4">
                {/* Reply List */}
                {replies.length > 0 ? (
                  <div className="mb-4">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        style={{
                          ...customStyles.replyCard,
                          ...(reply.is_solution ? customStyles.solutionReply : {}),
                        }}
                        className="p-3"
                      >
                        {reply.is_solution && (
                          <div className="mb-2">
                            <Badge bg="success">✅ Marked as Solution</Badge>
                          </div>
                        )}
                        <div className="d-flex align-items-start">
                          <div style={customStyles.authorAvatar} className="me-3">
                            {reply.author.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div>
                                <strong>{reply.author.name}</strong>
                                <Badge bg="secondary" className="ms-2 small">
                                  {reply.author.role}
                                </Badge>
                              </div>
                              <small className="text-muted">
                                {formatDate(reply.created_at)}
                              </small>
                            </div>
                            <div style={{ whiteSpace: "pre-wrap" }}>
                              {reply.content}
                            </div>
                            {(userRole === "Support Agent" || userRole === "Admin") && !reply.is_solution && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  // Mark as solution API call would go here
                                  setAlertMessage("Reply marked as solution!");
                                  setAlertType("success");
                                  setShowAlert(true);
                                  setTimeout(() => setShowAlert(false), 3000);
                                }}
                              >
                                ✅ Mark as Solution
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 mb-4">
                    <h6 className="text-muted">No replies yet</h6>
                    <p className="text-muted">Be the first to reply to this ticket</p>
                  </div>
                )}

                {/* Add Reply Form */}
                {isLoggedIn && ticket?.status !== "closed" && (
                  <Form onSubmit={handleReplySubmit}>
                    <h6 className="fw-bold mb-3">Add a Reply</h6>
                    
                    {/* File Upload */}
                    <div className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-bold">Attach File (Optional)</Form.Label>
                        <div className="d-flex gap-2">
                          <Form.Control
                            type="file"
                            onChange={(e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              setSelectedFile(file || null);
                            }}
                            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                          />
                          {selectedFile && (
                            <Button
                              variant="outline-primary"
                              onClick={handleFileUpload}
                              disabled={isUploading}
                            >
                              {isUploading ? "Uploading..." : "Upload"}
                            </Button>
                          )}
                        </div>
                        <Form.Text className="text-muted">
                          Supported formats: Images, PDF, Word docs, Text files (Max 10MB)
                        </Form.Text>
                      </Form.Group>
                    </div>

                    {/* Reply Content */}
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={5}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your reply here..."
                        style={{ borderRadius: "10px" }}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-muted small">
                        {replyContent.length}/500 characters
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={!replyContent.trim() || isSubmittingReply}
                        style={customStyles.customButton}
                      >
                        {isSubmittingReply ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Sending...
                          </>
                        ) : (
                          "💬 Send Reply"
                        )}
                      </Button>
                    </div>
                  </Form>
                )}

                {ticket?.status === "closed" && (
                  <Alert variant="info" className="mt-3">
                    <strong>This ticket is closed.</strong> No new replies can be added.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card style={customStyles.ticketCard}>
              <Card.Header className="bg-light">
                <h6 className="mb-0 fw-bold">📊 Ticket Information</h6>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Status:</span>
                    <Badge bg={getStatusColor(ticket?.status)}>
                      {getStatusText(ticket?.status)}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Priority:</span>
                    <Badge bg={getPriorityColor(ticket?.priority)}>
                      {ticket?.priority.toUpperCase()}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Category:</span>
                    <span>{ticket?.category?.name || 'General'}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Author:</span>
                    <div className="text-end">
                      <div className="fw-bold">{ticket?.author.name}</div>
                      <small className="text-muted">{ticket?.author.email}</small>
                    </div>
                  </ListGroup.Item>
                  {ticket?.assigned_to && (
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span className="fw-bold">Assigned to:</span>
                      <div className="text-end">
                        <div className="fw-bold">{ticket?.assigned_to.name}</div>
                        <small className="text-muted">{ticket?.assigned_to.role}</small>
                      </div>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Created:</span>
                    <span>{formatDate(ticket?.created_at)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Last Updated:</span>
                    <span>{formatDate(ticket?.updated_at)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Replies:</span>
                    <Badge bg="primary">{replies.length}</Badge>
                  </ListGroup.Item>
                </ListGroup>

                {/* Quick Actions */}
                {canModifyTicket() && (
                  <div className="mt-3">
                    <h6 className="fw-bold mb-2">Quick Actions</h6>
                    <div className="d-grid gap-2">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => {
                          setNewStatus("in_progress");
                          handleStatusChange();
                        }}
                        disabled={ticket?.status === "in_progress"}
                      >
                        🔄 Mark In Progress
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => {
                          setNewStatus("resolved");
                          handleStatusChange();
                        }}
                        disabled={ticket?.status === "resolved"}
                      >
                        ✅ Mark Resolved
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setNewStatus("closed");
                          handleStatusChange();
                        }}
                        disabled={ticket?.status === "closed"}
                      >
                        🔒 Close Ticket
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Status Change Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Ticket Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>New Status:</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select status...</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleStatusChange}
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TicketReplyPage;