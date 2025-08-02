import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Pagination,
  InputGroup,
  Badge,
  Spinner,
} from "react-bootstrap";
import Navigation from "../components/Navigation";
import { apiService, Ticket, Category } from "../services/api";

interface TicketForumProps {}

function TicketForumPage({}: TicketForumProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [showOpenOnly, setShowOpenOnly] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const ticketsPerPage = 10;

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    
    loadTickets();
    loadCategories();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTickets({
        page: 1,
        limit: 100, // Load more tickets for client-side filtering
      });
      
      if (response.success && response.tickets) {
        setTickets(response.tickets);
        setFilteredTickets(response.tickets);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
      // Keep existing sample data as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.filter(cat => cat.is_active));
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    let filtered = [...tickets];

    // Filter by status
    if (showOpenOnly) {
      filtered = filtered.filter((ticket) => ticket.status === "open");
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === selectedStatus);
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (ticket) => ticket.category?.name === selectedCategory,
      );
    }

    // Filter by priority
    if (selectedPriority !== "All") {
      filtered = filtered.filter((ticket) => ticket.priority === selectedPriority);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.author.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort tickets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Most Recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "Most Comments":
          return b.reply_count - a.reply_count;
        case "Priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    // Urgent tickets first
    filtered.sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      return 0;
    });

    setFilteredTickets(filtered);
    setCurrentPage(1);
  }, [
    tickets,
    showOpenOnly,
    selectedCategory,
    selectedStatus,
    selectedPriority,
    sortBy,
    searchTerm,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "success";
      case "closed":
        return "secondary";
      case "in_progress":
        return "warning";
      case "resolved":
        return "info";
      default:
        return "primary";
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Pagination
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket,
  );
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <Container className="py-4">
          <div className="text-center py-5">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading tickets...</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />

      <Container className="py-4">
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="fw-bold text-dark mb-0">Support Tickets</h2>
                <p className="text-muted mb-0">Browse and track support tickets</p>
              </div>
              {isLoggedIn && (
                <Link
                  to="/create-ticket"
                  className="btn btn-primary"
                  style={{ borderRadius: "25px" }}
                >
                  ➕ Create Ticket
                </Link>
              )}
            </div>
          </Col>
        </Row>

        {/* Filters Section */}
        <Card className="mb-4" style={{ borderRadius: "15px" }}>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col lg={3} md={6}>
                <Form.Check
                  type="checkbox"
                  label="Show open tickets only"
                  checked={showOpenOnly}
                  onChange={(e) => setShowOpenOnly(e.target.checked)}
                  className="fw-medium"
                />
              </Col>
              <Col lg={2} md={6}>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="All">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col lg={2} md={6}>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="All">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Form.Select>
              </Col>
              <Col lg={2} md={6}>
                <Form.Select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="All">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Form.Select>
              </Col>
              <Col lg={2} md={6}>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="Most Recent">Most Recent</option>
                  <option value="Most Comments">Most Comments</option>
                  <option value="Priority">Priority</option>
                </Form.Select>
              </Col>
              <Col lg={1} md={6}>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setShowOpenOnly(true);
                    setSelectedCategory("All");
                    setSelectedStatus("All");
                    setSelectedPriority("All");
                    setSortBy("Most Recent");
                    setSearchTerm("");
                  }}
                  style={{ borderRadius: "10px" }}
                >
                  Clear
                </Button>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: "10px 0 0 10px" }}
                  />
                  <Button
                    variant="outline-secondary"
                    style={{ borderRadius: "0 10px 10px 0" }}
                  >
                    🔍
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tickets List */}
        <Row>
          {currentTickets.map((ticket) => (
            <Col xs={12} className="mb-3" key={ticket.id}>
              <Card
                style={{ borderRadius: "15px", border: "1px solid #e9ecef", transition: "all 0.3s ease" }}
                className="h-100 shadow-sm hover-shadow"
              >
                <Card.Body className="p-4">
                  <Row>
                    <Col xs={9}>
                      <div className="d-flex align-items-center mb-2">
                        {ticket.is_urgent && (
                          <Badge bg="danger" className="me-2 small">
                            🚨 URGENT
                          </Badge>
                        )}
                        <h5 className="fw-bold text-dark mb-0">
                          <Link
                            to={`/ticket/${ticket.id}`}
                            className="text-decoration-none text-dark"
                          >
                            #{ticket.id} {ticket.title}
                          </Link>
                        </h5>
                      </div>
                      <p className="text-muted mb-3">{ticket.description}</p>

                      {/* Tags */}
                      <div className="mb-3">
                        <Badge bg="secondary" className="me-2 mb-1">
                          {ticket.category?.name || 'General'}
                        </Badge>
                        <Badge
                          bg={getPriorityColor(ticket.priority)}
                          className="me-2 mb-1"
                        >
                          {ticket.priority.toUpperCase()} Priority
                        </Badge>
                        {ticket.tags?.map((tag: any, index: number) => (
                          <Badge
                            key={index}
                            bg="light"
                            text="dark"
                            className="me-2 mb-1"
                            style={{ borderRadius: "15px" }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>

                      <small className="text-muted">
                        Created by {ticket.author.name} • {formatDate(ticket.created_at)}
                        {ticket.assigned_to && (
                          <> • Assigned to {ticket.assigned_to.name}</>
                        )}
                      </small>
                    </Col>

                    {/* Status & Comments */}
                    <Col
                      xs={3}
                      className="d-flex flex-column align-items-end justify-content-between"
                    >
                      <Badge
                        bg={getStatusColor(ticket.status)}
                        style={{ borderRadius: "20px", padding: "8px 16px", fontWeight: "500" }}
                      >
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </Badge>

                      <div className="d-flex align-items-center">
                        <div
                          style={{
                            background: "#28a745",
                            color: "white",
                            borderRadius: "50%",
                            width: "30px",
                            height: "30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                          }}
                        >
                          {ticket.reply_count}
                        </div>
                        <span className="ms-2 small text-muted">replies</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        {totalPages > 1 && (
          <Row className="mt-4">
            <Col className="d-flex justify-content-center">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                />
              </Pagination>
            </Col>
          </Row>
        )}

        {/* No Results */}
        {currentTickets.length === 0 && !isLoading && (
          <Row>
            <Col className="text-center py-5">
              <h5 className="text-muted">No tickets found</h5>
              <p className="text-muted">
                Try adjusting your filters or search terms
              </p>
              {isLoggedIn && (
                <Link to="/create-ticket" className="btn btn-primary mt-2">
                  Create Your First Ticket
                </Link>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}

export default TicketForumPage;